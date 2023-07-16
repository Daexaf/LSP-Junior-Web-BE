"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class komentar extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  komentar.init(
    {
      id_artikel: DataTypes.INTEGER,
      nama: DataTypes.STRING,
      email: DataTypes.STRING,
      comment: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "komentar",
      tableName: "komentars",
    }
  );
  return komentar;
};
