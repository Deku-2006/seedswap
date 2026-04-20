const express = require('express');
const router = express.Router();
const {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  getMyListings,
} = require('../controllers/listingsController');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.get('/', getListings);
router.get('/my', protect, getMyListings);
router.get('/:id', getListing);
router.post('/', protect, upload.single('image'), createListing);
router.put('/:id', protect, upload.single('image'), updateListing);
router.delete('/:id', protect, deleteListing);

module.exports = router;
