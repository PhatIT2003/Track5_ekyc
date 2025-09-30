// components/IndividualStats/IndividualStats.tsx
'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { individualService, Individual } from '../../services/IndividualServices';

interface IndividualStatsProps {
  refreshTrigger?: number; // Prop để trigger refresh từ bên ngoài
}

export interface IndividualStatsRef {
  refresh: () => void;
}

const IndividualStats = forwardRef<IndividualStatsRef, IndividualStatsProps>(
  ({ refreshTrigger }, ref) => {
    const [stats, setStats] = useState({
      total: 0,
      approved: 0,
      pending: 0,
      approvedPercentage: 0,
      pendingPercentage: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Expose refresh method để parent component có thể gọi
    useImperativeHandle(ref, () => ({
      refresh: loadStats
    }));

    // Load stats khi component mount hoặc refreshTrigger thay đổi
    useEffect(() => {
      loadStats();
    }, [refreshTrigger]);

    const loadStats = async () => {
      try {
        setLoading(true);
        setError('');
        
        // GỌI CẢ 2 API: APPROVED VÀ PENDING (giống Business)
        const [approvedResponse, pendingResponse] = await Promise.all([
          individualService.getApprovedIndividuals(), // API /api/approved-individual
          individualService.getPendingIndividuals()   // Filter từ /api/individual
        ]);
        

        
        if (approvedResponse.success && pendingResponse.success) {
          const approvedIndividuals = approvedResponse.data || [];
          const pendingIndividuals = pendingResponse.data || [];
          
          const approved = approvedIndividuals.length;
          const pending = pendingIndividuals.length;
          const total = approved + pending; // Tổng thực sự
          
          
          
          // Tính phần trăm
          const approvedPercentage = total > 0 ? Math.round((approved / total) * 100) : 0;
          const pendingPercentage = total > 0 ? Math.round((pending / total) * 100) : 0;
          
          const newStats = {
            total,
            approved,
            pending,
            approvedPercentage,
            pendingPercentage
          };
          
          
          setStats(newStats);
        } else {
          
          // Fallback: thử lấy từ getAllIndividuals
          const allResponse = await individualService.getAllIndividuals();
          
          if (allResponse.success && allResponse.data) {
            const allIndividuals = allResponse.data;
            const approvedFromAll = allIndividuals.filter(i => i.approved === true);
            const pendingFromAll = allIndividuals.filter(i => i.approved === false || i.approved === null || i.approved === undefined);
            
            const newStats = {
              total: allIndividuals.length,
              approved: approvedFromAll.length,
              pending: pendingFromAll.length,
              approvedPercentage: allIndividuals.length > 0 ? Math.round((approvedFromAll.length / allIndividuals.length) * 100) : 0,
              pendingPercentage: allIndividuals.length > 0 ? Math.round((pendingFromAll.length / allIndividuals.length) * 100) : 0
            };
            
            setStats(newStats);
          } else {
            setError('Không thể tải thống kê từ bất kỳ API nào');
          }
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
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
              <div className="card-body text-center p-4">
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">Đang tải...</span>
                </div>
                <p className="text-muted mt-2 mb-0">Đang tải thống kê...</p>
              </div>
            </div>
          </div>
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
      <div className="row mb-4">
        {/* Tổng số người dùng */}
        <div className="col-md-4 mb-3">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
            <div className="card-body text-center p-4">
              <div className="d-flex justify-content-center align-items-center mb-3">
                <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                  <i className="bi bi-people text-primary fs-4"></i>
                </div>
              </div>
              <h3 className="fw-bold text-primary mb-1">{stats.total}</h3>
              <p className="text-muted mb-0">Tổng người dùng</p>
              <small className="text-muted">
                <i className="bi bi-graph-up me-1"></i>
                Tất cả hồ sơ
              </small>
            </div>
          </div>
        </div>

        {/* Đã duyệt */}
        <div className="col-md-4 mb-3">
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

        {/* Chờ duyệt */}
        <div className="col-md-4 mb-3">
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
      </div>
    );
  }
);

IndividualStats.displayName = 'IndividualStats';

export default IndividualStats;