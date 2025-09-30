// components/IndividualStats/IndividualStatsAdvanced.tsx
'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { individualService, Individual } from '../../services/IndividualServices';

interface IndividualStatsAdvancedProps {
  refreshTrigger?: number;
}

export interface IndividualStatsAdvancedRef {
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
  ageDistribution: {
    under25: number;
    age25to35: number;
    age35to50: number;
    over50: number;
  };
  topNationalities: Array<{nationality: string; count: number}>;
}

const IndividualStatsAdvanced = forwardRef<IndividualStatsAdvancedRef, IndividualStatsAdvancedProps>(
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
      averageProcessingDays: 0,
      ageDistribution: {
        under25: 0,
        age25to35: 0,
        age35to50: 0,
        over50: 0
      },
      topNationalities: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useImperativeHandle(ref, () => ({
      refresh: loadStats
    }));

    useEffect(() => {
      loadStats();
    }, [refreshTrigger]);

    const calculateAge = (dateOfBirth: string): number => {
      try {
        const today = new Date();
        const birth = new Date(dateOfBirth);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
          age--;
        }
        
        return age;
      } catch {
        return 0;
      }
    };

    const loadStats = async () => {
      try {
        setLoading(true);
        setError('');
        
        
        const [approvedResponse, allResponse] = await Promise.all([
          individualService.getApprovedIndividuals(),
          individualService.getAllIndividuals()
        ]);
        
        
        if (approvedResponse.success && allResponse.success) {
          const approvedIndividuals = approvedResponse.data || [];
          const allIndividuals = allResponse.data || [];
          
          const total = allIndividuals.length;
          const approved = approvedIndividuals.length;
          const pending = total - approved;
          
          const approvedPercentage = total > 0 ? Math.round((approved / total) * 100) : 0;
          const pendingPercentage = total > 0 ? Math.round((pending / total) * 100) : 0;
          
          // Thống kê theo thời gian
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          
          const todayRegistered = allIndividuals.filter(individual => {
            const createdAt = new Date(individual.createdAt);
            return createdAt >= today;
          }).length;
          
          const thisWeekRegistered = allIndividuals.filter(individual => {
            const createdAt = new Date(individual.createdAt);
            return createdAt >= weekAgo;
          }).length;
          
          const thisMonthRegistered = allIndividuals.filter(individual => {
            const createdAt = new Date(individual.createdAt);
            return createdAt >= monthAgo;
          }).length;
          
          // Tỷ lệ duyệt gần đây (30 ngày qua)
          const recentIndividuals = allIndividuals.filter(individual => {
            const createdAt = new Date(individual.createdAt);
            return createdAt >= monthAgo;
          });
          
          const recentApproved = approvedIndividuals.filter(individual => {
            const createdAt = new Date(individual.createdAt);
            return createdAt >= monthAgo;
          });
          
          const recentApprovalRate = recentIndividuals.length > 0 
            ? Math.round((recentApproved.length / recentIndividuals.length) * 100)
            : 0;
          
          // Thời gian xử lý trung bình (chỉ tính cho approved individuals)
          let averageProcessingDays = 0;
          if (approvedIndividuals.length > 0) {
            const processedIndividuals = approvedIndividuals.filter(individual => 
              individual.createdAt && individual.updatedAt
            );
            
            if (processedIndividuals.length > 0) {
              const totalProcessingTime = processedIndividuals.reduce((sum, individual) => {
                const created = new Date(individual.createdAt).getTime();
                const updated = new Date(individual.updatedAt).getTime();
                return sum + (updated - created);
              }, 0);
              
              averageProcessingDays = Math.round(totalProcessingTime / (processedIndividuals.length * 24 * 60 * 60 * 1000));
            }
          }
          
          // Phân bố độ tuổi
          const ageDistribution = {
            under25: 0,
            age25to35: 0,
            age35to50: 0,
            over50: 0
          };
          
          allIndividuals.forEach(individual => {
            const age = calculateAge(individual.date_of_birth);
            if (age < 25) {
              ageDistribution.under25++;
            } else if (age >= 25 && age < 35) {
              ageDistribution.age25to35++;
            } else if (age >= 35 && age < 50) {
              ageDistribution.age35to50++;
            } else {
              ageDistribution.over50++;
            }
          });
          
          // Top quốc tịch
          const nationalityCount: Record<string, number> = {};
          allIndividuals.forEach(individual => {
            const nationality = individual.nationality || 'Không xác định';
            nationalityCount[nationality] = (nationalityCount[nationality] || 0) + 1;
          });
          
          const topNationalities = Object.entries(nationalityCount)
            .map(([nationality, count]) => ({ nationality, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
          
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
            averageProcessingDays,
            ageDistribution,
            topNationalities
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
                    <i className="bi bi-people text-primary fs-4"></i>
                  </div>
                </div>
                <h3 className="fw-bold text-primary mb-1">{stats.total}</h3>
                <p className="text-muted mb-0">Tổng người dùng</p>
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
                    <small className="text-muted">người dùng mới</small>
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
                    <small className="text-muted">người dùng mới</small>
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

        {/* Phân tích nâng cao */}
        <div className="row mb-4">
          {/* Phân bố độ tuổi */}
          <div className="col-md-6 mb-3">
            <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
              <div className="card-header bg-light" style={{ borderRadius: '15px 15px 0 0' }}>
                <h6 className="mb-0">
                  <i className="bi bi-bar-chart me-2 text-primary"></i>
                  Phân bố độ tuổi
                </h6>
              </div>
              <div className="card-body p-4">
                <div className="row">
                  <div className="col-6 mb-3">
                    <div className="text-center">
                      <div className="bg-info bg-opacity-10 rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center" 
                           style={{ width: '50px', height: '50px' }}>
                        <span className="fw-bold text-info">{stats.ageDistribution.under25}</span>
                      </div>
                      <small className="text-muted">Dưới 25 tuổi</small>
                    </div>
                  </div>
                  <div className="col-6 mb-3">
                    <div className="text-center">
                      <div className="bg-success bg-opacity-10 rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center" 
                           style={{ width: '50px', height: '50px' }}>
                        <span className="fw-bold text-success">{stats.ageDistribution.age25to35}</span>
                      </div>
                      <small className="text-muted">25-35 tuổi</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-center">
                      <div className="bg-warning bg-opacity-10 rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center" 
                           style={{ width: '50px', height: '50px' }}>
                        <span className="fw-bold text-warning">{stats.ageDistribution.age35to50}</span>
                      </div>
                      <small className="text-muted">35-50 tuổi</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-center">
                      <div className="bg-danger bg-opacity-10 rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center" 
                           style={{ width: '50px', height: '50px' }}>
                        <span className="fw-bold text-danger">{stats.ageDistribution.over50}</span>
                      </div>
                      <small className="text-muted">Trên 50 tuổi</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top quốc tịch */}
          <div className="col-md-6 mb-3">
            <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
              <div className="card-header bg-light" style={{ borderRadius: '15px 15px 0 0' }}>
                <h6 className="mb-0">
                  <i className="bi bi-flag me-2 text-success"></i>
                  Top quốc tịch
                </h6>
              </div>
              <div className="card-body p-4">
                {stats.topNationalities.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {stats.topNationalities.map((item, index) => (
                      <div key={index} className="list-group-item d-flex justify-content-between align-items-center px-0 border-0">
                        <div className="d-flex align-items-center">
                          <span className={`badge ${index === 0 ? 'bg-primary' : index === 1 ? 'bg-success' : index === 2 ? 'bg-warning' : 'bg-secondary'} me-3`}>
                            #{index + 1}
                          </span>
                          <span className="fw-semibold">{item.nationality}</span>
                        </div>
                        <span className="badge bg-light text-dark">{item.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted">
                    <i className="bi bi-inbox display-6"></i>
                    <p className="mt-2">Chưa có dữ liệu</p>
                  </div>
                )}
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
                  Tỷ lệ trạng thái người dùng
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

IndividualStatsAdvanced.displayName = 'IndividualStatsAdvanced';

export default IndividualStatsAdvanced;