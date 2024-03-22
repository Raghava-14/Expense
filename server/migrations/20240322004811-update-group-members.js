'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('GroupMembers', 'deletedAt', {
      allowNull: true,
      type: Sequelize.DATE
    });
    await queryInterface.addColumn('GroupMembers', 'deleted_by', {
      allowNull: true,
      type: Sequelize.INTEGER,
      references: { model: 'Users', key: 'id' }, // Assuming you want to reference the Users table
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
    await queryInterface.renameColumn('GroupMembers', 'created_at', 'createdAt');
    await queryInterface.renameColumn('GroupMembers', 'updated_at', 'updatedAt');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('GroupMembers', 'deletedAt');
    await queryInterface.removeColumn('GroupMembers', 'deleted_by');
    await queryInterface.renameColumn('GroupMembers', 'createdAt', 'created_at');
    await queryInterface.renameColumn('GroupMembers', 'updatedAt', 'updated_at');
  }
};
