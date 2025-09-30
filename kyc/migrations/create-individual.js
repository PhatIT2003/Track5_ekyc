'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Individuals', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      full_name: {
        type: Sequelize.STRING
      },
      date_of_birth: {
        type: Sequelize.STRING
      },
      address: {
        type: Sequelize.STRING
      },
      nationality: {
        type: Sequelize.STRING
      },
      cccd_number: {
        type: Sequelize.STRING
      },
      phone: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      front_cccd_image: {
        type: Sequelize.STRING
      },
      back_cccd_image: {
        type: Sequelize.STRING
      },
      address_wallet: {
        type: Sequelize.STRING
      },
      otp_code: {
        type: Sequelize.STRING
      },
      approved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Individuals');
  }
};