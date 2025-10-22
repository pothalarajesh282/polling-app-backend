'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create admin user
    await queryInterface.bulkInsert('Users', [{
      username: 'admin',
      email: 'admin@pollapp.com',
      password: await bcrypt.hash('admin123', 12),
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});

    // Create demo polls
    await queryInterface.bulkInsert('Polls', [{
      question: 'Which programming language do you prefer for web development?',
      description: 'Vote for your favorite programming language',
      userId: 1,
      totalVotes: 45,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      question: 'What is your favorite frontend framework?',
      description: 'Choose the framework you enjoy working with most',
      userId: 1,
      totalVotes: 62,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      question: 'Which database do you prefer?',
      description: 'Select your preferred database system',
      userId: 1,
      totalVotes: 38,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});

    // Create options for polls
    await queryInterface.bulkInsert('Options', [
      // Poll 1 options
      { text: 'JavaScript', pollId: 1, voteCount: 25, createdAt: new Date(), updatedAt: new Date() },
      { text: 'Python', pollId: 1, voteCount: 12, createdAt: new Date(), updatedAt: new Date() },
      { text: 'Java', pollId: 1, voteCount: 5, createdAt: new Date(), updatedAt: new Date() },
      { text: 'TypeScript', pollId: 1, voteCount: 3, createdAt: new Date(), updatedAt: new Date() },
      
      // Poll 2 options
      { text: 'React', pollId: 2, voteCount: 35, createdAt: new Date(), updatedAt: new Date() },
      { text: 'Vue.js', pollId: 2, voteCount: 15, createdAt: new Date(), updatedAt: new Date() },
      { text: 'Angular', pollId: 2, voteCount: 8, createdAt: new Date(), updatedAt: new Date() },
      { text: 'Svelte', pollId: 2, voteCount: 4, createdAt: new Date(), updatedAt: new Date() },
      
      // Poll 3 options
      { text: 'MySQL', pollId: 3, voteCount: 18, createdAt: new Date(), updatedAt: new Date() },
      { text: 'PostgreSQL', pollId: 3, voteCount: 12, createdAt: new Date(), updatedAt: new Date() },
      { text: 'MongoDB', pollId: 3, voteCount: 6, createdAt: new Date(), updatedAt: new Date() },
      { text: 'SQLite', pollId: 3, voteCount: 2, createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Votes', null, {});
    await queryInterface.bulkDelete('Options', null, {});
    await queryInterface.bulkDelete('Polls', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
};