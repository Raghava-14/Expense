'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const currencies = [
      { name: 'United States Dollar', code: 'USD', symbol: '$', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Euro', code: 'EUR', symbol: '€', createdAt: new Date(), updatedAt: new Date() },
      { name: 'British Pound Sterling', code: 'GBP', symbol: '£', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Japanese Yen', code: 'JPY', symbol: '¥', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Indian Rupee', code: 'INR', symbol: '₹', createdAt: new Date(), updatedAt: new Date() }
    ];

    // Check if currencies already exist before insertion
    for (const currency of currencies) {
        const existingCurrencies = await queryInterface.sequelize.query(
            `SELECT id FROM "Currencies" WHERE "code" = ? LIMIT 1;`,
            {
              replacements: [currency.code],
              type: Sequelize.QueryTypes.SELECT
            }
        );
        const existingCurrency = existingCurrencies.length ? existingCurrencies[0].id : null;
          

      if (!existingCurrency) {
        await queryInterface.bulkInsert('Currencies', [currency]);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Currencies', null, {});
  }
};
