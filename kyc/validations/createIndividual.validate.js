const Joi = require('joi');

const createIndividualSchema = Joi.object({
   full_name: Joi.string()
      .required()
      .messages({
         'string.empty': 'Họ tên là bắt buộc',
      }),

   date_of_birth: Joi.string()
      .required()
      .messages({
         'string.empty': 'Ngày sinh là bắt buộc',
      }),

   address: Joi.string()
      .required()
      .messages({
         'string.empty': 'Địa chỉ là bắt buộc',
      }),

   nationality: Joi.string()
      .required()
      .messages({
         'string.empty': 'Quốc tịch là bắt buộc',
      }),

   cccd_number: Joi.string()
      .required()
      .messages({
         'string.empty': 'Căn cước công dân là bắt buộc',
      }),

   phone: Joi.string()
      .required()
      .messages({
         'string.empty': 'Số điện thoại là bắt buộc',
      }),

   email: Joi.string().email().required().messages({
      'string.email': 'Email không đúng định dạng (vd: abc@gmail.com)',
      'any.required': 'Email là bắt buộc',
      'string.empty': 'Email không được để trống',
   }),

   address_wallet: Joi.string()
      .required()
      .messages({
         'string.empty': 'Địa chỉ ví là bắt buộc',
      }),
});

module.exports = createIndividualSchema
