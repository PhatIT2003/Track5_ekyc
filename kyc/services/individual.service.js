const db = require("../models");
const createError = require("http-errors");
const handleSuccess = require("../utils/success.util");
const sendMail = require("../utils/mail.util");

const getOneIndividualById = async (id) => {
   const individual = await db.Individual.findOne({ where: { id }, attributes: { exclude: ['otp_code'] } });
   return individual;
};

const handleGetAllIndividuals = async () => {
   try {
      const individuals = await db.Individual.findAll({
         where: { approved: false },
      })

      const dataFilterConfirmed = [];

      individuals.forEach(individual => {
         if (individual.otp_code.length < 1) {
            dataFilterConfirmed.push(individual);
         }
      });

      return handleSuccess("All individual retrieved successfully", dataFilterConfirmed);
   } catch (error) {
      throw error
   }
}

const handleGetAllIndividualApproved = async () => {
   try {
      const Individuals = await db.Individual.findAll({
         where: { approved: true }
      })
      return handleSuccess("All Individual retrieved successfully", Individuals);
   } catch (error) {
      throw error
   }
}

const handleGetOneIndividual = async (id) => {
   try {
      const Individual = await getOneIndividualById(id)

      if (!Individual) {
         throw createError.NotFound("Individual not found")
      }

      return handleSuccess("Individual retrieved successfully", Individual);
   } catch (error) {
      throw error
   }
}

const handleCreateIndividual = async (full_name, date_of_birth, address, nationality, cccd_number, phone, email, front_cccd_image, back_cccd_image, address_wallet) => {
   try {
      // Tạo mã xác minh 
      const otp_code = Math.floor(100000 + Math.random() * 900000).toString(); // mã 6 chữ số
      const html = `
             <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <h1>EG TEAM</h1>
            <h2 style="text-align: center; color: #4CAF50;">Xác thực tài khoản</h2>
            <p>Chào bạn,</p>
            <p>Chúng tôi nhận được yêu cầu xác thực từ địa chỉ email này. Vui lòng nhập mã xác minh sau để tiếp tục:</p>

            <div style="text-align: center; margin: 20px 0;">
               <span style="display: inline-block; font-size: 28px; letter-spacing: 8px; padding: 10px 20px; border: 1px dashed #4CAF50; border-radius: 4px; background-color: #f9f9f9; font-weight: bold;">
                  ${otp_code}
               </span>
            </div>
      
            <p style="margin-top: 30px;">Nếu bạn không yêu cầu hành động này, hãy bỏ qua email này.</p>
            <p style="margin-top: 10px;">Trân trọng,<br/>Đội ngũ EG TEAM</p>
      
            <div style="margin-top: 40px; font-size: 12px; color: #888; text-align: center;">
               © ${new Date().getFullYear()} EG TEAM. All rights reserved.
            </div>
            </div>
         `;

      const newIndividual = await db.Individual.create({
         full_name, date_of_birth, address, nationality, cccd_number, phone, email, front_cccd_image, back_cccd_image, address_wallet, otp_code
      });

      const result = newIndividual.toJSON();
      delete result.otp_code;


      await sendMail({ email, subject: "XAC THUC FORM THONG TIN CUA CA NHAN", html })

      return handleSuccess('Business created successfully', result);
   } catch (error) {
      throw error;
   }
};

const handleConfirmCreateIndividual = async (otp_code) => {
   try {
      const result = await db.Individual.findOne({ where: { otp_code } })
      if (!result) {
         throw createError.NotFound('OTP invalid');
      }

      const timeCreate = new Date(result.createdAt);
      const currentTime = new Date();
      const timeDifference = (currentTime - timeCreate) / (1000 * 60); // Chuyển thành phút

      // Kiểm tra xem thời gian đã quá 5 phút chưa
      if (timeDifference > 5) {
         await db.Individual.destroy({ where: { id: result.id } })
         throw createError.BadRequest('OTP expired (more than 5 minutes). Please fill out your form again!');
      }

      await db.Individual.update({ otp_code: "" }, { where: { id: result.id } })
      return handleSuccess('Confirm successfully');
   } catch (error) {
      throw error
   }
}

const handleApproveIndividual = async (id) => {
   try {
      const html = `
         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
         <h1>EG TEAM</h1>

            <h2 style="text-align: center; color: #4CAF50;">Tài khoản đã được xác thực thành công</h2>
            <p>Chào bạn,</p>

            <p>Chúc mừng! Tài khoản của bạn đã được xác thực thành công. Bạn đã sẵn sàng sử dụng tất cả các chức năng của hệ thống.</p>

            <div style="text-align: center; margin: 20px 0;">
               <a href="https://vietscan.net" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
               Viet Chain Explorer
               </a>
            </div>

            <p style="margin-top: 30px;">Nếu bạn có bất kỳ câu hỏi hoặc cần hỗ trợ, hãy liên hệ với đội ngũ hỗ trợ của chúng tôi.</p>
            <p style="margin-top: 10px;">Trân trọng,<br/>Đội ngũ EG TEAM</p>

            <div style="margin-top: 40px; font-size: 12px; color: #888; text-align: center;">
               © ${new Date().getFullYear()} EG TEAM. All rights reserved.
            </div>
         </div>
         `;

      const result = await db.Individual.findOne({ where: { id } })
      if (!result) {
         throw createError.NotFound('Form individual not found');
      }
      await db.Individual.update({ approved: true }, { where: { id: result.id } })
      await sendMail({ email: result.email, subject: "TÀI KHOẢN ĐÃ ĐƯỢC XÁC THỰC THÀNH CÔNG", html })

      return handleSuccess('Confirm successfully');
   } catch (error) {
      throw error
   }
}

const handleDeleteIndividual = async (id) => {
   try {
      const individual = await getOneIndividualById(id);
      if (!individual) {
         throw createError.NotFound("Individual not found")
      }

      // Xóa tất cả các ảnh liên quan nếu có
      if (individual.images && individual.images.length > 0) {
         for (const image of individual.images) {
            await upload.handleDeleteImage(image);
         }
      }

      await db.Individual.destroy({ where: { id } });

      return handleSuccess("Individual deleted successfully");
   } catch (error) {
      throw error;
   }
};

module.exports = {
   handleGetAllIndividuals,
   handleGetOneIndividual,
   handleGetAllIndividualApproved,
   handleCreateIndividual,
   handleConfirmCreateIndividual,
   handleDeleteIndividual,
   handleApproveIndividual
}