'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Comments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      expense_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Expenses', // Ensure this matches your table name exactly
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // Ensure this matches your table name exactly
          key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
          },
          created_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('now'),
          },
          updated_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('now'),
          }
          });
          },
          down: async (queryInterface, Sequelize) => {
          await queryInterface.dropTable('Comments');
          }
          };
