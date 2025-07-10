const express = require('express');
const router = express.Router();
const rankingController = require('../controllers/rankingController');
const authMiddleware = require('../middleware/auth');
const { validateRanking, validateId } = require('../middleware/simpleValidation');

// All routes require authentication
router.use(authMiddleware);

// Rankings CRUD routes
router.get('/', rankingController.getRankings);
router.get('/:id', validateId, rankingController.getRanking);
router.post('/', validateRanking, rankingController.createRanking);
router.put('/:id', validateId, validateRanking, rankingController.updateRanking);
router.delete('/:id', validateId, rankingController.deleteRanking);

// Special operations  
router.post('/reorder', rankingController.reorderRankings);

module.exports = router;