import { ethers } from 'ethers';
import { ABI } from '../contract/ABI/ABIIndividual';
import { Individual } from './IndividualServices';
import { CryptoUtils } from '../utils/cryptoUtils';

// Cấu hình contract
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_INDIVIDUAL_CONTRACT_ADDRESS || '';
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || '';
const PRIVATE_KEY = process.env.NEXT_PUBLIC_PRIVATE_KEY || '';

export interface HashedIndividualData {
  hashedEmail: string;
  hashedCccdNumber: string;
  hashedAddress: string;
  hashedPhone: string;
  hashedIdCardFront: string;
  hashedIdCardBack: string;
  dateOfBirth: number;
}

export interface BlockchainIndividual {
  id: number;
  fullName: string;
  dateOfBirth: number;
  address_: string; // HASHED
  nationality: string;
  cccdNumber: string; // HASHED
  phone: string; // HASHED
  email: string; // HASHED
  frontCccdImage: string; // HASHED
  backCccdImage: string; // HASHED
  walletAddress: string;
  isApproved: boolean;
  createdAt: number;
  updatedAt: number;
  exists: boolean;
}

// Hash individual data
export const hashIndividualData = (individual: Individual): HashedIndividualData => {
  return {
    hashedEmail: CryptoUtils.hashPersonalInfo(individual.email || ''),
    hashedCccdNumber: CryptoUtils.hashPersonalInfo(individual.cccd_number || ''),
    hashedAddress: CryptoUtils.hashAddress(individual.address || ''),
    hashedPhone: CryptoUtils.hashPersonalInfo(individual.phone || ''),
    hashedIdCardFront: CryptoUtils.hashImageUrl(individual.front_cccd_image || ''),
    hashedIdCardBack: CryptoUtils.hashImageUrl(individual.back_cccd_image || ''),
    dateOfBirth: new Date(individual.date_of_birth).getTime()
  };
};

class ContractIndividualKycService {
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

  private checkContract(): boolean {
    if (!this.contract || !this.signer) {
      console.error('Contract chưa được khởi tạo. Kiểm tra CONTRACT_ADDRESS và PRIVATE_KEY');
      return false;
    }
    return true;
  }

  private convertIndividualToHashedBlockchain(individual: Individual): {
    walletAddress: string;
    fullName: string;
    dateOfBirth: number;
    address: string; // HASHED
    nationality: string;
    cccdNumber: string; // HASHED
    phone: string; // HASHED
    hashedData: HashedIndividualData;
  } {
    console.log('🔐 Bắt đầu hash dữ liệu nhạy cảm Individual...');
    
    const hashedData = hashIndividualData(individual);
    
    // Lưu mapping
    this.hashMap.set(hashedData.hashedEmail, individual.email);
    this.hashMap.set(hashedData.hashedCccdNumber, individual.cccd_number);
    this.hashMap.set(hashedData.hashedAddress, individual.address);
    this.hashMap.set(hashedData.hashedPhone, individual.phone);
    
    if (individual.front_cccd_image) {
      this.hashMap.set(hashedData.hashedIdCardFront, individual.front_cccd_image);
    }
    if (individual.back_cccd_image) {
      this.hashMap.set(hashedData.hashedIdCardBack, individual.back_cccd_image);
    }

    console.log('✅ Đã hash thành công các trường nhạy cảm Individual');

    return {
      walletAddress: individual.address_wallet || '0x0000000000000000000000000000000000000000',
      fullName: individual.full_name || '',
      dateOfBirth: hashedData.dateOfBirth,
      address: hashedData.hashedAddress, // HASHED
      nationality: individual.nationality || '',
      cccdNumber: hashedData.hashedCccdNumber, // HASHED
      phone: hashedData.hashedPhone, // HASHED
      hashedData
    };
  }

// Thêm method này vào class ContractIndividualKycService
async checkIndividualExists(walletAddress: string): Promise<boolean> {
  if (!this.checkContract()) {
    return false;
  }

  try {
    const exists = await this.contract!.checkIndividualExists(walletAddress);
    return exists;
  } catch (error: any) {
    console.error('Lỗi kiểm tra tồn tại:', error);
    return false;
  }
}
  async registerIndividual(individual: Individual): Promise<{
    success: boolean;
    message: string;
    txHash?: string;
    hashedData?: HashedIndividualData;
  }> {
    if (!this.checkContract()) {
      return {
        success: false,
        message: 'Contract chưa được cấu hình đúng'
      };
    }

    try {
      const blockchainData = this.convertIndividualToHashedBlockchain(individual);

      const exists = await this.contract!.checkIndividualExists(blockchainData.walletAddress);
      if (exists) {
        return {
          success: false,
          message: 'Cá nhân đã tồn tại trên blockchain'
        };
      }

      console.log('📝 Đang đăng ký cá nhân lên blockchain với dữ liệu đã hash...');

      const tx = await this.contract!.registerIndividual(
        blockchainData.walletAddress,
        blockchainData.fullName,
        blockchainData.dateOfBirth,
        blockchainData.address, // HASHED
        blockchainData.nationality,
        blockchainData.cccdNumber, // HASHED
        blockchainData.phone // HASHED
      );

      console.log('📤 Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('✅ Transaction confirmed:', receipt.transactionHash);

      return {
        success: true,
        message: 'Đã đăng ký cá nhân lên blockchain với dữ liệu đã mã hóa',
        txHash: tx.hash,
        hashedData: blockchainData.hashedData
      };

    } catch (error: any) {
      console.error('❌ Lỗi khi đăng ký cá nhân:', error);
      
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

  async addAdditionalInfo(individual: Individual): Promise<{
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
      const walletAddress = individual.address_wallet || '0x0000000000000000000000000000000000000000';
      
      const hashedEmail = CryptoUtils.hashPersonalInfo(individual.email || '');
      const hashedFrontCccd = CryptoUtils.hashImageUrl(individual.front_cccd_image || '');
      const hashedBackCccd = CryptoUtils.hashImageUrl(individual.back_cccd_image || '');

      console.log('🔐 Đang thêm thông tin bổ sung đã hash Individual');

      if (individual.email) this.hashMap.set(hashedEmail, individual.email);
      if (individual.front_cccd_image) this.hashMap.set(hashedFrontCccd, individual.front_cccd_image);
      if (individual.back_cccd_image) this.hashMap.set(hashedBackCccd, individual.back_cccd_image);

      const tx = await this.contract!.addAdditionalInfo(
        walletAddress,
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

  async approveIndividual(walletAddress: string, approved: boolean = true): Promise<{
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
      console.log(`📄 Đang ${approved ? 'phê duyệt' : 'từ chối'} cá nhân:`, walletAddress);

      const tx = await this.contract!.approveIndividual(walletAddress, approved);
      console.log('📤 Approval transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('✅ Approval transaction confirmed:', receipt.transactionHash);

      return {
        success: true,
        message: `Đã ${approved ? 'phê duyệt' : 'từ chối'} cá nhân trên blockchain`,
        txHash: tx.hash
      };

    } catch (error: any) {
      console.error('❌ Lỗi khi phê duyệt cá nhân:', error);
      return {
        success: false,
        message: `Lỗi phê duyệt blockchain: ${error.message || 'Unknown error'}`
      };
    }
  }

  async deleteIndividualFromBlockchain(walletAddress: string): Promise<{
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
    console.log('🗑️ Đang xóa cá nhân khỏi blockchain:', walletAddress);

    // Kiểm tra xem cá nhân có tồn tại không
    const exists = await this.contract!.checkIndividualExists(walletAddress);
    if (!exists) {
      return {
        success: false,
        message: 'Cá nhân không tồn tại trên blockchain'
      };
    }

    const tx = await this.contract!.deleteIndividual(walletAddress);
    console.log('📤 Delete transaction sent:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('✅ Delete transaction confirmed:', receipt.transactionHash);

    // Xóa hash mapping liên quan
    this.clearHashMapping();

    return {
      success: true,
      message: 'Đã xóa cá nhân khỏi blockchain thành công',
      txHash: tx.hash
    };

  } catch (error: any) {
    console.error('❌ Lỗi khi xóa cá nhân khỏi blockchain:', error);
    
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

  async getIndividualInfo(walletAddress: string): Promise<{
    success: boolean;
    data?: BlockchainIndividual;
    message: string;
    originalDataHints?: { [key: string]: string };
  }> {
    if (!this.checkContract()) {
      return {
        success: false,
        message: 'Contract chưa được cấu hình đúng'
      };
    }

    try {
      const result = await this.contract!.adminViewIndividualInfo(walletAddress);
      
      if (!result.exists) {
        return {
          success: false,
          message: 'Cá nhân không tồn tại trên blockchain'
        };
      }

      const individualData: BlockchainIndividual = {
        id: Number(result.id),
        fullName: result.fullName,
        dateOfBirth: Number(result.dateOfBirth),
        address_: result.address_, // HASHED
        nationality: result.nationality,
        cccdNumber: result.cccdNumber, // HASHED
        phone: result.phone, // HASHED
        email: result.email, // HASHED
        frontCccdImage: result.frontCccdImage, // HASHED
        backCccdImage: result.backCccdImage, // HASHED
        walletAddress: result.walletAddress,
        isApproved: result.isApproved,
        createdAt: Number(result.createdAt),
        updatedAt: Number(result.updatedAt),
        exists: result.exists
      };

      const originalDataHints: { [key: string]: string } = {};
      if (this.hashMap.has(individualData.email)) {
        originalDataHints.email = CryptoUtils.maskSensitiveData(this.hashMap.get(individualData.email)!);
      }
      if (this.hashMap.has(individualData.cccdNumber)) {
        originalDataHints.cccdNumber = CryptoUtils.maskSensitiveData(this.hashMap.get(individualData.cccdNumber)!);
      }

      return {
        success: true,
        data: individualData,
        message: 'Lấy thông tin thành công (dữ liệu nhạy cảm đã được hash)',
        originalDataHints
      };

    } catch (error: any) {
      console.error('❌ Lỗi khi lấy thông tin cá nhân:', error);
      return {
        success: false,
        message: `Lỗi lấy thông tin: ${error.message || 'Unknown error'}`
      };
    }
  }

  async syncIndividualToBlockchain(individual: Individual): Promise<{
    success: boolean;
    message: string;
    txHashes?: string[];
    hashedData?: HashedIndividualData;
  }> {
    const results: string[] = [];
    let hasError = false;
    let errorMessage = '';
    let hashedData: HashedIndividualData | undefined;

    try {
      console.log('🔄 Bắt đầu đồng bộ Individual với hashing cho:', individual.full_name);
      
      const registerResult = await this.registerIndividual(individual);
      if (registerResult.success && registerResult.txHash) {
        results.push(registerResult.txHash);
        hashedData = registerResult.hashedData;
        console.log('✓ Đã đăng ký thông tin cơ bản (hashed):', registerResult.txHash);
      } else {
        hasError = true;
        errorMessage += `Lỗi đăng ký: ${registerResult.message}. `;
      }

      if (!hasError && individual.address_wallet) {
        await new Promise(resolve => setTimeout(resolve, 2000));

        const additionalResult = await this.addAdditionalInfo(individual);
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

  getHashMappingInfo(): { totalMappings: number; hashedFields: string[] } {
    const hashedFields = Array.from(this.hashMap.keys()).map(hash => 
      hash.substring(0, 16) + '...'
    );
    
    return {
      totalMappings: this.hashMap.size,
      hashedFields
    };
  }

  clearHashMapping(): void {
    this.hashMap.clear();
    console.log('🗑️ Đã xóa hash mapping để bảo mật');
  }
}

export const contractIndividualKycService = new ContractIndividualKycService();