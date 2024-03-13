'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      
      // Comments association
      User.hasMany(models.Comment, {foreignKey: 'user_id', onDelete: 'CASCADE', onUpdate: 'CASCADE'});

      //Expenses association
      User.hasMany(models.Expense, {foreignKey: 'created_by', onDelete: 'CASCADE', onUpdate: 'CASCADE'});
      User.hasMany(models.Expense, {foreignKey: 'updated_by', onDelete: 'CASCADE', onUpdate: 'CASCADE'});
      User.hasMany(models.Expense, {foreignKey: 'deleted_by', onDelete: 'CASCADE', onUpdate: 'CASCADE'});
      
      // Friendships associations
      User.hasMany(models.Friendship, {as: 'Requester', foreignKey: 'requester_id', onDelete: 'CASCADE', onUpdate: 'CASCADE'});
      User.hasMany(models.Friendship, {as: 'Addressee', foreignKey: 'addressee_id', onDelete: 'CASCADE', onUpdate: 'CASCADE'});

      // Groups created by the user
      User.hasMany(models.Group, {foreignKey: 'created_by', onDelete: 'SET NULL', onUpdate: 'CASCADE'});

      // GroupMembers association
      User.hasMany(models.GroupMember, {foreignKey: 'user_id', onDelete: 'CASCADE', onUpdate: 'CASCADE'});

      // Notifications association
      User.hasMany(models.Notification, {foreignKey: 'user_id', onDelete: 'CASCADE', onUpdate: 'CASCADE'});

      // SharedExpenses association
      User.hasMany(models.SharedExpense, {foreignKey: 'user_id', onDelete: 'CASCADE', onUpdate: 'CASCADE'});
    }
  }
  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    first_name: DataTypes.STRING(255),
    last_name: DataTypes.STRING(255),
    email: {
      type: DataTypes.STRING(255),
      allowNull: false, // Update this based on whether you allow nullable emails
      unique: true // Assuming email should be unique per user
    },
    password_hash: DataTypes.STRING(255),
    profile_picture: DataTypes.STRING(255),
    phone_number: DataTypes.STRING(255),
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'User',
    timestamps: true, // Enable Sequelize to automatically manage createdAt and updatedAt
    tableName: 'Users' // Ensure the model uses the exact table name
  });
  return User;
};
