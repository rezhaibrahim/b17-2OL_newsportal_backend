'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class News extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      News.belongsTo(models.Users, { foreignKey: 'user_id', as: 'Author' })
    }
  };
  News.init({
    user_id: DataTypes.STRING,
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    reference: DataTypes.STRING,
    author: DataTypes.STRING,
    picture: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'News',
  });
  return News;
};