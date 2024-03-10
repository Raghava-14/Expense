'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      // Define association here
      Category.hasMany(models.Category, {
        as: 'Subcategories',
        foreignKey: 'parent_id',
      });
    }
  };
  Category.init({
    category_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: DataTypes.STRING,
    parent_id: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Category',
    timestamps: true, // to handle createdAt and updatedAt
  });
  return Category;
};
