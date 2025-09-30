'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Business extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Business.init({
    name_company: DataTypes.STRING,
    type_company: DataTypes.STRING,
    establishment_date: DataTypes.STRING,
    business_registration_number: DataTypes.STRING,
    address: DataTypes.STRING,
    career: DataTypes.STRING,
    number_of_employees: DataTypes.INTEGER,
    certification_image: DataTypes.STRING,
    front_cccd_image: DataTypes.STRING,
    back_cccd_image: DataTypes.STRING,
    otp_code: DataTypes.STRING,
    approved: DataTypes.BOOLEAN,
    email: DataTypes.STRING,
    address_wallet: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Business',
  });
  return Business;
};