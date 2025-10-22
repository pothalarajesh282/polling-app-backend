const sequelize = require('../config/database');
const User = require('./User');
const Poll = require('./Poll');
const Option = require('./Option');
const Vote = require('./Vote');

// Define relationships
User.hasMany(Poll, { foreignKey: 'userId', as: 'polls' });
Poll.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Poll.hasMany(Option, { foreignKey: 'pollId', as: 'options' });
Option.belongsTo(Poll, { foreignKey: 'pollId', as: 'poll' });

Option.hasMany(Vote, { foreignKey: 'optionId', as: 'votes' });
Vote.belongsTo(Option, { foreignKey: 'optionId', as: 'option' });

Poll.hasMany(Vote, { foreignKey: 'pollId', as: 'votes' });
Vote.belongsTo(Poll, { foreignKey: 'pollId', as: 'poll' });

module.exports = {
  sequelize,
  User,
  Poll,
  Option,
  Vote
};