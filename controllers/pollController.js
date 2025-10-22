const { Poll, Option, Vote, User, sequelize } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

exports.createPoll = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return res.status(400).json({ errors: errors.array() });
    }

    const { question, description, options, expiresAt } = req.body;

    if (!options || options.length < 2) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Poll must have at least 2 options' });
    }

    const poll = await Poll.create({
      question,
      description,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      userId: req.user.id
    }, { transaction });

    const pollOptions = options.map(optionText => ({
      text: optionText,
      pollId: poll.id
    }));

    await Option.bulkCreate(pollOptions, { transaction });
    await transaction.commit();

    const createdPoll = await Poll.findByPk(poll.id, {
      include: [
        {
          model: Option,
          as: 'options',
          attributes: ['id', 'text', 'voteCount']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username']
        }
      ]
    });

    res.status(201).json({
      message: 'Poll created successfully',
      poll: createdPoll
    });
  } catch (error) {
    await transaction.rollback();
    console.log({ error: error.message });
    res.status(500).json({ error: error.message });
  }
};

exports.getAllPolls = async (req, res) => {
  try {
    const { page = 1, limit = 10, active = true } = req.query;
    const offset = (page - 1) * limit;

    const whereCondition = {};
    if (active === 'true') {
      whereCondition.isActive = true;
      whereCondition[Op.or] = [
        { expiresAt: null },
        { expiresAt: { [Op.gt]: new Date() } }
      ];
    }

    const polls = await Poll.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Option,
          as: 'options',
          attributes: ['id', 'text', 'voteCount']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      polls: polls.rows,
      totalPages: Math.ceil(polls.count / limit),
      currentPage: parseInt(page),
      totalPolls: polls.count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPollById = async (req, res) => {
  try {
    const poll = await Poll.findByPk(req.params.id, {
      include: [
        {
          model: Option,
          as: 'options',
          attributes: ['id', 'text', 'voteCount']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username']
        }
      ]
    });

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    // Check if poll has expired
    if (poll.expiresAt && new Date() > poll.expiresAt) {
      poll.isActive = false;
      await poll.save();
    }

    res.json(poll);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.vote = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { optionId } = req.body;
    const pollId = req.params.id;
    const voterIp = req.ip;
    const voterSession = req.headers['user-session'] || null;

    // Check if poll exists and is active
    const poll = await Poll.findByPk(pollId, { transaction });
    if (!poll || !poll.isActive) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Poll not found or inactive' });
    }

    // Check if poll has expired
    if (poll.expiresAt && new Date() > poll.expiresAt) {
      poll.isActive = false;
      await poll.save({ transaction });
      await transaction.rollback();
      return res.status(400).json({ error: 'Poll has expired' });
    }

    // Check if option exists and belongs to this poll
    const option = await Option.findOne({
      where: { id: optionId, pollId },
      transaction
    });

    if (!option) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Option not found for this poll' });
    }

    // Check for duplicate vote (IP-based or session-based)
    const existingVote = await Vote.findOne({
      where: {
        pollId,
        [Op.or]: [
          { voterIp },
          ...(voterSession ? [{ voterSession }] : [])
        ]
      },
      transaction
    });

    if (existingVote) {
      await transaction.rollback();
      return res.status(400).json({ error: 'You have already voted in this poll' });
    }

    // Create vote
    await Vote.create({
      pollId,
      optionId,
      voterIp,
      voterSession
    }, { transaction });

    // Update vote counts
    option.voteCount += 1;
    await option.save({ transaction });

    poll.totalVotes += 1;
    await poll.save({ transaction });

    await transaction.commit();

    // Get updated poll with results
    const updatedPoll = await Poll.findByPk(pollId, {
      include: [
        {
          model: Option,
          as: 'options',
          attributes: ['id', 'text', 'voteCount']
        }
      ]
    });

    res.json({
      message: 'Vote recorded successfully',
      poll: updatedPoll
    });

    // Emit real-time update
    req.app.get('io').to(`poll_${pollId}`).emit('voteUpdate', updatedPoll);
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};

exports.getPollResults = async (req, res) => {
  try {
    const poll = await Poll.findByPk(req.params.id, {
      include: [
        {
          model: Option,
          as: 'options',
          attributes: ['id', 'text', 'voteCount']
        }
      ]
    });

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    // Calculate percentages
    const results = poll.options.map(option => ({
      ...option.toJSON(),
      percentage: poll.totalVotes > 0 
        ? ((option.voteCount / poll.totalVotes) * 100).toFixed(2)
        : '0.00'
    }));

    res.json({
      poll: {
        ...poll.toJSON(),
        options: results
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deletePoll = async (req, res) => {
  try {
    const poll = await Poll.findByPk(req.params.id);

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    // Check if user owns the poll or is admin
    if (poll.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await poll.destroy();
    res.json({ message: 'Poll deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};