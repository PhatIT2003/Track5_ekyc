// components/IndividualTable/IndividualTable.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { individualService, Individual } from '../../services/IndividualServices';
import { contractIndividualKycService } from '../../services/individualKyc';
import { CryptoUtils } from '../../utils/cryptoUtils';
import ImageWithAuth from '../ImageWithAuth';

interface IndividualTableProps {
  onStatsChange?: () => void;
}

export default function IndividualTable({ onStatsChange }: IndividualTableProps) {
  const [individuals, setIndividuals] = useState<Individual[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIndividual, setSelectedIndividual] = useState<Individual | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'pending' | 'approved'>('pending');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{url: string, title: string} | null>(null);
  const [blockchainSyncLoading, setBlockchainSyncLoading] = useState<{[key: number]: boolean}>({});
  const [blockchainSyncAllLoading, setBlockchainSyncAllLoading] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    loadIndividuals();
  }, [viewMode]);

  useEffect(() => {
    if (autoSyncEnabled && individuals.length > 0 && viewMode === 'pending') {
      autoSyncToBlockchain();
    }
  }, [individuals, autoSyncEnabled, viewMode]);

  const loadIndividuals = async () => {
    try {
      setLoading(true);
      setError('');
      setCurrentPage(1);
      
      let response;
      if (viewMode === 'approved') {
        response = await individualService.getApprovedIndividuals();
      } else {
        response = await individualService.getPendingIndividuals();
      }
      
      if (response.success && response.data) {
        setIndividuals(response.data);
      } else {
        setError(response.message || 'Không thể tải dữ liệu');
        setIndividuals([]);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Lỗi kết nối API';
      setError(errorMsg);
      setIndividuals([]);
    } finally {
      setLoading(false);
    }
  };

  const autoSyncToBlockchain = async () => {
    if (blockchainSyncAllLoading) return;

    console.log('🔄 Bắt đầu tự động đồng bộ blockchain Individual với hashing...');
    setBlockchainSyncAllLoading(true);

    try {
      const syncResult = await individualService.syncPendingIndividualsToBlockchain();
      
      if (syncResult.synced > 0) {
        console.log(`✅ Đã đồng bộ ${syncResult.synced} cá nhân lên blockchain (đã hash dữ liệu nhạy cảm)`);
        
        if (syncResult.errors.length === 0) {
          console.log(`🎉 Tự động đồng bộ thành công: ${syncResult.message}`);
        } else {
          console.warn(`⚠️ Đồng bộ một phần: ${syncResult.message}`);
          console.warn('Errors:', syncResult.errors);
        }
      }
      
    } catch (error) {
      console.error('❌ Lỗi tự động đồng bộ blockchain:', error);
    } finally {
      setBlockchainSyncAllLoading(false);
    }
  };

  const handleManualBlockchainSync = async (individual: Individual) => {
    if (!individual.address_wallet) {
      alert('Cá nhân chưa có địa chỉ ví!');
      return;
    }

    const confirmMessage = `Bạn có muốn đồng bộ cá nhân "${individual.full_name}" lên blockchain?\n\n🔐 Dữ liệu nhạy cảm sẽ được hash trước khi gửi lên blockchain để bảo vệ quyền riêng tư.\n\n⚠️ Thao tác này sẽ tạo transaction trên blockchain.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setBlockchainSyncLoading(prev => ({ ...prev, [individual.id]: true }));
      
      const syncResult = await individualService.syncSingleIndividualToBlockchain(individual.id);
      
      if (syncResult.success) {
        const successMessage = `✅ Đã đồng bộ "${individual.full_name}" lên blockchain thành công!\n\n${syncResult.message}\n\nTx Hashes: ${syncResult.txHashes?.join(', ') || 'N/A'}\n\n🔐 Dữ liệu nhạy cảm đã được hash để bảo mật.`;
        alert(successMessage);
      } else {
        alert(`❌ Lỗi đồng bộ blockchain: ${syncResult.message}`);
      }
    } catch (error) {
      console.error('Lỗi đồng bộ blockchain:', error);
      alert('Có lỗi không mong muốn khi đồng bộ blockchain');
    } finally {
      setBlockchainSyncLoading(prev => ({ ...prev, [individual.id]: false }));
    }
  };

  const handleManualSyncAll = async () => {
    const pendingIndividuals = individuals.filter(i => i.address_wallet);
    
    if (pendingIndividuals.length === 0) {
      alert('Không có cá nhân nào cần đồng bộ (phải có địa chỉ ví)');
      return;
    }

    const confirmMessage = `Bạn có muốn đồng bộ ${pendingIndividuals.length} cá nhân lên blockchain?\n\n🔐 Tất cả dữ liệu nhạy cảm (email, CCCD, số điện thoại, địa chỉ, hình ảnh) sẽ được hash để bảo mật.\n\n⚠️ Thao tác này có thể mất vài phút và tạo nhiều transaction.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setBlockchainSyncAllLoading(true);

    try {
      const syncResult = await individualService.syncPendingIndividualsToBlockchain();
      
      let alertMessage = `Kết quả đồng bộ blockchain với hashing:\n`;
      alertMessage += `✅ Thành công: ${syncResult.synced} cá nhân\n`;
      alertMessage += `❌ Lỗi: ${syncResult.errors.length} cá nhân\n\n`;
      alertMessage += syncResult.message;
      alertMessage += `\n\n🔐 Tất cả dữ liệu nhạy cảm đã được hash để bảo vệ quyền riêng tư trên blockchain.`;
      
      if (syncResult.errors.length > 0) {
        alertMessage += `\n\nChi tiết lỗi:\n${syncResult.errors.slice(0, 3).join('\n')}`;
        if (syncResult.errors.length > 3) {
          alertMessage += `\n... và ${syncResult.errors.length - 3} lỗi khác (xem console)`;
        }
      }
      
      alert(alertMessage);
      
      console.log('Kết quả đồng bộ blockchain:', syncResult);
      
    } catch (error) {
      console.error('Lỗi đồng bộ tất cả:', error);
      alert('Có lỗi không mong muốn khi đồng bộ tất cả cá nhân');
    } finally {
      setBlockchainSyncAllLoading(false);
    }
  };

  const showHashingInfoModal = () => {
    const hashingInfo = contractIndividualKycService.getHashMappingInfo();
    const infoMessage = `🔐 THÔNG TIN BẢO MẬT BLOCKCHAIN\n\n` +
      `Hệ thống tự động hash các dữ liệu nhạy cảm trước khi gửi lên blockchain:\n\n` +
      `🔹 Dữ liệu được hash:\n` +
      `- Email\n` +
      `- Số CCCD\n` +
      `- Số điện thoại\n` +
      `- Địa chỉ chi tiết\n` +
      `- URL hình ảnh CCCD (mặt trước/sau)\n\n` +
      `🔹 Dữ liệu công khai:\n` +
      `- Họ tên\n` +
      `- Quốc tịch\n` +
      `- Ngày sinh (timestamp)\n` +
      `- Địa chỉ ví\n\n` +
      `📊 Phiên hiện tại: ${hashingInfo.totalMappings} trường đã hash\n\n` +
      `🛡️ Hash method: SHA-256\n` +
      `🔒 Không thể reverse hash để lấy dữ liệu gốc`;

    alert(infoMessage);
  };

  const viewImage = (url: string, title: string) => {
    setSelectedImage({ url, title });
    setShowImageModal(true);
  };

  const filteredIndividuals = individuals.filter(individual => {
    const searchLower = searchTerm.toLowerCase();
    return individual.full_name?.toLowerCase().includes(searchLower) ||
           individual.email?.toLowerCase().includes(searchLower) ||
           individual.cccd_number?.includes(searchTerm) ||
           individual.phone?.includes(searchTerm);
  });

  const totalPages = Math.ceil(filteredIndividuals.length / itemsPerPage);
  const paginatedIndividuals = filteredIndividuals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleStatusUpdate = async (id: number, approved: boolean) => {
    try {
      const individual = individuals.find(i => i.id === id);
      if (!individual) {
        alert('Không tìm thấy thông tin người dùng');
        return;
      }

      const action = approved ? 'duyệt' : 'từ chối';
      let confirmMessage = `Bạn có chắc chắn muốn ${action} cá nhân "${individual.full_name}"?`;
      
      if (approved && individual.address_wallet) {
        confirmMessage += `\n\n⚠️ Hệ thống sẽ tự động cập nhật trạng thái trên blockchain`;
        confirmMessage += `\n🔐 Dữ liệu nhạy cảm đã được hash trên blockchain.`;
      }

      if (!window.confirm(confirmMessage)) {
        return;
      }

      const response = await individualService.updateIndividualStatus(id, approved);
      if (!response.success) {
        alert(response.message || 'Lỗi cập nhật trạng thái');
        return;
      }

      if (approved && individual.address_wallet) {
        try {
          const blockchainResult = await contractIndividualKycService.approveIndividual(individual.address_wallet, true);
          if (!blockchainResult.success) {
            console.warn('Lỗi cập nhật blockchain:', blockchainResult.message);
            alert(`✅ Đã ${action} cá nhân thành công!\n⚠️ Lỗi cập nhật blockchain: ${blockchainResult.message}`);
          } else {
            alert(`✅ Đã ${action} cá nhân thành công và cập nhật blockchain!\n\n🔐 Dữ liệu trên blockchain đã được hash để bảo mật.`);
          }
        } catch (blockchainError) {
          console.error('Lỗi xử lý blockchain:', blockchainError);
          alert(`✅ Đã ${action} cá nhân thành công nhưng có lỗi xử lý blockchain. Vui lòng kiểm tra lại.`);
        }
      } else {
        alert(`Đã ${action} cá nhân thành công!`);
      }

      await loadIndividuals();
      onStatsChange?.();

    } catch (err) {
      console.error('Lỗi cập nhật trạng thái:', err);
      alert('Lỗi cập nhật trạng thái');
    }
  };

const handleDelete = async (id: number) => {
  const individual = individuals.find(i => i.id === id);
  if (!individual) {
    alert('Không tìm thấy thông tin cá nhân');
    return;
  }

  let confirmMessage = `Bạn có chắc chắn muốn xóa cá nhân "${individual.full_name}"?\n\n`;
  
  if (individual.address_wallet) {
    confirmMessage += `⚠️ CẢNH BÁO: Cá nhân này có dữ liệu trên blockchain!\n\n`;
    confirmMessage += `Hệ thống sẽ:\n`;
    confirmMessage += `1. Xóa dữ liệu khỏi blockchain (nếu có)\n`;
    confirmMessage += `2. Xóa dữ liệu khỏi database\n\n`;
    confirmMessage += `🔐 Lưu ý: Dữ liệu đã hash trên blockchain sẽ bị xóa vĩnh viễn.\n\n`;
    confirmMessage += `⚠️ Thao tác này KHÔNG THỂ HOÀN TÁC!\n\n`;
    confirmMessage += `Bạn có chắc chắn muốn tiếp tục?`;
  } else {
    confirmMessage += `Thao tác này sẽ xóa vĩnh viễn dữ liệu khỏi database.\n\n`;
    confirmMessage += `Bạn có chắc chắn muốn tiếp tục?`;
  }

  if (!window.confirm(confirmMessage)) {
    return;
  }

  try {
    setLoading(true);
    
    if (individual.address_wallet) {
      // Xóa cả blockchain và database
      const response = await individualService.deleteIndividualWithBlockchain(id);
      
      if (response.success) {
        let successMessage = '';
        
        if (response.blockchainDeleted && response.dbDeleted) {
          successMessage = `✅ Đã xóa thành công!\n\n`;
          successMessage += `📦 Database: Đã xóa\n`;
          successMessage += `⛓️ Blockchain: Đã xóa\n`;
          successMessage += `\nTx Hash: ${response.txHash || 'N/A'}`;
        } else if (response.dbDeleted && !response.blockchainDeleted) {
          successMessage = `⚠️ Xóa một phần thành công\n\n`;
          successMessage += `✅ Database: Đã xóa\n`;
          successMessage += `❌ Blockchain: ${response.message}\n\n`;
          successMessage += `Bạn có thể thử xóa blockchain thủ công sau.`;
        } else {
          successMessage = response.message;
        }
        
        alert(successMessage);
        await loadIndividuals();
        onStatsChange?.();
      } else {
        alert(`❌ Lỗi xóa: ${response.message}`);
      }
    } else {
      // Chỉ xóa database
      const response = await individualService.deleteIndividual(id);
      if (response.success) {
        alert('✅ Đã xóa cá nhân khỏi database thành công!');
        await loadIndividuals();
        onStatsChange?.();
      } else {
        alert(`❌ Lỗi xóa: ${response.message || 'Lỗi xóa người dùng'}`);
      }
    }
  } catch (err) {
    console.error('Lỗi xóa cá nhân:', err);
    alert('❌ Có lỗi không mong muốn khi xóa');
  } finally {
    setLoading(false);
  }
};

  const handleCopy = async (individual: Individual) => {
    const copyText = `
Họ tên: ${individual.full_name}
Email: ${CryptoUtils.maskSensitiveData(individual.email)}
Số CCCD: ${CryptoUtils.maskSensitiveData(individual.cccd_number)}
Số điện thoại: ${CryptoUtils.maskSensitiveData(individual.phone)}
Ngày sinh: ${individual.date_of_birth}
Địa chỉ: ${CryptoUtils.maskSensitiveData(individual.address, 30)}
Quốc tịch: ${individual.nationality}
Ví: ${individual.address_wallet}

🔐 Dữ liệu nhạy cảm đã được mask để bảo mật
    `.trim();
    
    try {
      await navigator.clipboard.writeText(copyText);
      alert('Đã sao chép thông tin người dùng (đã mask dữ liệu nhạy cảm)!');
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = copyText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Đã sao chép thông tin người dùng (đã mask dữ liệu nhạy cảm)!');
    }
  };

  const viewDetails = async (id: number) => {
    try {
      const response = await individualService.getIndividualById(id);
      if (response.success && response.data) {
        setSelectedIndividual(response.data);
        setShowModal(true);
      } else {
        alert('Không thể tải thông tin chi tiết');
      }
    } catch (err) {
      alert('Lỗi tải thông tin chi tiết');
    }
  };

  const getStatusBadge = (approved: boolean) => {
    return approved === true ? (
      <span className="badge bg-success">
        <i className="bi bi-check-circle me-1"></i>
        Đã duyệt
      </span>
    ) : (
      <span className="badge bg-warning text-dark">
        <i className="bi bi-clock me-1"></i>
        Chờ duyệt
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return 'N/A';
    }
  };

  const truncateText = (text: string | null | undefined, maxLength: number) => {
    if (!text) return 'N/A';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const calculateAge = (dateOfBirth: string) => {
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
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="card border-0 shadow-lg" style={{ borderRadius: '15px' }}>
        <div className="card-body d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border-0 shadow-lg" style={{ borderRadius: '15px' }}>
        <div className="card-body">
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
            <button className="btn btn-outline-danger ms-3" onClick={loadIndividuals}>
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-lg" style={{ borderRadius: '15px' }}>
      {/* Header với thông tin bảo mật */}
      <div className="card-header bg-light p-4" style={{ borderRadius: '15px 15px 0 0' }}>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">
              <i className="bi bi-people me-2"></i>
              Quản lý cá nhân KYC
              <span className="badge bg-info ms-2">🔐 Secured</span>
            </h5>
            {blockchainSyncAllLoading && (
              <small className="text-muted">
                <i className="bi bi-cloud-upload me-1"></i>
                Đang đồng bộ blockchain với hashing...
              </small>
            )}
          </div>
          
          {/* Blockchain Controls */}
          {viewMode === 'pending' && (
            <div className="btn-group">
              <button
                className="btn btn-outline-info btn-sm"
                onClick={showHashingInfoModal}
                title="Xem thông tin bảo mật hashing"
              >
                <i className="bi bi-shield-lock me-1"></i>
                Bảo mật
              </button>
              
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={handleManualSyncAll}
                disabled={blockchainSyncAllLoading}
                title="Đồng bộ tất cả cá nhân chờ duyệt lên blockchain"
              >
                {blockchainSyncAllLoading ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                    Đồng bộ...
                  </>
                ) : (
                  <>
                    <i className="bi bi-cloud-upload me-2"></i>
                    Đồng bộ blockchain
                  </>
                )}
              </button>
              
              <button
                className={`btn btn-sm ${autoSyncEnabled ? 'btn-success' : 'btn-outline-secondary'}`}
                onClick={() => setAutoSyncEnabled(!autoSyncEnabled)}
                title={autoSyncEnabled ? 'Tắt tự động đồng bộ' : 'Bật tự động đồng bộ'}
              >
                <i className={`bi ${autoSyncEnabled ? 'bi-toggle-on' : 'bi-toggle-off'} me-1`}></i>
                Auto sync
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card-body p-4">
        {/* Security Notice */}
        {viewMode === 'pending' && (
          <div className="alert alert-info d-flex align-items-center mb-4" role="alert">
            <i className="bi bi-shield-lock me-2"></i>
            <div>
              <strong>Bảo mật blockchain:</strong> Dữ liệu nhạy cảm (email, CCCD, số điện thoại, địa chỉ, hình ảnh) được hash trước khi gửi lên blockchain.
              <button className="btn btn-link btn-sm p-0 ms-2" onClick={showHashingInfoModal}>
                Xem chi tiết →
              </button>
            </div>
          </div>
        )}

        {/* Filters và Tabs */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Tìm kiếm theo họ tên, email, CCCD, số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="btn-group w-100" role="group">
              <button
                type="button"
                className={`btn ${viewMode === 'pending' ? 'btn-warning' : 'btn-outline-warning'}`}
                onClick={() => setViewMode('pending')}
              >
                <i className="bi bi-clock me-2"></i>
                Chờ duyệt
              </button>
              <button
                type="button"
                className={`btn ${viewMode === 'approved' ? 'btn-success' : 'btn-outline-success'}`}
                onClick={() => setViewMode('approved')}
              >
                <i className="bi bi-check-circle me-2"></i>
                Đã duyệt
              </button>
            </div>
          </div>
          
          <div className="col-md-2">
            <button className="btn btn-light w-100" onClick={loadIndividuals}>
              <i className="bi bi-arrow-clockwise me-2"></i>
              Làm mới
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="row mb-3">
          <div className="col-12">
            <div className="text-muted d-flex justify-content-between align-items-center">
              <div>
                Hiển thị: <strong>{filteredIndividuals.length}</strong> / <strong>{individuals.length}</strong> cá nhân
                <span className={`ms-2 badge ${viewMode === 'approved' ? 'bg-success' : 'bg-warning text-dark'}`}>
                  {viewMode === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                </span>
              </div>
              
              {viewMode === 'pending' && individuals.filter(i => i.address_wallet).length > 0 && (
                <small className="text-info">
                  <i className="bi bi-shield-lock me-1"></i>
                  {individuals.filter(i => i.address_wallet).length} cá nhân có ví sẵn sàng đồng bộ blockchain (với hashing)
                </small>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th style={{ width: '60px' }}>ID</th>
                <th style={{ width: '250px' }}>Người dùng</th>
                <th style={{ width: '200px' }}>Liên hệ</th>
                <th style={{ width: '150px' }}>Thông tin</th>
                <th style={{ width: '120px' }}>Trạng thái</th>
                <th style={{ width: '120px' }}>Ngày tạo</th>
                <th style={{ width: '300px' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedIndividuals.map((individual) => (
                <tr key={individual.id}>
                  <td>
                    <span className="badge bg-secondary fs-6">{individual.id}</span>
                  </td>
                  
                  {/* Người dùng Info */}
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="me-3">
                        <ImageWithAuth
                          src={individual.front_cccd_image}
                          alt="Avatar"
                          className="rounded-circle"
                          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                          onClick={() => {
                            if (individual.front_cccd_image) {
                              viewImage(individual.front_cccd_image, 'CCCD mặt trước');
                            }
                          }}
                          fallbackIcon="bi-person"
                        />
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-semibold text-truncate" style={{ maxWidth: '180px' }} title={individual.full_name}>
                          {truncateText(individual.full_name, 25)}
                        </div>
                        <small className="text-muted">{calculateAge(individual.date_of_birth)} tuổi</small>
                        <div>
                          <small className="text-info">
                            {truncateText(CryptoUtils.maskSensitiveData(individual.cccd_number), 12)}
                            <i className="bi bi-shield-lock ms-1" title="Sẽ được hash trên blockchain"></i>
                          </small>
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  {/* Contact Info */}
                  <td>
                    <div>
                      <div className="text-truncate" style={{ maxWidth: '180px' }} title={individual.email}>
                        <i className="bi bi-envelope me-1"></i>
                        {truncateText(CryptoUtils.maskSensitiveData(individual.email, 8), 25)}
                        <i className="bi bi-shield-lock ms-1" title="Sẽ được hash trên blockchain"></i>
                      </div>
                      <div className="text-muted small text-truncate" style={{ maxWidth: '180px' }} title={individual.phone}>
                        <i className="bi bi-telephone me-1"></i>
                        {truncateText(CryptoUtils.maskSensitiveData(individual.phone), 15)}
                        <i className="bi bi-shield-lock ms-1" title="Sẽ được hash trên blockchain"></i>
                      </div>
                      {individual.address_wallet && (
                        <div className="text-muted small text-truncate" style={{ maxWidth: '180px' }} title={individual.address_wallet}>
                          <i className="bi bi-wallet me-1"></i>
                          {truncateText(individual.address_wallet, 15)}
                          <i className="bi bi-eye ms-1 text-success" title="Công khai trên blockchain"></i>
                        </div>
                      )}
                    </div>
                  </td>
                  
                  {/* Thông tin cá nhân */}
                  <td>
                    <div>
                      <span className="badge bg-light text-dark mb-1 d-block text-truncate" style={{ maxWidth: '130px' }}>
                        {truncateText(individual.nationality, 15)}
                        <i className="bi bi-eye ms-1 text-success" title="Công khai trên blockchain"></i>
                      </span>
                      <div className="text-muted small text-truncate" style={{ maxWidth: '130px' }} title={individual.address}>
                        <i className="bi bi-geo-alt me-1"></i>
                        {truncateText(CryptoUtils.maskSensitiveData(individual.address, 15), 20)}
                        <i className="bi bi-shield-lock ms-1" title="Sẽ được hash"></i>
                      </div>
                    </div>
                  </td>
                  
                  {/* Status */}
                  <td>
                    {getStatusBadge(individual.approved)}
                  </td>
                  
                  {/* Created Date */}
                  <td>
                    <small className="text-muted">
                      {formatDate(individual.createdAt)}
                    </small>
                  </td>
                  
                  {/* Actions */}
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button
                        className="btn btn-outline-info"
                        onClick={() => viewDetails(individual.id)}
                        title="Xem chi tiết"
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => handleCopy(individual)}
                        title="Sao chép (đã mask dữ liệu nhạy cảm)"
                      >
                        <i className="bi bi-copy"></i>
                      </button>
                      
                      {/* Nút đồng bộ blockchain với hashing */}
                      {viewMode === 'pending' && individual.address_wallet && (
                        <button
                        className="btn btn-outline-primary"
                          onClick={() => handleManualBlockchainSync(individual)}
                          disabled={blockchainSyncLoading[individual.id]}
                          title="Đồng bộ lên blockchain với hashing"
                        >
                          {blockchainSyncLoading[individual.id] ? (
                            <div className="spinner-border spinner-border-sm" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          ) : (
                            <i className="bi bi-cloud-upload"></i>
                          )}
                        </button>
                      )}
                      
                      {viewMode === 'pending' && (
                        <button
                          className="btn btn-outline-success"
                          onClick={() => handleStatusUpdate(individual.id, true)}
                          title="Duyệt (tự động blockchain với hashing)"
                        >
                          <i className="bi bi-check-lg"></i>
                        </button>
                      )}
                              
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => handleDelete(individual.id)}
                        title="Xóa"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {paginatedIndividuals.length === 0 && (
            <div className="text-center py-5">
              <i className="bi bi-inbox display-1 text-muted"></i>
              <p className="text-muted mt-3">
                {searchTerm ? 'Không tìm thấy kết quả phù hợp' : 'Không có dữ liệu'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="mt-4">
            <ul className="pagination justify-content-center">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
              </li>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                
                return (
                  <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  </li>
                );
              })}
              
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>

      {/* Detail Modal with Security Info */}
      {showModal && selectedIndividual && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-person me-2"></i>
                  Chi tiết cá nhân - {selectedIndividual.full_name}
                  <span className="badge bg-info ms-2">Secured</span>
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {/* Security Notice trong modal */}
                <div className="alert alert-warning mb-3">
                  <i className="bi bi-shield-exclamation me-2"></i>
                  <strong>Thông báo bảo mật:</strong> Dữ liệu nhạy cảm hiển thị dưới đây đã được mask. 
                  Khi đồng bộ lên blockchain, chúng sẽ được hash để bảo vệ quyền riêng tư.
                </div>

                <div className="row">
                  {/* Basic Info */}
                  <div className="col-md-6">
                    <h6 className="border-bottom pb-2 mb-3">
                      <i className="bi bi-info-circle me-2"></i>
                      Thông tin cơ bản
                    </h6>
                    <table className="table table-sm table-borderless">
                      <tbody>
                        <tr>
                          <td width="35%"><strong>ID:</strong></td>
                          <td>
                            <span className="badge bg-secondary">{selectedIndividual.id}</span>
                          </td>
                        </tr>
                        <tr>
                          <td><strong>Họ tên:</strong></td>
                          <td>
                            {selectedIndividual.full_name || 'N/A'}
                            <i className="bi bi-eye ms-2 text-success" title="Công khai trên blockchain"></i>
                          </td>
                        </tr>
                        <tr>
                          <td><strong>Email:</strong></td>
                          <td>
                            {CryptoUtils.maskSensitiveData(selectedIndividual.email || 'N/A', 8)}
                            <i className="bi bi-shield-lock ms-2 text-warning" title="Sẽ được hash trên blockchain"></i>
                          </td>
                        </tr>
                        <tr>
                          <td><strong>Số điện thoại:</strong></td>
                          <td>
                            {CryptoUtils.maskSensitiveData(selectedIndividual.phone || 'N/A')}
                            <i className="bi bi-shield-lock ms-2 text-warning" title="Sẽ được hash trên blockchain"></i>
                          </td>
                        </tr>
                        <tr>
                          <td><strong>Ngày sinh:</strong></td>
                          <td>
                            {formatDate(selectedIndividual.date_of_birth)}
                            <span className="badge bg-info ms-2">
                              {calculateAge(selectedIndividual.date_of_birth)} tuổi
                            </span>
                            <i className="bi bi-eye ms-2 text-success" title="Công khai (timestamp)"></i>
                          </td>
                        </tr>
                        <tr>
                          <td><strong>Địa chỉ:</strong></td>
                          <td>
                            {CryptoUtils.maskSensitiveData(selectedIndividual.address || 'N/A', 25)}
                            <i className="bi bi-shield-lock ms-2 text-warning" title="Sẽ được hash trên blockchain"></i>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Additional Info */}
                  <div className="col-md-6">
                    <h6 className="border-bottom pb-2 mb-3">
                      <i className="bi bi-gear me-2"></i>
                      Thông tin bổ sung
                    </h6>
                    <table className="table table-sm table-borderless">
                      <tbody>
                        <tr>
                          <td width="35%"><strong>Trạng thái:</strong></td>
                          <td>{getStatusBadge(selectedIndividual.approved)}</td>
                        </tr>
                        <tr>
                          <td><strong>Số CCCD:</strong></td>
                          <td>
                            <span className="font-monospace text-info">
                              {CryptoUtils.maskSensitiveData(selectedIndividual.cccd_number || 'N/A')}
                            </span>
                            <i className="bi bi-shield-lock ms-2 text-warning" title="Sẽ được hash trên blockchain"></i>
                          </td>
                        </tr>
                        <tr>
                          <td><strong>Quốc tịch:</strong></td>
                          <td>
                            <span className="badge bg-primary">
                              {selectedIndividual.nationality || 'N/A'}
                            </span>
                            <i className="bi bi-eye ms-2 text-success" title="Công khai trên blockchain"></i>
                          </td>
                        </tr>
                        <tr>
                          <td><strong>Ví điện tử:</strong></td>
                          <td>
                            <span className="font-monospace small text-break">
                              {selectedIndividual.address_wallet || 'N/A'}
                            </span>
                            <i className="bi bi-eye ms-2 text-success" title="Công khai trên blockchain"></i>
                          </td>
                        </tr>
                        <tr>
                          <td><strong>Ngày tạo:</strong></td>
                          <td>
                            <small className="text-muted">
                              {selectedIndividual.createdAt ? new Date(selectedIndividual.createdAt).toLocaleString('vi-VN') : 'N/A'}
                            </small>
                          </td>
                        </tr>
                        <tr>
                          <td><strong>Cập nhật:</strong></td>
                          <td>
                            <small className="text-muted">
                              {selectedIndividual.updatedAt ? new Date(selectedIndividual.updatedAt).toLocaleString('vi-VN') : 'N/A'}
                            </small>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Images Section */}
                <div className="row mt-4">
                  <div className="col-12">
                    <h6 className="border-bottom pb-2 mb-3">
                      <i className="bi bi-images me-2"></i>
                      Hình ảnh tài liệu
                      <span className="badge bg-warning text-dark ms-2">
                        <i className="bi bi-shield-lock me-1"></i>
                        URL sẽ được hash
                      </span>
                    </h6>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="card">
                      <div className="card-header bg-light">
                        <small className="fw-semibold">CCCD mặt trước</small>
                      </div>
                      <div className="card-body p-2">
                        <ImageWithAuth
                          src={selectedIndividual.front_cccd_image}
                          alt="CCCD mặt trước"
                          className="img-fluid rounded"
                          style={{ width: '100%', height: '150px', objectFit: 'cover', cursor: 'pointer' }}
                          onClick={() => {
                            if (selectedIndividual.front_cccd_image) {
                              viewImage(selectedIndividual.front_cccd_image, 'CCCD mặt trước');
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="card">
                      <div className="card-header bg-light">
                        <small className="fw-semibold">CCCD mặt sau</small>
                      </div>
                      <div className="card-body p-2">
                        <ImageWithAuth
                          src={selectedIndividual.back_cccd_image}
                          alt="CCCD mặt sau"
                          className="img-fluid rounded"
                          style={{ width: '100%', height: '150px', objectFit: 'cover', cursor: 'pointer' }}
                          onClick={() => {
                            if (selectedIndividual.back_cccd_image) {
                              viewImage(selectedIndividual.back_cccd_image, 'CCCD mặt sau');
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Đóng
                </button>
                
                {/* Nút đồng bộ blockchain trong modal */}
                {selectedIndividual.address_wallet && viewMode === 'pending' && (
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => handleManualBlockchainSync(selectedIndividual)}
                    disabled={blockchainSyncLoading[selectedIndividual.id]}
                  >
                    {blockchainSyncLoading[selectedIndividual.id] ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Đang đồng bộ...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-cloud-upload me-2"></i>
                        Đồng bộ blockchain (Hash)
                      </>
                    )}
                  </button>
                )}
                
                {viewMode === 'pending' && (
                  <>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => {
                        handleStatusUpdate(selectedIndividual.id, false);
                        setShowModal(false);
                      }}
                    >
                      <i className="bi bi-x-lg me-2"></i>
                      Từ chối
                    </button>
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={() => {
                        handleStatusUpdate(selectedIndividual.id, true);
                        setShowModal(false);
                      }}
                    >
                      <i className="bi bi-check-lg me-2"></i>
                      Duyệt & Blockchain (Hash)
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {showImageModal && selectedImage && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-image me-2"></i>
                  {selectedImage.title}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowImageModal(false)}
                ></button>
              </div>
              <div className="modal-body text-center p-0">
                <ImageWithAuth
                  src={selectedImage.url}
                  alt={selectedImage.title}
                  className="img-fluid"
                  style={{ maxHeight: '70vh', width: 'auto' }}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowImageModal(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}