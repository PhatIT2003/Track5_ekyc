// utils/cryptoUtils.ts
import { createHash, createCipher, createDecipher } from 'crypto';

/**
 * Tiện ích mã hóa và hash dữ liệu nhạy cảm trước khi gửi lên blockchain
 */
export class CryptoUtils {
  private static readonly HASH_ALGORITHM = 'sha256';
  private static readonly ENCRYPTION_ALGORITHM = 'aes-256-cbc';
  private static readonly ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-char-secret-key-here-123';

  /**
   * Hash dữ liệu sử dụng SHA-256
   */
  static hash(data: string): string {
    return createHash(this.HASH_ALGORITHM).update(data, 'utf8').digest('hex');
  }

  /**
   * Hash nhiều trường dữ liệu thành một hash duy nhất
   */
  static hashMultiple(data: string[]): string {
    const combined = data.join('|');
    return this.hash(combined);
  }

  /**
   * Mã hóa dữ liệu nhạy cảm
   */
  static encrypt(data: string): string {
    try {
      const cipher = createCipher(this.ENCRYPTION_ALGORITHM, this.ENCRYPTION_KEY);
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      return this.hash(data); // Fallback to hash if encryption fails
    }
  }

  /**
   * Giải mã dữ liệu
   */
  static decrypt(encryptedData: string): string {
    try {
      const decipher = createDecipher(this.ENCRYPTION_ALGORITHM, this.ENCRYPTION_KEY);
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      return '[ENCRYPTED]';
    }
  }

  /**
   * Tạo hash cho thông tin cá nhân (CCCD, email)
   */
  static hashPersonalInfo(info: string): string {
    if (!info) return '';
    // Thêm salt để tăng bảo mật
    const salt = process.env.PERSONAL_INFO_SALT || 'default-salt-123';
    return this.hash(`${salt}${info}`);
  }

  /**
   * Tạo hash cho file image URL
   */
  static hashImageUrl(url: string): string {
    if (!url) return '';
    // Chỉ hash phần filename, không hash full URL
    const filename = url.split('/').pop() || url;
    return this.hash(filename);
  }

  /**
   * Tạo hash cho thông tin doanh nghiệp nhạy cảm
   */
  static hashBusinessSensitiveData(data: {
    businessRegistrationNumber?: string;
    taxCode?: string;
    bankAccount?: string;
  }): string {
    const sensitiveFields = [
      data.businessRegistrationNumber || '',
      data.taxCode || '',
      data.bankAccount || ''
    ].filter(field => field.length > 0);

    if (sensitiveFields.length === 0) return '';
    
    return this.hashMultiple(sensitiveFields);
  }

  /**
   * Tạo hash cho địa chỉ chi tiết
   */
  static hashAddress(address: string): string {
    if (!address) return '';
    // Hash địa chỉ chi tiết nhưng giữ lại thông tin cơ bản
    const addressParts = address.split(',').map(part => part.trim());
    if (addressParts.length > 2) {
      // Giữ lại thành phố và tỉnh, hash phần địa chỉ chi tiết
      const detailedAddress = addressParts.slice(0, -2).join(', ');
      const cityProvince = addressParts.slice(-2).join(', ');
      return `${this.hash(detailedAddress)}|${cityProvince}`;
    }
    return this.hash(address);
  }

  /**
   * Tạo proof hash để verify dữ liệu
   */
  static createProofHash(originalData: string, hashedData: string): string {
    return this.hash(`${originalData}:${hashedData}`);
  }

  /**
   * Verify proof hash
   */
  static verifyProofHash(originalData: string, hashedData: string, proofHash: string): boolean {
    const expectedProofHash = this.createProofHash(originalData, hashedData);
    return expectedProofHash === proofHash;
  }

  /**
   * Tạo unique identifier cho business
   */
  static generateBusinessId(business: {
    name_company: string;
    business_registration_number: string;
    email: string;
  }): string {
    const uniqueData = [
      business.name_company,
      business.business_registration_number,
      business.email
    ];
    return this.hashMultiple(uniqueData);
  }

  /**
   * Tạo unique identifier cho individual
   */
  static generateIndividualId(individual: {
    full_name: string;
    cccd_number: string;
    email: string;
  }): string {
    const uniqueData = [
      individual.full_name,
      individual.cccd_number,
      individual.email
    ];
    return this.hashMultiple(uniqueData);
  }

  /**
   * Sanitize dữ liệu trước khi hash (loại bỏ ký tự đặc biệt, spaces)
   */
  static sanitizeForHash(data: string): string {
    return data.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  /**
   * Tạo masked version của dữ liệu nhạy cảm để hiển thị
   */
  static maskSensitiveData(data: string, visibleChars: number = 4): string {
    if (!data || data.length <= visibleChars) return data;
    const visible = data.substring(0, visibleChars);
    const masked = '*'.repeat(Math.min(data.length - visibleChars, 6));
    return `${visible}${masked}`;
  }
}

/**
 * Interface cho dữ liệu Business đã được hash
 */
export interface HashedBusinessData {
  // Dữ liệu công khai (không hash)
  companyName: string;
  companyType: string;
  industry: string;
  employeeCount: number;
  establishedDate: number;
  walletAddress: string;
  
  // Dữ liệu đã được hash
  hashedEmail: string;
  hashedBusinessRegNumber: string;
  hashedAddress: string;
  hashedCertificateImage: string;
  hashedIdCardFront: string;
  hashedIdCardBack: string;
  
  // Hash tổng hợp để verify
  businessProofHash: string;
  personalProofHash: string;
  
  // Metadata
  hashMethod: string;
  hashedAt: number;
}

/**
 * Interface cho dữ liệu Individual đã được hash
 */
export interface HashedIndividualData {
  // Dữ liệu công khai (không hash)
  fullName: string;
  nationality: string;
  dateOfBirth: number;
  walletAddress: string;
  
  // Dữ liệu đã được hash
  hashedEmail: string;
  hashedCccdNumber: string;
  hashedPhone: string;
  hashedAddress: string;
  hashedIdCardFront: string;
  hashedIdCardBack: string;
  
  // Hash tổng hợp để verify
  personalProofHash: string;
  identityProofHash: string;
  
  // Metadata
  hashMethod: string;
  hashedAt: number;
}

/**
 * Chuyển đổi Business data thành HashedBusinessData
 */
export function hashBusinessData(business: {
  name_company: string;
  type_company: string;
  career: string;
  number_of_employees: number;
  establishment_date: string;
  address_wallet: string;
  email: string;
  business_registration_number: string;
  address: string;
  certification_image?: string;
  front_cccd_image?: string;
  back_cccd_image?: string;
}): HashedBusinessData {
  // Hash các trường nhạy cảm
  const hashedEmail = CryptoUtils.hashPersonalInfo(business.email);
  const hashedBusinessRegNumber = CryptoUtils.hashPersonalInfo(business.business_registration_number);
  const hashedAddress = CryptoUtils.hashAddress(business.address);
  const hashedCertificateImage = CryptoUtils.hashImageUrl(business.certification_image || '');
  const hashedIdCardFront = CryptoUtils.hashImageUrl(business.front_cccd_image || '');
  const hashedIdCardBack = CryptoUtils.hashImageUrl(business.back_cccd_image || '');
  
  // Tạo proof hash để verify
  const businessProofHash = CryptoUtils.hashMultiple([
    business.name_company,
    business.business_registration_number,
    business.address
  ]);
  
  const personalProofHash = CryptoUtils.hashMultiple([
    business.email,
    business.certification_image || '',
    business.front_cccd_image || '',
    business.back_cccd_image || ''
  ]);
  
  return {
    // Dữ liệu công khai
    companyName: business.name_company,
    companyType: business.type_company,
    industry: business.career,
    employeeCount: business.number_of_employees,
    establishedDate: Math.floor(new Date(business.establishment_date).getTime() / 1000),
    walletAddress: business.address_wallet,
    
    // Dữ liệu đã hash
    hashedEmail,
    hashedBusinessRegNumber,
    hashedAddress,
    hashedCertificateImage,
    hashedIdCardFront,
    hashedIdCardBack,
    
    // Proof hashes
    businessProofHash,
    personalProofHash,
    
    // Metadata
    hashMethod: 'SHA256',
    hashedAt: Date.now()
  };
}

/**
 * Chuyển đổi Individual data thành HashedIndividualData
 */
export function hashIndividualData(individual: {
  full_name: string;
  nationality: string;
  date_of_birth: string;
  address_wallet: string;
  email: string;
  cccd_number: string;
  phone: string;
  address: string;
  front_cccd_image?: string;
  back_cccd_image?: string;
}): HashedIndividualData {
  // Hash các trường nhạy cảm
  const hashedEmail = CryptoUtils.hashPersonalInfo(individual.email);
  const hashedCccdNumber = CryptoUtils.hashPersonalInfo(individual.cccd_number);
  const hashedPhone = CryptoUtils.hashPersonalInfo(individual.phone);
  const hashedAddress = CryptoUtils.hashAddress(individual.address);
  const hashedIdCardFront = CryptoUtils.hashImageUrl(individual.front_cccd_image || '');
  const hashedIdCardBack = CryptoUtils.hashImageUrl(individual.back_cccd_image || '');
  
  // Tạo proof hash để verify
  const personalProofHash = CryptoUtils.hashMultiple([
    individual.email,
    individual.phone,
    individual.address
  ]);
  
  const identityProofHash = CryptoUtils.hashMultiple([
    individual.cccd_number,
    individual.front_cccd_image || '',
    individual.back_cccd_image || ''
  ]);
  
  return {
    // Dữ liệu công khai
    fullName: individual.full_name,
    nationality: individual.nationality,
    dateOfBirth: Math.floor(new Date(individual.date_of_birth).getTime() / 1000),
    walletAddress: individual.address_wallet,
    
    // Dữ liệu đã hash
    hashedEmail,
    hashedCccdNumber,
    hashedPhone,
    hashedAddress,
    hashedIdCardFront,
    hashedIdCardBack,
    
    // Proof hashes
    personalProofHash,
    identityProofHash,
    
    // Metadata
    hashMethod: 'SHA256',
    hashedAt: Date.now()
  };
}