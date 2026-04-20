const express = require('express');
const router = express.Router();
const multer = require('multer');
const { identifySeed, getGrowingRecommendations, getPlantingCalendar } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// Use memory storage for AI image uploads (we stream to Cloudinary manually)
const memStorage = multer({ storage: multer.memoryStorage() });

router.post('/identify-seed', memStorage.single('image'), identifySeed);
router.post('/growing-recommendations', getGrowingRecommendations);
router.post('/planting-calendar', getPlantingCalendar);

module.exports = router;
