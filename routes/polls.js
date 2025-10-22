const express = require('express');
const { body } = require('express-validator');
const {
  createPoll,
  getAllPolls,
  getPollById,
  vote,
  getPollResults,
  deletePoll
} = require('../controllers/pollController');
const { authenticate, authorize } = require('../middleware/auth');
const { voteLimiter, pollCreationLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.get('/', getAllPolls);
router.get('/:id', getPollById);
router.get('/:id/results', getPollResults);

router.post('/:id/vote', voteLimiter, [
  body('optionId').isInt({ min: 1 }).withMessage('Valid option ID is required')
], vote);

router.post('/', authenticate, authorize('admin'), pollCreationLimiter, [
  body('question').notEmpty().withMessage('Question is required'),
  body('options').isArray({ min: 2 }).withMessage('At least 2 options are required'),
  body('expiresAt').optional().custom((value) => {
    // If value is provided, it must be a valid date
    if (value && isNaN(Date.parse(value))) {
      throw new Error('Valid expiration date is required');
    }
    return true;
  })
], createPoll);

router.delete('/:id', authenticate, authorize('admin'), deletePoll);

module.exports = router;