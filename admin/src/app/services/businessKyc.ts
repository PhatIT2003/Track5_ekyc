import { ethers } from 'ethers';
import { ABI } from '../contract/ABI/ABIbusiness';
import { Business } from './businessService';
import { CryptoUtils, hashBusinessData, HashedBusinessData } from '../utils/cryptoUtils';

// Cấu hình contract
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_BUSINESS_CONTRACT_ADDRESS || '';
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || '';
const PRIVATE_KEY = process.env.NEXT_PUBLIC_PRIVATE_KEY || '';

export interface BlockchainBusiness {
  id: number;
  companyName: string;
  companyType: string;
  establishedDate: number;
  businessRegistrationNumber: string; // Đây sẽ là hash
  address_: string; // Đây sẽ là hash  
  industry: string;
  employeeCount: number;
  certificateImage: string; // Đây sẽ là hash
  idCardFrontImage: string; // Đây sẽ là hash
  idCardBackImage: string; // Đây sẽ là hash
  isApproved: boolean;
  email: string; // Đây sẽ là hash
  walletAddress: string;
  createdAt: number;
  updatedAt: number;
  exists: boolean;
}

class ContractKycService {
  private contract: ethers.Contract | null = null;
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet | null = null;
  
  // Lưu trữ mapping giữa hash và dữ liệu gốc (chỉ trong session)
  private hashMap: Map<string, string> = new Map();

  constructor() {
    this.provider = new ethers.JsonRpcProvider(RPC_URL);
    
    if (PRIVATE_KEY) {
      this.signer = new ethers.Wallet(PRIVATE_KEY, this.provider);
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, this.signer);
    }
  }

  /**
   * Kiểm tra xem contract đã được khởi tạo chưa
   */
  private checkContract(): boolean {
    if (!this.contract || !this.signer) {
      console.error('Contract chưa được khởi tạo. Kiểm tra CONTRACT_ADDRESS và PRIVATE_KEY');
      return false;
    }
    return true;
  }

  /**
   * Chuyển đổi dữ liệu từ Business sang định dạng blockchain với hashing
   */
  private convertBusinessToHashedBlockchain(business: Business): {
    walletAddress: string;
    companyName: string;
    companyType: string;
    establishedDate: number;
    businessRegistrationNumber: string; // HASHED
    address: string; // HASHED
    industry: string;
    employeeCount: number;
    hashedData: HashedBusinessData;
  } {
    console.log('🔒 Bắt đầu hash dữ liệu nhạy cảm...');
    
    // Hash dữ liệu nhạy cảm
    const hashedData = hashBusinessData(business);
    
    // Lưu mapping để có thể trace back (chỉ trong session)
    this.hashMap.set(hashedData.hashedEmail, business.email);
    this.hashMap.set(hashedData.hashedBusinessRegNumber, business.business_registration_number);
    this.hashMap.set(hashedData.hashedAddress, business.address);
    
    if (business.certification_image) {
      this.hashMap.set(hashedData.hashedCertificateImage, business.certification_image);
    }
    if (business.front_cccd_image) {
      this.hashMap.set(hashedData.hashedIdCardFront, business.front_cccd_image);
    }
    if (business.back_cccd_image) {
      this.hashMap.set(hashedData.hashedIdCardBack, business.back_cccd_image);
    }

    console.log('✅ Đã hash thành công các trường nhạy cảm:');
    console.log('- Email:', CryptoUtils.maskSensitiveData(business.email) + ' -> ' + hashedData.hashedEmail.substring(0, 16) + '...');
    console.log('- Số đăng ký:', CryptoUtils.maskSensitiveData(business.business_registration_number) + ' -> ' + hashedData.hashedBusinessRegNumber.substring(0, 16) + '...');
    console.log('- Địa chỉ:', CryptoUtils.maskSensitiveData(business.address, 20) + ' -> ' + hashedData.hashedAddress.substring(0, 16) + '...');

    return {
      walletAddress: business.address_wallet || '0x0000000000000000000000000000000000000000',
      companyName: business.name_company || '',
      companyType: business.type_company || '',
      establishedDate: hashedData.establishedDate,
      businessRegistrationNumber: hashedData.hashedBusinessRegNumber, // HASHED
      address: hashedData.hashedAddress, // HASHED
      industry: business.career || '',
      employeeCount: business.number_of_employees || 0,
      hashedData
    };
  }

  /**
   * Đăng ký doanh nghiệp mới lên blockchain với dữ liệu đã hash
   */
  async registerEnterprise(business: Business): Promise<{
    success: boolean;
    message: string;
    txHash?: string;
    hashedData?: HashedBusinessData;
  }> {
    if (!this.checkContract()) {
      return {
        success: false,
        message: 'Contract chưa được cấu hình đúng'
      };
    }

    try {
      const blockchainData = this.convertBusinessToHashedBlockchain(business);

      // Kiểm tra xem doanh nghiệp đã tồn tại chưa
      const exists = await this.contract!.checkEnterpriseExists(blockchainData.walletAddress);
      if (exists) {
        return {
          success: false,
          message: 'Doanh nghiệp đã tồn tại trên blockchain'
        };
      }

      console.log('📝 Đang đăng ký doanh nghiệp lên blockchain với dữ liệu đã hash...');
      console.log('Public data:', {
        walletAddress: blockchainData.walletAddress,
        companyName: blockchainData.companyName,
        companyType: blockchainData.companyType,
        industry: blockchainData.industry,
        employeeCount: blockchainData.employeeCount
      });

      // Gọi hàm registerEnterprise với dữ liệu đã hash
      const tx = await this.contract!.registerEnterprise(
        blockchainData.walletAddress,
        blockchainData.companyName,
        blockchainData.companyType,
        blockchainData.establishedDate,
        blockchainData.businessRegistrationNumber, // HASHED
        blockchainData.address, // HASHED
        blockchainData.industry,
        blockchainData.employeeCount
      );

      console.log('📤 Transaction sent:', tx.hash);
      
      // Chờ transaction được confirm
      const receipt = await tx.wait();
      console.log('✅ Transaction confirmed:', receipt.transactionHash);

      return {
        success: true,
        message: 'Đã đăng ký doanh nghiệp lên blockchain với dữ liệu đã mã hóa',
        txHash: tx.hash,
        hashedData: blockchainData.hashedData
      };

    } catch (error: any) {
      console.error('❌ Lỗi khi đăng ký doanh nghiệp:', error);
      
      let errorMessage = 'Lỗi không xác định';
      if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        message: `Lỗi đăng ký blockchain: ${errorMessage}`
      };
    }
  }


async deleteEnterpriseFromBlockchain(walletAddress: string): Promise<{
  success: boolean;
  message: string;
  txHash?: string;
}> {
  if (!this.checkContract()) {
    return {
      success: false,
      message: 'Contract chưa được cấu hình đúng'
    };
  }

  try {
    console.log('🗑️ Đang xóa doanh nghiệp khỏi blockchain:', walletAddress);

    // Kiểm tra xem doanh nghiệp có tồn tại không
    const exists = await this.contract!.checkEnterpriseExists(walletAddress);
    if (!exists) {
      return {
        success: false,
        message: 'Doanh nghiệp không tồn tại trên blockchain'
      };
    }

    const tx = await this.contract!.deleteEnterprise(walletAddress);
    console.log('📤 Delete transaction sent:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('✅ Delete transaction confirmed:', receipt.transactionHash);

    // Xóa hash mapping liên quan
    this.clearHashMapping();

    return {
      success: true,
      message: 'Đã xóa doanh nghiệp khỏi blockchain thành công',
      txHash: tx.hash
    };

  } catch (error: any) {
    console.error('❌ Lỗi khi xóa doanh nghiệp khỏi blockchain:', error);
    
    let errorMessage = 'Lỗi không xác định';
    if (error.reason) {
      errorMessage = error.reason;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      message: `Lỗi xóa blockchain: ${errorMessage}`
    };
  }
}
  /**
   * Thêm thông tin bổ sung với hashing
   */
  async addAdditionalInfo(business: Business): Promise<{
    success: boolean;
    message: string;
    txHash?: string;
  }> {
    if (!this.checkContract()) {
      return {
        success: false,
        message: 'Contract chưa được cấu hình đúng'
      };
    }

    try {
      const walletAddress = business.address_wallet || '0x0000000000000000000000000000000000000000';
      
      // Hash các URL hình ảnh và email
      const hashedEmail = CryptoUtils.hashPersonalInfo(business.email || '');
      const hashedCertImage = CryptoUtils.hashImageUrl(business.certification_image || '');
      const hashedFrontCccd = CryptoUtils.hashImageUrl(business.front_cccd_image || '');
      const hashedBackCccd = CryptoUtils.hashImageUrl(business.back_cccd_image || '');

      console.log('🔒 Đang thêm thông tin bổ sung đã hash:', {
        walletAddress,
        hashedEmail: hashedEmail.substring(0, 16) + '...',
        hashedCertImage: hashedCertImage.substring(0, 16) + '...',
        hashedFrontCccd: hashedFrontCccd.substring(0, 16) + '...',
        hashedBackCccd: hashedBackCccd.substring(0, 16) + '...'
      });

      // Lưu mapping
      if (business.email) this.hashMap.set(hashedEmail, business.email);
      if (business.certification_image) this.hashMap.set(hashedCertImage, business.certification_image);
      if (business.front_cccd_image) this.hashMap.set(hashedFrontCccd, business.front_cccd_image);
      if (business.back_cccd_image) this.hashMap.set(hashedBackCccd, business.back_cccd_image);

      const tx = await this.contract!.addAdditionalInfo(
        walletAddress,
        hashedCertImage, // HASHED
        hashedFrontCccd, // HASHED
        hashedBackCccd, // HASHED
        hashedEmail // HASHED
      );

      console.log('📤 Additional info transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('✅ Additional info transaction confirmed:', receipt.transactionHash);

      return {
        success: true,
        message: 'Đã thêm thông tin bổ sung lên blockchain (đã mã hóa)',
        txHash: tx.hash
      };

    } catch (error: any) {
      console.error('❌ Lỗi khi thêm thông tin bổ sung:', error);
      return {
        success: false,
        message: `Lỗi thêm thông tin blockchain: ${error.message || 'Unknown error'}`
      };
    }
  }

  /**
   * Phê duyệt doanh nghiệp trên blockchain
   */
  async approveEnterprise(walletAddress: string, approved: boolean = true): Promise<{
    success: boolean;
    message: string;
    txHash?: string;
  }> {
    if (!this.checkContract()) {
      return {
        success: false,
        message: 'Contract chưa được cấu hình đúng'
      };
    }

    try {
      console.log(`🔄 Đang ${approved ? 'phê duyệt' : 'từ chối'} doanh nghiệp:`, walletAddress);

      const tx = await this.contract!.approveEnterprise(walletAddress, approved);
      console.log('📤 Approval transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('✅ Approval transaction confirmed:', receipt.transactionHash);

      return {
        success: true,
        message: `Đã ${approved ? 'phê duyệt' : 'từ chối'} doanh nghiệp trên blockchain`,
        txHash: tx.hash
      };

    } catch (error: any) {
      console.error('❌ Lỗi khi phê duyệt doanh nghiệp:', error);
      return {
        success: false,
        message: `Lỗi phê duyệt blockchain: ${error.message || 'Unknown error'}`
      };
    }
  }

  /**
   * Lấy thông tin doanh nghiệp từ blockchain (dữ liệu sẽ là hash)
   */
  async getEnterpriseInfo(walletAddress: string): Promise<{
    success: boolean;
    data?: BlockchainBusiness;
    message: string;
    originalDataHints?: { [key: string]: string }; // Gợi ý dữ liệu gốc nếu có trong session
  }> {
    if (!this.checkContract()) {
      return {
        success: false,
        message: 'Contract chưa được cấu hình đúng'
      };
    }

    try {
      const result = await this.contract!.adminViewEnterpriseInfo(walletAddress);
      
      if (!result.exists) {
        return {
          success: false,
          message: 'Doanh nghiệp không tồn tại trên blockchain'
        };
      }

      const businessData: BlockchainBusiness = {
        id: Number(result.id),
        companyName: result.companyName,
        companyType: result.companyType,
        establishedDate: Number(result.establishedDate),
        businessRegistrationNumber: result.businessRegistrationNumber, // HASHED
        address_: result.address_, // HASHED
        industry: result.industry,
        employeeCount: Number(result.employeeCount),
        certificateImage: result.certificateImage, // HASHED
        idCardFrontImage: result.idCardFrontImage, // HASHED
        idCardBackImage: result.idCardBackImage, // HASHED
        isApproved: result.isApproved,
        email: result.email, // HASHED
        walletAddress: result.walletAddress,
        createdAt: Number(result.createdAt),
        updatedAt: Number(result.updatedAt),
        exists: result.exists
      };

      // Cung cấp hints về dữ liệu gốc nếu có trong session
      const originalDataHints: { [key: string]: string } = {};
      if (this.hashMap.has(businessData.email)) {
        originalDataHints.email = CryptoUtils.maskSensitiveData(this.hashMap.get(businessData.email)!);
      }
      if (this.hashMap.has(businessData.businessRegistrationNumber)) {
        originalDataHints.businessRegistrationNumber = CryptoUtils.maskSensitiveData(this.hashMap.get(businessData.businessRegistrationNumber)!);
      }
      if (this.hashMap.has(businessData.address_)) {
        originalDataHints.address = CryptoUtils.maskSensitiveData(this.hashMap.get(businessData.address_)!, 20);
      }

      return {
        success: true,
        data: businessData,
        message: 'Lấy thông tin thành công (dữ liệu nhạy cảm đã được hash)',
        originalDataHints
      };

    } catch (error: any) {
      console.error('❌ Lỗi khi lấy thông tin doanh nghiệp:', error);
      return {
        success: false,
        message: `Lỗi lấy thông tin: ${error.message || 'Unknown error'}`
      };
    }
  }

  /**
   * Lấy danh sách tất cả doanh nghiệp (dữ liệu sẽ là hash)
   */
  async getAllEnterprises(): Promise<{
    success: boolean;
    data?: BlockchainBusiness[];
    message: string;
  }> {
    if (!this.checkContract()) {
      return {
        success: false,
        message: 'Contract chưa được cấu hình đúng'
      };
    }

    try {
      const totalEnterprises = await this.contract!.getTotalEnterprises();
      const total = Number(totalEnterprises);

      if (total === 0) {
        return {
          success: true,
          data: [],
          message: 'Không có doanh nghiệp nào'
        };
      }

      // Lấy danh sách theo batch (tối đa 100 cái một lần)
      const batchSize = 100;
      const enterprises: BlockchainBusiness[] = [];

      for (let start = 0; start < total; start += batchSize) {
        const end = Math.min(start + batchSize - 1, total - 1);
        const batch = await this.contract!.getEnterpriseListByRange(start, end);
        
        for (const item of batch) {
          if (item.exists) {
            enterprises.push({
              id: Number(item.id),
              companyName: item.companyName,
              companyType: item.companyType,
              establishedDate: Number(item.establishedDate),
              businessRegistrationNumber: item.businessRegistrationNumber, // HASHED
              address_: item.address_, // HASHED
              industry: item.industry,
              employeeCount: Number(item.employeeCount),
              certificateImage: item.certificateImage, // HASHED
              idCardFrontImage: item.idCardFrontImage, // HASHED
              idCardBackImage: item.idCardBackImage, // HASHED
              isApproved: item.isApproved,
              email: item.email, // HASHED
              walletAddress: item.walletAddress,
              createdAt: Number(item.createdAt),
              updatedAt: Number(item.updatedAt),
              exists: item.exists
            });
          }
        }
      }

      return {
        success: true,
        data: enterprises,
        message: `Lấy danh sách ${enterprises.length} doanh nghiệp thành công (dữ liệu nhạy cảm đã hash)`
      };

    } catch (error: any) {
      console.error('❌ Lỗi khi lấy danh sách doanh nghiệp:', error);
      return {
        success: false,
        message: `Lỗi lấy danh sách: ${error.message || 'Unknown error'}`
      };
    }
  }

  /**
   * Verify dữ liệu gốc với hash trên blockchain
   */
  async verifyBusinessData(business: Business, walletAddress: string): Promise<{
    success: boolean;
    verified: boolean;
    message: string;
    verificationDetails?: { [key: string]: boolean };
  }> {
    try {
      const blockchainResult = await this.getEnterpriseInfo(walletAddress);
      
      if (!blockchainResult.success || !blockchainResult.data) {
        return {
          success: false,
          verified: false,
          message: 'Không thể lấy thông tin từ blockchain để verify'
        };
      }

      const blockchainData = blockchainResult.data;
      
      // Hash dữ liệu hiện tại để so sánh
      const currentHashedEmail = CryptoUtils.hashPersonalInfo(business.email);
      const currentHashedRegNum = CryptoUtils.hashPersonalInfo(business.business_registration_number);
      const currentHashedAddress = CryptoUtils.hashAddress(business.address);
      
      // So sánh hash
      const verificationDetails = {
        email: currentHashedEmail === blockchainData.email,
        businessRegistrationNumber: currentHashedRegNum === blockchainData.businessRegistrationNumber,
        address: currentHashedAddress === blockchainData.address_,
        companyName: business.name_company === blockchainData.companyName,
        companyType: business.type_company === blockchainData.companyType
      };
      
      const allVerified = Object.values(verificationDetails).every(v => v);
      
      return {
        success: true,
        verified: allVerified,
        message: allVerified ? 'Tất cả dữ liệu khớp với blockchain' : 'Một số dữ liệu không khớp với blockchain',
        verificationDetails
      };

    } catch (error: any) {
      return {
        success: false,
        verified: false,
        message: `Lỗi verify: ${error.message || 'Unknown error'}`
      };
    }
  }

  /**
   * Tự động đồng bộ doanh nghiệp từ database lên blockchain với hashing
   */
  async syncBusinessToBlockchain(business: Business): Promise<{
    success: boolean;
    message: string;
    txHashes?: string[];
    hashedData?: HashedBusinessData;
  }> {
    const results: string[] = [];
    let hasError = false;
    let errorMessage = '';
    let hashedData: HashedBusinessData | undefined;

    try {
      console.log('🔄 Bắt đầu đồng bộ với hashing cho:', business.name_company);
      
      // Bước 1: Đăng ký thông tin cơ bản (đã hash)
      const registerResult = await this.registerEnterprise(business);
      if (registerResult.success && registerResult.txHash) {
        results.push(registerResult.txHash);
        hashedData = registerResult.hashedData;
        console.log('✓ Đã đăng ký thông tin cơ bản (hashed):', registerResult.txHash);
      } else {
        hasError = true;
        errorMessage += `Lỗi đăng ký: ${registerResult.message}. `;
      }

      // Bước 2: Thêm thông tin bổ sung (đã hash)
      if (!hasError && business.address_wallet) {
        // Đợi một chút để transaction trước được confirm
        await new Promise(resolve => setTimeout(resolve, 2000));

        const additionalResult = await this.addAdditionalInfo(business);
        if (additionalResult.success && additionalResult.txHash) {
          results.push(additionalResult.txHash);
          console.log('✓ Đã thêm thông tin bổ sung (hashed):', additionalResult.txHash);
        } else {
          console.warn('⚠ Lỗi thêm thông tin bổ sung:', additionalResult.message);
          errorMessage += `Lỗi thông tin bổ sung: ${additionalResult.message}. `;
        }
      }

      const finalMessage = hasError 
        ? `Đồng bộ không hoàn toàn: ${errorMessage}`
        : `Đồng bộ thành công với ${results.length} transaction (dữ liệu nhạy cảm đã được hash bảo mật)`;

      return {
        success: !hasError,
        message: finalMessage,
        txHashes: results,
        hashedData
      };

    } catch (error: any) {
      console.error('❌ Lỗi đồng bộ tổng thể:', error);
      return {
        success: false,
        message: `Lỗi đồng bộ: ${error.message || 'Unknown error'}`,
        txHashes: results,
        hashedData
      };
    }
  }

  /**
   * Lấy thông tin hash mapping (chỉ trong phiên làm việc hiện tại)
   */
  getHashMappingInfo(): { totalMappings: number; hashedFields: string[] } {
    const hashedFields = Array.from(this.hashMap.keys()).map(hash => 
      hash.substring(0, 16) + '...'
    );
    
    return {
      totalMappings: this.hashMap.size,
      hashedFields
    };
  }

  /**
   * Xóa hash mapping (bảo mật)
   */
  clearHashMapping(): void {
    this.hashMap.clear();
    console.log('🗑️ Đã xóa hash mapping để bảo mật');
  }
}

// Export singleton instance
export const contractKycService = new ContractKycService();