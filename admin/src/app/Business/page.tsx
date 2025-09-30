// app/Business/page.tsx
'use client';

import React, { useState, useRef } from 'react';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import BusinessTable from '../components/BusinessTable/BusinessTable';
import BusinessStats, { BusinessStatsRef } from '../components/BusinessStats/BusinessStats';
import Header from '../components/header';
export default function BusinessPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const businessStatsRef = useRef<BusinessStatsRef>(null);

  // Function để refresh stats từ BusinessTable
  const handleStatsRefresh = () => {
    console.log('🔄 Refreshing stats, current value:', refreshTrigger);
    setRefreshTrigger(prev => prev + 1);
    
    // Cũng gọi refresh method của BusinessStats nếu có
    if (businessStatsRef.current) {
      businessStatsRef.current.refresh();
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
              <Header />
            <div className="mb-4">
              <h2 className="fw-bold mb-2" style={{ color: '#2d3748' }}>
                <i className="bi bi-building me-3 text-primary"></i>
                Quản lý doanh nghiệp KYC
              </h2>
              <p className="text-muted mb-0">
                Theo dõi và quản lý các hồ sơ KYC của doanh nghiệp
              </p>
            </div>
       <div className="mb-5">
            {/* Business Statistics */}
            <BusinessStats 
              ref={businessStatsRef}
              refreshTrigger={refreshTrigger} 
            />
            </div>
            <div className="mb-5">
            {/* Business Table */}
            <BusinessTable onStatsChange={handleStatsRefresh} />
            </div>

          </div>
        </div>

      </div>
    </ProtectedRoute>
  );
}