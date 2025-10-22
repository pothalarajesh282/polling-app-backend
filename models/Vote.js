const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vote = sequelize.define('Vote', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  pollId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Polls',
      key: 'id'
    }
  },
  optionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Options',
      key: 'id'
    }
  },
  voterIp: {
    type: DataTypes.STRING,
    allowNull: false
  },
  voterSession: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['pollId', 'voterIp']
    },
    {
      fields: ['pollId', 'voterSession']
    }
  ]
});

module.exports = Vote;