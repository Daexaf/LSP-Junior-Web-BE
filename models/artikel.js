"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Artikel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Artikel.belongsTo(models.admin, {
        foreignKey: "id_admin",
      });
      // this.hasMany(models.Comment,{
      //   foreignKey: 'id_artikel'
      // })
    }
  }
  Artikel.init(
    {
      id_admin: DataTypes.INTEGER,
      judul: DataTypes.STRING,
      content: DataTypes.STRING,
      gambar: DataTypes.STRING,
      comment: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Artikel",
    }
  );
  return Artikel;
};
