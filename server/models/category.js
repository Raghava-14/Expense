'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      // Define association here

      // Association for SubCategories referencing the parent category
      Category.hasMany(models.Category, { as: 'Subcategories', foreignKey: 'parent_id' });

      // Reverse association for accessing the parent category
      Category.belongsTo(models.Category, { as: 'Parent', foreignKey: 'parent_id' });

      // Association for Expenses referencing the category
      Category.hasMany(models.Expense, { as: 'Expenses', foreignKey: 'category_id' });
    }
  };
  Category.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: DataTypes.STRING,
    parent_id: DataTypes.INTEGER, // This is the foreign key to the same table for parent categories
  }, {
    sequelize,
    modelName: 'Category',
    timestamps: true, // to handle createdAt and updatedAt
    tableName: 'Categories'
  });
  return Category;
};
