const express = require('express');
const router = express.Router();
const { individualController } = require('../controllers');
const { uploadMiddleware, validate, validateFile } = require('../middlewares');
const schemas = require('../validations');

router.get('/individual', individualController.getAllIndividuals);
router.get('/approved-individual', individualController.getAllIndividualApproved);
router.get('/individual/:id', individualController.getOneIndividual);
router.post(
   '/individual',
   uploadMiddleware.createUpload().fields([
      { name: 'front_cccd_image', maxCount: 1 },
      { name: 'back_cccd_image', maxCount: 1 },
   ]),
   validate(schemas.createIndividualSchema),
   individualController.createIndividual
);
router.post('/confirm-individual', individualController.confirmCreateIndividual);
router.post('/approve-individual', individualController.approvedIndividual);
router.delete("/individual/:id", individualController.deleteIndividual)

module.exports = router;
