const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Book = sequelize.define('Book', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    averageRating: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    }
});

module.exports = Book;
