const express = require('express');
const router = express.Router();
const { businessController } = require('../controllers');
const { uploadMiddleware, validate, validateFile } = require('../middlewares');
const schemas = require('../validations');


router.get('/business', businessController.getAllBusinesses);
router.get('/approved-business', businessController.getAllBusinessesApproved);
router.get('/business/:id', businessController.getOneBusiness);
router.post(
   '/business',
   uploadMiddleware.createUpload().fields([
      { name: 'certification_image', maxCount: 1 },
      { name: 'front_cccd_image', maxCount: 1 },
      { name: 'back_cccd_image', maxCount: 1 },
   ]),
   validateFile,
   validate(schemas.createBusinessSchema),
   businessController.createBusiness
);

router.post('/confirm-business', businessController.confirmCreateBusiness);
router.post('/approve-business', businessController.approvedBusiness);
router.delete('/business/:id', businessController.deleteBusiness);

module.exports = router;
