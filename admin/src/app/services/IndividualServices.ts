const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Individual {
  id: number;
  full_name: string;
  date_of_birth: string;
  address: string;
  nationality: string;
  cccd_number: string;
  phone: string;
  email: string;
  front_cccd_image?: string;
  back_cccd_image?: string;
  address_wallet: string;
  otp_code?: string;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IndividualResponse {
  success: boolean;
  message: string;
  data: Individual[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface SingleIndividualResponse {
  success: boolean;
  message: string;
  data: Individual;
}

class IndividualService {
  private buildImageUrl(filename?: string): string | undefined {
    if (!filename) return undefined;
    
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
      return filename;
    }
    
    const cleanFilename = filename.replace(/^.*[\\\/]/, '');
    let imageUrl = `${API_BASE_URL}/api/upload/${cleanFilename}`;
    
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
    if (token) {
      imageUrl += `?token=${encodeURIComponent(token)}`;
    }
    
    return imageUrl;
  }

  private processIndividualImageURL(individual: Individual): Individual {
    return {
      ...individual,
      front_cccd_image: this.buildImageUrl(individual.front_cccd_image),
      back_cccd_image: this.buildImageUrl(individual.back_cccd_image),
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

  async getAllIndividuals(): Promise<IndividualResponse> {
    try {
      const response = await this.makeRequest<IndividualResponse>('/api/individual');
      const processedData = (response.data || []).map(i => this.processIndividualImageURL(i));
      
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

  async getApprovedIndividuals(): Promise<IndividualResponse> {
    try {
      const response = await this.makeRequest<any>('/api/approved-individual');
      if (response && response.success && response.data) {
        const processedData = response.data.map((i: Individual) => this.processIndividualImageURL(i));
        return {
          success: true,
          message: response.message || `Found ${response.data.length} approved individuals`,
          data: processedData
        };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      try {
        const allIndividuals = await this.getAllIndividuals();
        if (allIndividuals.success) {
          const approvedIndividuals = allIndividuals.data.filter(i => i.approved === true);
          return {
            success: true,
            message: `Fallback: Found ${approvedIndividuals.length} approved individuals`,
            data: approvedIndividuals
          };
        }
        return allIndividuals;
      } catch (fallbackError) {
        return {
          success: false,
          message: fallbackError instanceof Error ? fallbackError.message : 'Unknown error',
          data: []
        };
      }
    }
  }

  async getPendingIndividuals(): Promise<IndividualResponse> {
    try {
      const allIndividuals = await this.getAllIndividuals();
      if (allIndividuals.success) {
        const pendingIndividuals = allIndividuals.data.filter(i => 
          i.approved === false || i.approved === null || i.approved === undefined
        );
        return {
          success: true,
          message: `Found ${pendingIndividuals.length} pending individuals`,
          data: pendingIndividuals
        };
      } else {
        return allIndividuals;
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        data: []
      };
    }
  }

  async getIndividualById(id: number): Promise<SingleIndividualResponse> {
    try {
      const response = await this.makeRequest<SingleIndividualResponse>(`/api/individual/${id}`);
      return {
        ...response,
        data: this.processIndividualImageURL(response.data),
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        data: {} as Individual
      };
    }
  }

  async approveIndividual(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.makeRequest<{ success: boolean; message: string }>('/api/approve-individual', {
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

  async rejectIndividual(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.makeRequest<{ success: boolean; message: string }>('/api/reject-individual', {
        method: 'POST',
        body: JSON.stringify({ id: id.toString() }),
      });
      return response;
    } catch (error) {
      try {
        const response = await this.makeRequest<{ success: boolean; message: string }>(`/api/individual/${id}/status`, {
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

  async updateIndividualStatus(id: number, approved: boolean): Promise<{ success: boolean; message: string }> {
    return approved ? this.approveIndividual(id) : this.rejectIndividual(id);
  }

  async updateIndividual(id: number, individualData: Partial<Individual>): Promise<{ success: boolean; message: string }> {
    try {
      const updateData = { ...individualData };
      delete updateData.id;
      delete updateData.createdAt;
      delete updateData.updatedAt;

      const response = await this.makeRequest<{ success: boolean; message: string }>(`/api/individual/${id}`, {
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

  async deleteIndividual(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.makeRequest<{ success: boolean; message: string }>(`/api/individual/${id}`, {
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
   * TỰ ĐỘNG ĐỒNG BỘ CÁ NHÂN CHỜ DUYỆT LÊN BLOCKCHAIN
   */
  async syncPendingIndividualsToBlockchain(): Promise<{
    success: boolean;
    message: string;
    synced: number;
    errors: string[];
  }> {
    try {
      const { contractIndividualKycService } = await import('./individualKyc');
      
      const pendingResponse = await this.getPendingIndividuals();
      if (!pendingResponse.success) {
        return {
          success: false,
          message: 'Không thể lấy danh sách cá nhân chờ duyệt',
          synced: 0,
          errors: [pendingResponse.message]
        };
      }

      const pendingIndividuals = pendingResponse.data.filter(i => i.address_wallet);
      if (pendingIndividuals.length === 0) {
        return {
          success: true,
          message: 'Không có cá nhân nào cần đồng bộ',
          synced: 0,
          errors: []
        };
      }

      console.log(`Bắt đầu đồng bộ ${pendingIndividuals.length} cá nhân lên blockchain...`);

      let synced = 0;
      const errors: string[] = [];

// Thay đổi trong IndividualServices.ts, khoảng dòng 298-310
for (const individual of pendingIndividuals) {
  try {
    // Sử dụng method public mới
    const exists = await contractIndividualKycService.checkIndividualExists(individual.address_wallet);
    
    if (exists) {
      console.log(`Cá nhân ${individual.full_name} đã tồn tại trên blockchain`);
      continue;
    }

    const syncResult = await contractIndividualKycService.syncIndividualToBlockchain(individual);
    
    if (syncResult.success) {
      synced++;
      console.log(`✓ Đồng bộ thành công: ${individual.full_name}`);
    } else {
      errors.push(`${individual.full_name}: ${syncResult.message}`);
      console.error(`✗ Đồng bộ thất bại: ${individual.full_name} - ${syncResult.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

  } catch (error: any) {
    const errorMsg = `${individual.full_name}: ${error.message || 'Unknown error'}`;
    errors.push(errorMsg);
    console.error(`✗ Lỗi đồng bộ: ${errorMsg}`);
  }
}
      return {
        success: errors.length === 0,
        message: `Đã đồng bộ ${synced}/${pendingIndividuals.length} cá nhân. ${errors.length} lỗi.`,
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

  async deleteIndividualWithBlockchain(id: number): Promise<{
  success: boolean;
  message: string;
  dbDeleted: boolean;
  blockchainDeleted: boolean;
  txHash?: string;
}> {
  try {
    // Lấy thông tin cá nhân trước khi xóa
    const individualResponse = await this.getIndividualById(id);
    if (!individualResponse.success) {
      return {
        success: false,
        message: 'Không thể lấy thông tin cá nhân',
        dbDeleted: false,
        blockchainDeleted: false
      };
    }

    const individual = individualResponse.data;
    let blockchainDeleted = false;
    let txHash: string | undefined;
    let blockchainMessage = '';

    // Nếu có địa chỉ ví, xóa khỏi blockchain trước
    if (individual.address_wallet) {
      try {
        const { contractIndividualKycService } = await import('./individualKyc');
        
        const blockchainResult = await contractIndividualKycService.deleteIndividualFromBlockchain(
          individual.address_wallet
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
    const dbResponse = await this.deleteIndividual(id);
    
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
    if (individual.address_wallet) {
      if (blockchainDeleted && dbResponse.success) {
        finalMessage = `✅ Đã xóa cá nhân khỏi cả database và blockchain thành công!\n\nTx Hash: ${txHash}`;
      } else if (dbResponse.success && !blockchainDeleted) {
        finalMessage = `✅ Đã xóa khỏi database\n⚠️ Blockchain: ${blockchainMessage}`;
      } else {
        finalMessage = `❌ Có lỗi xảy ra khi xóa`;
      }
    } else {
      finalMessage = '✅ Đã xóa cá nhân khỏi database (không có dữ liệu blockchain)';
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
  /**
   * Đồng bộ một cá nhân cụ thể lên blockchain
   */
  async syncSingleIndividualToBlockchain(individualId: number): Promise<{
    success: boolean;
    message: string;
    txHashes?: string[];
  }> {
    try {
      const { contractIndividualKycService } = await import('./individualKyc');
      
      const individualResponse = await this.getIndividualById(individualId);
      if (!individualResponse.success) {
        return {
          success: false,
          message: 'Không thể lấy thông tin cá nhân'
        };
      }

      const individual = individualResponse.data;
      if (!individual.address_wallet) {
        return {
          success: false,
          message: 'Cá nhân chưa có địa chỉ ví'
        };
      }

      return await contractIndividualKycService.syncIndividualToBlockchain(individual);

    } catch (error: any) {
      return {
        success: false,
        message: `Lỗi đồng bộ: ${error.message || 'Unknown error'}`
      };
    }
  }
}

export const individualService = new IndividualService();