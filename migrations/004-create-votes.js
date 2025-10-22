'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Votes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      pollId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Polls',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      optionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Options',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      voterIp: {
        type: Sequelize.STRING,
        allowNull: false
      },
      voterSession: {
        type: Sequelize.STRING
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add unique index for IP-based duplicate prevention
    await queryInterface.addIndex('Votes', ['pollId', 'voterIp'], {
      unique: true,
      name: 'unique_poll_voter_ip'
    });

    // Add index for session-based voting
    await queryInterface.addIndex('Votes', ['pollId', 'voterSession'], {
      name: 'idx_poll_voter_session'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Votes');
  }
};