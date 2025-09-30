'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Individual extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Individual.init({
    full_name: DataTypes.STRING,
    date_of_birth: DataTypes.STRING,
    address: DataTypes.STRING,
    nationality: DataTypes.STRING,
    cccd_number: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    front_cccd_image: DataTypes.STRING,
    back_cccd_image: DataTypes.STRING,
    address_wallet: DataTypes.STRING,
    otp_code: DataTypes.STRING,
    approved: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Individual',
  });
  return Individual;
};