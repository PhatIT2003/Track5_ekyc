'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Businesses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name_company: {
        type: Sequelize.STRING
      },
      type_company: {
        type: Sequelize.STRING
      },
      establishment_date: {
        type: Sequelize.STRING
      },
      business_registration_number: {
        type: Sequelize.STRING
      },
      address: {
        type: Sequelize.STRING
      },
      career: {
        type: Sequelize.STRING
      },
      number_of_employees: {
        type: Sequelize.INTEGER
      },
      certification_image: {
        type: Sequelize.STRING
      },
      front_cccd_image: {
        type: Sequelize.STRING
      },
      back_cccd_image: {
        type: Sequelize.STRING
      },
      otp_code: {
        type: Sequelize.STRING
      },
      approved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      email: {
        type: Sequelize.STRING
      },
      address_wallet: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('Businesses');
  }
};