const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const User = require('./User');
const Book = require('./Book');

const UserBooks = sequelize.define('UserBooks', {
        userId: {
            type: DataTypes.INTEGER,
            references: {
            model: User,
            key: 'id'
            },
            allowNull: false,
            primaryKey: true
        },
        bookId: {
            type: DataTypes.INTEGER,
            references: {
            model: Book,
            key: 'id'
            },
            allowNull: false,
            primaryKey: true
        },
        userScore: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        isCurrentlyBorrowed: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = UserBooks;
