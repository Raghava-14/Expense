'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Expenses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: Sequelize.STRING,
      amount: Sequelize.DECIMAL(10, 2),
      date: Sequelize.DATE,
      repeats: { type: Sequelize.BOOLEAN, defaultValue: false },
      repeatInterval: {
        type: Sequelize.ENUM,
        values: ['Once', 'weekly', 'biweekly', 'monthly', 'yearly'],
        defaultValue: 'Once'
      },
      nextRepeat: Sequelize.DATE, // Calculate in application logic
      email_reminder: { type: Sequelize.BOOLEAN, defaultValue: false },
      comment_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      currency_code: {
        type: Sequelize.STRING,
        references: { model: 'Currencies', key: 'code' }, // Adjust according to your Currencies table
      },
      category_id: {
        type: Sequelize.INTEGER,
        references: { model: 'Categories', key: 'id' },
        allowNull: true,
      },
      expense_type: Sequelize.ENUM('personal', 'shared', 'group'),
      receipt: Sequelize.TEXT, // or Sequelize.STRING for file paths/URLs
      created_by: Sequelize.INTEGER,
      updated_by: Sequelize.INTEGER,
      deleted_by: Sequelize.INTEGER,
      is_deleted: { type: Sequelize.BOOLEAN, defaultValue: false },
      deleted_at: Sequelize.DATE,
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Expenses');
  }
};
