// app/Individual/page.tsx
'use client';

import React, { useState, useRef } from 'react';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import IndividualTable from '../components/IndividualTable/IndividualTable';
import IndividualStats, { IndividualStatsRef } from '../components/IndividualStats/IndividualStats';
import Header from '../components/header';
export default function IndividualPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const individualStatsRef = useRef<IndividualStatsRef>(null);

  // Function để refresh stats từ IndividualTable
  const handleStatsRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    
    // Cũng gọi refresh method của IndividualStats nếu có
    if (individualStatsRef.current) {
      individualStatsRef.current.refresh();
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            {/* Header */}
              <Header/>
            {/* Page Title */}
            <div className="mb-4">
              <h2 className="fw-bold mb-2" style={{ color: '#2d3748' }}>
                <i className="bi bi-people me-3 text-primary"></i>
                Quản lý người dùng cá nhân KYC
              </h2>
              <p className="text-muted mb-0">
                Theo dõi và quản lý các hồ sơ KYC của người dùng cá nhân
              </p>
            </div>
            
            <div className="mb-5">
              {/* Individual Statistics */}
              <IndividualStats 
                ref={individualStatsRef}
                refreshTrigger={refreshTrigger} 
              />
            </div>
            
            <div className="mb-5">
              {/* Individual Table */}
              <IndividualTable onStatsChange={handleStatsRefresh} />
            </div>

          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}