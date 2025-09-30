const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Business {
  id: number;
  name_company: string;
  type_company: string;
  establishment_date: string;
  business_registration_number: string;
  address: string;
  career: string;
  number_of_employees: number;
  certification_image?: string;
  front_cccd_image?: string;
  back_cccd_image?: string;
  otp_code?: string;
  approved: boolean;
  email: string;
  address_wallet: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessResponse {
  success: boolean;
  message: string;
  data: Business[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface SingleBusinessResponse {
  success: boolean;
  message: string;
  data: Business;
}

class BusinessService {
  // Đơn giản hóa build image URL
  private buildImageUrl(filename?: string): string | undefined {
    if (!filename) return undefined;
    
    // Nếu đã là full URL, trả về nguyên vẹn
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
      return filename;
    }
    
    // Xóa path dư thừa và build URL
    const cleanFilename = filename.replace(/^.*[\\\/]/, '');
    let imageUrl = `${API_BASE_URL}/api/upload/${cleanFilename}`;
    
    // Thêm token nếu cần
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
    if (token) {
      imageUrl += `?token=${encodeURIComponent(token)}`;
    }
    
    return imageUrl;
  }

  private processBusinessImageURL(business: Business): Business {
    return {
      ...business,
      certification_image: this.buildImageUrl(business.certification_image),
      front_cccd_image: this.buildImageUrl(business.front_cccd_image),
      back_cccd_image: this.buildImageUrl(business.back_cccd_image),
    };
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Thêm logging vào businessService.ts để debug
  async getAllBusinesses(): Promise<BusinessResponse> {
    try {
      const response = await this.makeRequest<BusinessResponse>('/api/business');
      
      const processedData = (response.data || []).map((b: Business) => this.processBusinessImageURL(b));
      
      return {
        success: true,
        message: response.message || 'Success',
        data: processedData,
        total: response.total,
        page: response.page,
        limit: response.limit
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        data: []
      };
    }
  }

  async getApprovedBusiness(): Promise<BusinessResponse> {
    try {
      const response = await this.makeRequest<any>('/api/approved-business');
      if (response && response.success && response.data) {
        const processedData = response.data.map((b: Business) => this.processBusinessImageURL(b));
        return {
          success: true,
          message: response.message || `Found ${response.data.length} approved businesses`,
          data: processedData
        };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      // Fallback: filter from all businesses
      try {
        const allBusinesses = await this.getAllBusinesses();
        if (allBusinesses.success) {
          const approvedBusinesses = allBusinesses.data.filter((b: Business) => b.approved === true);
          return {
            success: true,
            message: `Fallback: Found ${approvedBusinesses.length} approved businesses`,
            data: approvedBusinesses
          };
        }
        return allBusinesses;
      } catch (fallbackError) {
        return {
          success: false,
          message: fallbackError instanceof Error ? fallbackError.message : 'Unknown error',
          data: []
        };
      }
    }
  }

  async getPendingBusiness(): Promise<BusinessResponse> {
    try {
      const allBusinesses = await this.getAllBusinesses();
      if (allBusinesses.success) {
        const pendingBusinesses = allBusinesses.data.filter((b: Business) => 
          b.approved === false || b.approved === null || b.approved === undefined
        );
        return {
          success: true,
          message: `Found ${pendingBusinesses.length} pending businesses`,
          data: pendingBusinesses
        };
      } else {
        return allBusinesses;
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        data: []
      };
    }
  }

  async getBusinessById(id: number): Promise<SingleBusinessResponse> {
    try {
      const response = await this.makeRequest<SingleBusinessResponse>(`/api/business/${id}`);
      return {
        ...response,
        data: this.processBusinessImageURL(response.data),
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        data: {} as Business
      };
    }
  }

  async approveBusiness(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.makeRequest<{ success: boolean; message: string }>('/api/approve-business', {
        method: 'POST',
        body: JSON.stringify({ id: id.toString() }),
      });
      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async rejectBusiness(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.makeRequest<{ success: boolean; message: string }>('/api/reject-business', {
        method: 'POST',
        body: JSON.stringify({ id: id.toString() }),
      });
      return response;
    } catch (error) {
      // Fallback to PUT method
      try {
        const response = await this.makeRequest<{ success: boolean; message: string }>(`/api/business/${id}/status`, {
          method: 'PUT',
          body: JSON.stringify({ approved: false }),
        });
        return response;
      } catch (fallbackError) {
        return {
          success: false,
          message: fallbackError instanceof Error ? fallbackError.message : 'Unknown error'
        };
      }
    }
  }

  async updateBusinessStatus(id: number, approved: boolean): Promise<{ success: boolean; message: string }> {
    return approved ? this.approveBusiness(id) : this.rejectBusiness(id);
  }

  async updateBusiness(id: number, businessData: Partial<Business>): Promise<{ success: boolean; message: string }> {
    try {
      const updateData = { ...businessData };
      delete updateData.id;
      delete updateData.createdAt;
      delete updateData.updatedAt;

      const response = await this.makeRequest<{ success: boolean; message: string }>(`/api/business/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async deleteBusiness(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.makeRequest<{ success: boolean; message: string }>(`/api/business/${id}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * TỰ ĐỘNG ĐỒNG BỘ DOANH NGHIỆP CHỜ DUYỆT LÊN BLOCKCHAIN
   * Gọi hàm này khi có doanh nghiệp mới được tạo hoặc cập nhật
   */
  async syncPendingBusinessesToBlockchain(): Promise<{
    success: boolean;
    message: string;
    synced: number;
    errors: string[];
  }> {
    try {
      // Import contractKycService tại đây để tránh circular dependency
      const { contractKycService } = await import('./businessKyc');
      
      const pendingResponse = await this.getPendingBusiness();
      if (!pendingResponse.success) {
        return {
          success: false,
          message: 'Không thể lấy danh sách doanh nghiệp chờ duyệt',
          synced: 0,
          errors: [pendingResponse.message]
        };
      }

      const pendingBusinesses = pendingResponse.data.filter(b => b.address_wallet); // Chỉ sync những doanh nghiệp có wallet
      if (pendingBusinesses.length === 0) {
        return {
          success: true,
          message: 'Không có doanh nghiệp nào cần đồng bộ',
          synced: 0,
          errors: []
        };
      }

      console.log(`Bắt đầu đồng bộ ${pendingBusinesses.length} doanh nghiệp lên blockchain...`);

      let synced = 0;
      const errors: string[] = [];

      for (const business of pendingBusinesses) {
        try {
          // Kiểm tra xem doanh nghiệp đã có trên blockchain chưa
          const existsResult = await contractKycService.getEnterpriseInfo(business.address_wallet);
          
          if (existsResult.success && existsResult.data) {
            console.log(`Doanh nghiệp ${business.name_company} đã tồn tại trên blockchain`);
            continue;
          }

          // Đồng bộ lên blockchain
          const syncResult = await contractKycService.syncBusinessToBlockchain(business);
          
          if (syncResult.success) {
            synced++;
            console.log(`✓ Đồng bộ thành công: ${business.name_company}`);
          } else {
            errors.push(`${business.name_company}: ${syncResult.message}`);
            console.error(`✗ Đồng bộ thất bại: ${business.name_company} - ${syncResult.message}`);
          }

          // Đợi giữa các transaction để tránh nonce conflicts
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error: any) {
          const errorMsg = `${business.name_company}: ${error.message || 'Unknown error'}`;
          errors.push(errorMsg);
          console.error(`✗ Lỗi đồng bộ: ${errorMsg}`);
        }
      }

      return {
        success: errors.length === 0,
        message: `Đã đồng bộ ${synced}/${pendingBusinesses.length} doanh nghiệp. ${errors.length} lỗi.`,
        synced,
        errors
      };

    } catch (error: any) {
      console.error('Lỗi tổng thể khi đồng bộ:', error);
      return {
        success: false,
        message: `Lỗi đồng bộ: ${error.message || 'Unknown error'}`,
        synced: 0,
        errors: [error.message || 'Unknown error']
      };
    }
  }

  /**
   * Đồng bộ một doanh nghiệp cụ thể lên blockchain
   */
  async syncSingleBusinessToBlockchain(businessId: number): Promise<{
    success: boolean;
    message: string;
    txHashes?: string[];
  }> {
    try {
      const { contractKycService } = await import('./businessKyc');
      
      const businessResponse = await this.getBusinessById(businessId);
      if (!businessResponse.success) {
        return {
          success: false,
          message: 'Không thể lấy thông tin doanh nghiệp'
        };
      }

      const business = businessResponse.data;
      if (!business.address_wallet) {
        return {
          success: false,
          message: 'Doanh nghiệp chưa có địa chỉ ví'
        };
      }

      return await contractKycService.syncBusinessToBlockchain(business);

    } catch (error: any) {
      return {
        success: false,
        message: `Lỗi đồng bộ: ${error.message || 'Unknown error'}`
      };
    }
  }

  // Thêm method này vào class BusinessService trong businessService.ts

/**
 * Xóa doanh nghiệp khỏi cả database VÀ blockchain
 */
async deleteBusinessWithBlockchain(id: number): Promise<{
  success: boolean;
  message: string;
  dbDeleted: boolean;
  blockchainDeleted: boolean;
  txHash?: string;
}> {
  try {
    // Lấy thông tin doanh nghiệp trước khi xóa
    const businessResponse = await this.getBusinessById(id);
    if (!businessResponse.success) {
      return {
        success: false,
        message: 'Không thể lấy thông tin doanh nghiệp',
        dbDeleted: false,
        blockchainDeleted: false
      };
    }

    const business = businessResponse.data;
    let blockchainDeleted = false;
    let txHash: string | undefined;
    let blockchainMessage = '';

    // Nếu có địa chỉ ví, xóa khỏi blockchain trước
    if (business.address_wallet) {
      try {
        const { contractKycService } = await import('./businessKyc');
        
        const blockchainResult = await contractKycService.deleteEnterpriseFromBlockchain(
          business.address_wallet
        );
        
        blockchainDeleted = blockchainResult.success;
        txHash = blockchainResult.txHash;
        blockchainMessage = blockchainResult.message;

        if (!blockchainResult.success) {
          console.warn('⚠️ Không thể xóa khỏi blockchain:', blockchainResult.message);
        }
      } catch (blockchainError: any) {
        console.error('❌ Lỗi khi xóa blockchain:', blockchainError);
        blockchainMessage = blockchainError.message || 'Lỗi không xác định';
      }
    }

    // Xóa khỏi database
    const dbResponse = await this.deleteBusiness(id);
    
    if (!dbResponse.success) {
      return {
        success: false,
        message: `Xóa database thất bại: ${dbResponse.message}`,
        dbDeleted: false,
        blockchainDeleted,
        txHash
      };
    }

    // Tổng hợp kết quả
    let finalMessage = '';
    if (business.address_wallet) {
      if (blockchainDeleted && dbResponse.success) {
        finalMessage = `✅ Đã xóa doanh nghiệp khỏi cả database và blockchain thành công!\n\nTx Hash: ${txHash}`;
      } else if (dbResponse.success && !blockchainDeleted) {
        finalMessage = `✅ Đã xóa khỏi database\n⚠️ Blockchain: ${blockchainMessage}`;
      } else {
        finalMessage = `❌ Có lỗi xảy ra khi xóa`;
      }
    } else {
      finalMessage = '✅ Đã xóa doanh nghiệp khỏi database (không có dữ liệu blockchain)';
    }

    return {
      success: dbResponse.success,
      message: finalMessage,
      dbDeleted: dbResponse.success,
      blockchainDeleted,
      txHash
    };

  } catch (error: any) {
    console.error('❌ Lỗi tổng thể khi xóa:', error);
    return {
      success: false,
      message: `Lỗi: ${error.message || 'Unknown error'}`,
      dbDeleted: false,
      blockchainDeleted: false
    };
  }
}
}

export const businessService = new BusinessService();