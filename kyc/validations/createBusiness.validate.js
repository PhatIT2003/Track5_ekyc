const Joi = require('joi');

const createBusinessSchema = Joi.object({
   name_company: Joi.string()
      .min(2)
      .max(100)
      .trim()
      .required()
      .messages({
         'string.empty': 'Tên công ty là bắt buộc',
         'string.min': 'Tên công ty phải có ít nhất 2 ký tự',
      }),

   type_company: Joi.string()
      .required()
      .messages({
         'string.empty': 'Loại hình công ty là bắt buộc',
      }),

   establishment_date: Joi.string()
      .trim()
      .required()
      .messages({
         'string.empty': 'Tên công ty là bắt buộc',
      }),

   business_registration_number: Joi.string()
      .pattern(/^\d{8,14}$/)
      .required()
      .messages({
         'string.pattern.base': 'Mã số doanh nghiệp phải là số từ 8–14 chữ số',
         'string.empty': 'Mã số doanh nghiệp là bắt buộc',
      }),

   address: Joi.string()
      .min(5)
      .required()
      .messages({
         'string.empty': 'Địa chỉ là bắt buộc',
         'string.min': 'Địa chỉ phải dài ít nhất 5 ký tự',
      }),

   career: Joi.string()
      .required()
      .messages({
         'string.empty': 'Ngành nghề là bắt buộc',
      }),

   number_of_employees: Joi.number()
      .integer()
      .min(1)
      .max(100000)
      .required()
      .messages({
         'number.base': 'Số lượng nhân viên phải là số',
         'number.min': 'Phải có ít nhất 1 nhân viên',
         'any.required': 'Số lượng nhân viên là bắt buộc',
      }),
   email: Joi.string()
      .required()
      .messages({
         'string.empty': 'Mail là bắt buộc',
      }),
   address_wallet: Joi.string()
      .required()
      .messages({
         'string.empty': 'Địa chỉ ví là bắt buộc',
      }),
});

module.exports = createBusinessSchema
