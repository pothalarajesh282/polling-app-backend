const { Poll, Option } = require('../models');

const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join poll room for real-time updates
    socket.on('joinPoll', (pollId) => {
      socket.join(`poll_${pollId}`);
      console.log(`User ${socket.id} joined poll ${pollId}`);
    });

    // Leave poll room
    socket.on('leavePoll', (pollId) => {
      socket.leave(`poll_${pollId}`);
      console.log(`User ${socket.id} left poll ${pollId}`);
    });

    // Handle admin actions
    socket.on('adminAction', async (data) => {
      try {
        const { action, pollId } = data;
        
        if (action === 'refreshResults') {
          const poll = await Poll.findByPk(pollId, {
            include: [
              {
                model: Option,
                as: 'options',
                attributes: ['id', 'text', 'voteCount']
              }
            ]
          });

          if (poll) {
            io.to(`poll_${pollId}`).emit('pollUpdate', poll);
          }
        }
      } catch (error) {
        console.error('Socket admin action error:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

module.exports = setupSocketHandlers;