'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Expenses_expense_type" ADD VALUE 'settlement';
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Note: Sequelize does not support ENUM removal. Handle with care in production.
  }
};
