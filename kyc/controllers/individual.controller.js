const { individualService } = require('../services');


const getAllIndividuals = async (req, res, next) => {
   try {
      const result = await individualService.handleGetAllIndividuals()
      res.status(200).json(result);
   } catch (error) {
      next(error);
   }
};

const getAllIndividualApproved = async (req, res, next) => {
   try {
      const result = await individualService.handleGetAllIndividualApproved()
      res.status(200).json(result);
   } catch (error) {
      next(error);
   }
}

const getOneIndividual = async (req, res, next) => {
   try {
      const { id } = req.params;
      const result = await individualService.handleGetOneIndividual(id);
      res.status(200).json(result);
   } catch (error) {
      next(error);
   }
};

const createIndividual = async (req, res, next) => {
   try {
      const front_cccd_image = req.files['front_cccd_image'][0].filename;
      const back_cccd_image = req.files['back_cccd_image'][0].filename;

      const { full_name, date_of_birth, address, nationality, cccd_number, phone, email, address_wallet } = req.body
      const result = await individualService.handleCreateIndividual(
         full_name, date_of_birth, address, nationality, cccd_number, phone, email, front_cccd_image, back_cccd_image, address_wallet
      )

      res.status(201).json(result);
   } catch (error) {
      next(error);
   }
}

const confirmCreateIndividual = async (req, res, next) => {
   try {
      const { otp_code } = req.body
      const result = await individualService.handleConfirmCreateIndividual(otp_code)

      res.status(201).json(result);
   } catch (error) {
      next(error);
   }
}

const approvedIndividual = async (req, res, next) => {
   try {
      const { id } = req.body
      const result = await individualService.handleApproveIndividual(id)
      res.status(201).json(result);
   } catch (error) {
      next(error)
   }
}


const deleteIndividual = async (req, res, next) => {
   try {
      const { id } = req.params;
      const result = await individualService.handleDeleteIndividual(id);
      res.status(200).json(result);
   } catch (error) {
      next(error)
   }
};

module.exports = {
   getAllIndividuals,
   getAllIndividualApproved,
   getOneIndividual,
   createIndividual,
   confirmCreateIndividual,
   deleteIndividual,
   approvedIndividual
}