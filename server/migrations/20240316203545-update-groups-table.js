'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add updated_by and deleted_by columns
    await queryInterface.addColumn('Groups', 'updated_by', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('Groups', 'deleted_by', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // Add deletedAt column
    await queryInterface.addColumn('Groups', 'deletedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // Rename created_at to createdAt
    await queryInterface.renameColumn('Groups', 'created_at', 'createdAt');

    // Rename updated_at to updatedAt
    await queryInterface.renameColumn('Groups', 'updated_at', 'updatedAt');
  },

  down: async (queryInterface, Sequelize) => {
    // Remove added columns
    await queryInterface.removeColumn('Groups', 'updated_by');
    await queryInterface.removeColumn('Groups', 'deleted_by');
    await queryInterface.removeColumn('Groups', 'deletedAt');

    // Rename createdAt back to created_at
    await queryInterface.renameColumn('Groups', 'createdAt', 'created_at');

    // Rename updatedAt back to updated_at
    await queryInterface.renameColumn('Groups', 'updatedAt', 'updated_at');
  }
};
