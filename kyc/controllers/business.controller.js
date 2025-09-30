const { businessService } = require('../services');

const getAllBusinesses = async (req, res, next) => {
   try {
      const result = await businessService.handleGetAllBusinesses()
      res.status(200).json(result);
   } catch (error) {
      next(error);
   }
};

const getAllBusinessesApproved = async (req, res, next) => {
   try {
      const result = await businessService.handleGetAllBusinessesApproved()
      res.status(200).json(result);
   } catch (error) {
      next(error);
   }
}

const getOneBusiness = async (req, res, next) => {
   try {
      const { id } = req.params;
      const result = await businessService.handleGetOneBusiness(id);
      res.status(200).json(result);
   } catch (error) {
      next(error);
   }
};

const createBusiness = async (req, res, next) => {
   try {
      const certification_image = req.files['certification_image'][0].filename;
      const front_cccd_image = req.files['front_cccd_image'][0].filename;
      const back_cccd_image = req.files['back_cccd_image'][0].filename;

      const { name_company, type_company, establishment_date, business_registration_number, address, career, number_of_employees, email, address_wallet } = req.body
      const result = await businessService.handleCreateBusiness(
         name_company,
         type_company,
         establishment_date,
         business_registration_number,
         address,
         career,
         number_of_employees,
         certification_image,
         front_cccd_image,
         back_cccd_image,
         email,
         address_wallet,
      )

      res.status(201).json(result);
   } catch (error) {
      next(error);
   }
}

const confirmCreateBusiness = async (req, res, next) => {
   try {
      const { otp_code } = req.body
      const result = await businessService.handleConfirmCreateBussiness(otp_code)

      res.status(201).json(result);
   } catch (error) {
      next(error);
   }
}

const approvedBusiness = async (req, res, next) => {
   try {
      const { id } = req.body
      const result = await businessService.handleApproveBusiness(id)
      res.status(201).json(result);
   } catch (error) {
      next(error)
   }
}

const deleteBusiness = async (req, res, next) => {
   try {
      const { id } = req.params;
      const result = await businessService.handleDeleteBusiness(id);
      res.status(200).json(result);
   } catch (error) {
      next(error)
   }
};

module.exports = {
   getAllBusinesses,
   getAllBusinessesApproved,
   getOneBusiness,
   createBusiness,
   approvedBusiness,
   deleteBusiness,
   confirmCreateBusiness
}