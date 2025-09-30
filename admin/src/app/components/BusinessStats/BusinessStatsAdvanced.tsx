// components/BusinessStats/BusinessStatsAdvanced.tsx
'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { businessService, Business } from '../../services/businessService';

interface BusinessStatsAdvancedProps {
  refreshTrigger?: number;
}

export interface BusinessStatsAdvancedRef {
  refresh: () => void;
}

interface DetailedStats {
  total: number;
  approved: number;
  pending: number;
  approvedPercentage: number;
  pendingPercentage: number;
  todayRegistered: number;
  thisWeekRegistered: number;
  thisMonthRegistered: number;
  recentApprovalRate: number;
  averageProcessingDays: number;
}

const BusinessStatsAdvanced = forwardRef<BusinessStatsAdvancedRef, BusinessStatsAdvancedProps>(
  ({ refreshTrigger }, ref) => {
    const [stats, setStats] = useState<DetailedStats>({
      total: 0,
      approved: 0,
      pending: 0,
      approvedPercentage: 0,
      pendingPercentage: 0,
      todayRegistered: 0,
      thisWeekRegistered: 0,
      thisMonthRegistered: 0,
      recentApprovalRate: 0,
      averageProcessingDays: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useImperativeHandle(ref, () => ({
      refresh: loadStats
    }));

    useEffect(() => {
      loadStats();
    }, [refreshTrigger]);

    const loadStats = async () => {
      try {
        setLoading(true);
        setError('');
        
        
        // SỬ DỤNG CÙNG API VỚI BUSINESSTABLE
        const [approvedResponse, allResponse] = await Promise.all([
          businessService.getApprovedBusiness(), // API /api/approved-business
          businessService.getAllBusinesses()       // API /api/business
        ]);
        
        
        if (approvedResponse.success && allResponse.success) {
          const approvedBusinesses = approvedResponse.data || [];
          const allBusinesses = allResponse.data || [];
          
          const total = allBusinesses.length;
          const approved = approvedBusinesses.length; // Từ API approved trực tiếp
          const pending = total - approved; // Tính toán
          
          const approvedPercentage = total > 0 ? Math.round((approved / total) * 100) : 0;
          const pendingPercentage = total > 0 ? Math.round((pending / total) * 100) : 0;
          
          // Thống kê theo thời gian
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          
          const todayRegistered = allBusinesses.filter(business => {
            const createdAt = new Date(business.createdAt);
            return createdAt >= today;
          }).length;
          
          const thisWeekRegistered = allBusinesses.filter(business => {
            const createdAt = new Date(business.createdAt);
            return createdAt >= weekAgo;
          }).length;
          
          const thisMonthRegistered = allBusinesses.filter(business => {
            const createdAt = new Date(business.createdAt);
            return createdAt >= monthAgo;
          }).length;
          
          // Tỷ lệ duyệt gần đây (30 ngày qua)
          const recentBusinesses = allBusinesses.filter(business => {
            const createdAt = new Date(business.createdAt);
            return createdAt >= monthAgo;
          });
          
          const recentApproved = approvedBusinesses.filter(business => {
            const createdAt = new Date(business.createdAt);
            return createdAt >= monthAgo;
          });
          
          const recentApprovalRate = recentBusinesses.length > 0 
            ? Math.round((recentApproved.length / recentBusinesses.length) * 100)
            : 0;
          
          // Thời gian xử lý trung bình (chỉ tính cho approved businesses)
          let averageProcessingDays = 0;
          if (approvedBusinesses.length > 0) {
            const processedBusinesses = approvedBusinesses.filter(business => 
              business.createdAt && business.updatedAt
            );
            
            if (processedBusinesses.length > 0) {
              const totalProcessingTime = processedBusinesses.reduce((sum, business) => {
                const created = new Date(business.createdAt).getTime();
                const updated = new Date(business.updatedAt).getTime();
                return sum + (updated - created);
              }, 0);
              
              averageProcessingDays = Math.round(totalProcessingTime / (processedBusinesses.length * 24 * 60 * 60 * 1000));
            }
          }
          
          const newStats: DetailedStats = {
            total,
            approved,
            pending,
            approvedPercentage,
            pendingPercentage,
            todayRegistered,
            thisWeekRegistered,
            thisMonthRegistered,
            recentApprovalRate,
            averageProcessingDays
          };
          
          setStats(newStats);
        } else {
          setError('Không thể tải thống kê');
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Lỗi kết nối API';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    if (loading) {
      return (
        <div className="row mb-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="col-md-3 mb-3">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                <div className="card-body text-center p-4">
                  <div className="spinner-border spinner-border-sm text-primary mb-3" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                  </div>
                  <div className="placeholder-glow">
                    <span className="placeholder col-6"></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-warning" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Không thể tải thống kê: {error}
              <button className="btn btn-outline-warning btn-sm ms-3" onClick={loadStats}>
                Thử lại
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <>
        {/* Thống kê chính */}
        <div className="row mb-4">
          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
              <div className="card-body text-center p-4">
                <div className="d-flex justify-content-center align-items-center mb-3">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-building text-primary fs-4"></i>
                  </div>
                </div>
                <h3 className="fw-bold text-primary mb-1">{stats.total}</h3>
                <p className="text-muted mb-0">Tổng doanh nghiệp</p>
                <small className="text-success">
                  <i className="bi bi-plus-circle me-1"></i>
                  +{stats.todayRegistered} hôm nay
                </small>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
              <div className="card-body text-center p-4">
                <div className="d-flex justify-content-center align-items-center mb-3">
                  <div className="bg-success bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-check-circle text-success fs-4"></i>
                  </div>
                </div>
                <h3 className="fw-bold text-success mb-1">{stats.approved}</h3>
                <p className="text-muted mb-2">Đã duyệt</p>
                <div className="progress mb-2" style={{ height: '6px' }}>
                  <div 
                    className="progress-bar bg-success" 
                    style={{ width: `${stats.approvedPercentage}%` }}
                  ></div>
                </div>
                <small className="text-muted">
                  {stats.approvedPercentage}% tổng hồ sơ
                </small>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
              <div className="card-body text-center p-4">
                <div className="d-flex justify-content-center align-items-center mb-3">
                  <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-clock text-warning fs-4"></i>
                  </div>
                </div>
                <h3 className="fw-bold text-warning mb-1">{stats.pending}</h3>
                <p className="text-muted mb-2">Chờ duyệt</p>
                <div className="progress mb-2" style={{ height: '6px' }}>
                  <div 
                    className="progress-bar bg-warning" 
                    style={{ width: `${stats.pendingPercentage}%` }}
                  ></div>
                </div>
                <small className="text-muted">
                  {stats.pendingPercentage}% tổng hồ sơ
                </small>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
              <div className="card-body text-center p-4">
                <div className="d-flex justify-content-center align-items-center mb-3">
                  <div className="bg-info bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-speedometer2 text-info fs-4"></i>
                  </div>
                </div>
                <h3 className="fw-bold text-info mb-1">{stats.recentApprovalRate}%</h3>
                <p className="text-muted mb-0">Tỷ lệ duyệt</p>
                <small className="text-muted">
                  <i className="bi bi-calendar-week me-1"></i>
                  30 ngày qua
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Thống kê bổ sung */}
        <div className="row mb-4">
          <div className="col-md-4 mb-3">
            <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
              <div className="card-body p-4">
                <h6 className="card-title mb-3">
                  <i className="bi bi-calendar-week me-2 text-primary"></i>
                  Đăng ký tuần này
                </h6>
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h4 className="fw-bold text-primary mb-1">{stats.thisWeekRegistered}</h4>
                    <small className="text-muted">doanh nghiệp mới</small>
                  </div>
                  <div className="text-end">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                      <i className="bi bi-graph-up-arrow text-primary"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
              <div className="card-body p-4">
                <h6 className="card-title mb-3">
                  <i className="bi bi-calendar-month me-2 text-success"></i>
                  Đăng ký tháng này
                </h6>
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h4 className="fw-bold text-success mb-1">{stats.thisMonthRegistered}</h4>
                    <small className="text-muted">doanh nghiệp mới</small>
                  </div>
                  <div className="text-end">
                    <div className="bg-success bg-opacity-10 rounded-circle p-2">
                      <i className="bi bi-calendar-check text-success"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
              <div className="card-body p-4">
                <h6 className="card-title mb-3">
                  <i className="bi bi-stopwatch me-2 text-warning"></i>
                  Thời gian xử lý
                </h6>
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h4 className="fw-bold text-warning mb-1">
                      {stats.averageProcessingDays}
                      <small className="fs-6 fw-normal"> ngày</small>
                    </h4>
                    <small className="text-muted">trung bình</small>
                  </div>
                  <div className="text-end">
                    <div className="bg-warning bg-opacity-10 rounded-circle p-2">
                      <i className="bi bi-hourglass-split text-warning"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Biểu đồ tỷ lệ */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
              <div className="card-header bg-light" style={{ borderRadius: '15px 15px 0 0' }}>
                <h6 className="mb-0">
                  <i className="bi bi-pie-chart me-2 text-info"></i>
                  Tỷ lệ trạng thái doanh nghiệp
                </h6>
              </div>
              <div className="card-body p-4">
                <div className="row align-items-center">
                  <div className="col-md-8">
                    {/* Progress bars */}
                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-semibold text-success">
                          <i className="bi bi-check-circle me-2"></i>
                          Đã duyệt
                        </span>
                        <span className="fw-bold text-success">{stats.approved} ({stats.approvedPercentage}%)</span>
                      </div>
                      <div className="progress mb-3" style={{ height: '12px' }}>
                        <div 
                          className="progress-bar bg-success" 
                          style={{ width: `${stats.approvedPercentage}%` }}
                          aria-valuenow={stats.approvedPercentage}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        ></div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-semibold text-warning">
                          <i className="bi bi-clock me-2"></i>
                          Chờ duyệt
                        </span>
                        <span className="fw-bold text-warning">{stats.pending} ({stats.pendingPercentage}%)</span>
                      </div>
                      <div className="progress mb-3" style={{ height: '12px' }}>
                        <div 
                          className="progress-bar bg-warning" 
                          style={{ width: `${stats.pendingPercentage}%` }}
                          aria-valuenow={stats.pendingPercentage}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="text-center">
                      {/* Simple donut chart representation */}
                      <div className="position-relative d-inline-block">
                        <div 
                          className="rounded-circle border border-5 border-success d-flex align-items-center justify-content-center"
                          style={{ 
                            width: '120px', 
                            height: '120px',
                            background: `conic-gradient(#198754 0deg ${stats.approvedPercentage * 3.6}deg, #ffc107 ${stats.approvedPercentage * 3.6}deg 360deg)`
                          }}
                        >
                          <div 
                            className="rounded-circle bg-white d-flex align-items-center justify-content-center"
                            style={{ width: '80px', height: '80px' }}
                          >
                            <div className="text-center">
                              <div className="fw-bold fs-5">{stats.total}</div>
                              <small className="text-muted">Tổng</small>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="d-flex justify-content-center gap-3">
                          <div className="text-center">
                            <div className="d-flex align-items-center">
                              <div className="bg-success rounded-circle me-2" style={{ width: '12px', height: '12px' }}></div>
                              <small>Đã duyệt</small>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="d-flex align-items-center">
                              <div className="bg-warning rounded-circle me-2" style={{ width: '12px', height: '12px' }}></div>
                              <small>Chờ duyệt</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
);

BusinessStatsAdvanced.displayName = 'BusinessStatsAdvanced';

export default BusinessStatsAdvanced;