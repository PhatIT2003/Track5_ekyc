// utils/validation.js

export const validateForm = (step, userType, formData, uploadedFiles) => {
  const newErrors = {};

  if (step === 1) {
    if (!userType) {
      newErrors.userType = 'Vui lòng chọn loại tài khoản';
    }
  }

  if (step === 2) {
    if (userType === 'individual') {
      // 🔥 VALIDATION CHO CÁ NHÂN - THÊM CÁC FIELD MỚI
      if (!formData.firstName?.trim()) newErrors.firstName = 'Họ không được để trống';
      if (!formData.lastName?.trim()) newErrors.lastName = 'Tên không được để trống';
      if (!formData.email?.trim()) newErrors.email = 'Email không được để trống';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Email không đúng định dạng';
      }
      if (!formData.phone?.trim()) newErrors.phone = 'Số điện thoại không được để trống';
      if (!formData.dateOfBirth?.trim()) newErrors.dateOfBirth = 'Ngày sinh không được để trống'; // 🔥 MỚI
      if (!formData.address?.trim()) newErrors.address = 'Địa chỉ không được để trống';
      if (!formData.idNumber?.trim()) newErrors.idNumber = 'Số CMND/CCCD không được để trống';
      if (!formData.address_wallet?.trim()) newErrors.address_wallet = 'Địa chỉ ví wallet không được để trống'; // 🔥 MỚI
    } else {
      // Business validation matching API fields
      if (!formData.name_company?.trim()) newErrors.name_company = 'Tên công ty không được để trống';
      if (!formData.type_company?.trim()) newErrors.type_company = 'Loại hình doanh nghiệp không được để trống';
      if (!formData.establishment_date?.trim()) newErrors.establishment_date = 'Ngày thành lập không được để trống';
      if (!formData.business_registration_number?.trim()) newErrors.business_registration_number = 'Số đăng ký kinh doanh không được để trống';
      if (!formData.address?.trim()) newErrors.address = 'Địa chỉ công ty không được để trống';
      // 🔥 THÊM VALIDATION CHO ADDRESS_WALLET
      if (!formData.address_wallet?.trim()) newErrors.address_wallet = 'Địa chỉ ví wallet không được để trống';
      if (!formData.career?.trim()) newErrors.career = 'Lĩnh vực kinh doanh không được để trống';
      if (!formData.number_of_employees?.trim()) newErrors.number_of_employees = 'Số lượng nhân viên không được để trống';
      if (!formData.email?.trim()) newErrors.email = 'Email công ty không được để trống';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Email không đúng định dạng';
      }
    }
  }

  if (step === 3) {
    if (userType === 'individual') {
      if (!uploadedFiles.front_cccd_image) newErrors.front_cccd_image = 'Ảnh mặt trước CMND/CCCD bắt buộc';
      if (!uploadedFiles.back_cccd_image) newErrors.back_cccd_image = 'Ảnh mặt sau CMND/CCCD bắt buộc';
    } else {
      // Business document validation matching API fields
      if (!uploadedFiles.certification_image) newErrors.certification_image = 'Giấy chứng nhận đăng ký kinh doanh bắt buộc';
      if (!uploadedFiles.front_cccd_image) newErrors.front_cccd_image = 'CMND/CCCD mặt trước người đại diện bắt buộc';
      if (!uploadedFiles.back_cccd_image) newErrors.back_cccd_image = 'CMND/CCCD mặt sau người đại diện bắt buộc';
    }
  }

  return newErrors;
};

// File handlers remain the same
export const handleFileUpload = (field, file, setUploadedFiles, setErrors) => {
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    setErrors(prev => ({ ...prev, [field]: 'File không được vượt quá 5MB' }));
    return;
  }

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    setErrors(prev => ({ ...prev, [field]: 'Chỉ hỗ trợ file JPG, PNG, PDF' }));
    return;
  }

  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedFiles(prev => ({
        ...prev,
        [field]: {
          file: file,
          preview: e.target.result,
          name: file.name,
          type: 'image'
        }
      }));
    };
    reader.readAsDataURL(file);
  } else {
    setUploadedFiles(prev => ({
      ...prev,
      [field]: {
        file: file,
        preview: null,
        name: file.name,
        type: 'pdf'
      }
    }));
  }

  setErrors(prev => {
    const newErrors = { ...prev };
    delete newErrors[field];
    return newErrors;
  });
};

export const removeFile = (field, setUploadedFiles) => {
  setUploadedFiles(prev => {
    const newFiles = { ...prev };
    delete newFiles[field];
    return newFiles;
  });
  
  const input = document.getElementById(field);
  if (input) input.value = '';
};

// 🔥 CẬP NHẬT prepareApiData để match với API response
export const prepareApiData = (userType, formData) => {
  if (userType === 'business') {
    return {
      name_company: formData.name_company,
      type_company: formData.type_company,
      establishment_date: formData.establishment_date,
      business_registration_number: formData.business_registration_number,
      address: formData.address,
      address_wallet: formData.address_wallet, // 🔥 THÊM FIELD MỚI
      career: formData.career,
      number_of_employees: formData.number_of_employees,
      email: formData.email,
      approved: false
    };
  }
  // 🔥 INDIVIDUAL DATA STRUCTURE
  return {
    full_name: `${formData.firstName} ${formData.lastName}`.trim(),
    date_of_birth: formData.dateOfBirth,
    address: formData.address,
    nationality: formData.nationality || 'Việt Nam',
    cccd_number: formData.idNumber,
    phone: formData.phone,
    email: formData.email,
    address_wallet: formData.address_wallet,
    approved: false
  };
};