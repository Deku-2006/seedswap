const Listing = require('../models/Listing');
const { cloudinary } = require('../config/cloudinary');

exports.getListings = async (req, res) => {
  try {
    const { search, page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = { isAvailable: true };
    if (search) {
      query.$text = { $search: search };
    }

    const [listings, total] = await Promise.all([
      Listing.find(query)
        .populate('owner', 'name location avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Listing.countDocuments(query),
    ]);

    res.json({
      success: true,
      listings,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate(
      'owner',
      'name location avatar bio createdAt'
    );
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }
    res.json({ success: true, listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createListing = async (req, res) => {
  try {
    const { title, description, seedType, quantity, swapFor, tags } = req.body;

    if (!title || !description || !seedType || !quantity) {
      return res.status(400).json({ success: false, message: 'Title, description, seed type, and quantity are required.' });
    }

    const listingData = {
      title,
      description,
      seedType,
      quantity,
      swapFor,
      owner: req.user._id,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim())) : [],
    };

    if (req.file) {
      listingData.image = req.file.path;
      listingData.imagePublicId = req.file.filename;
    }

    const listing = await Listing.create(listingData);
    await listing.populate('owner', 'name location avatar');

    res.status(201).json({ success: true, listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateListing = async (req, res) => {
  try {
    let listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found.' });

    if (listing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this listing.' });
    }

    const updates = { ...req.body };
    if (req.file) {
      if (listing.imagePublicId) {
        await cloudinary.uploader.destroy(listing.imagePublicId);
      }
      updates.image = req.file.path;
      updates.imagePublicId = req.file.filename;
    }

    listing = await Listing.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate('owner', 'name location avatar');

    res.json({ success: true, listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found.' });

    if (listing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this listing.' });
    }

    if (listing.imagePublicId) {
      await cloudinary.uploader.destroy(listing.imagePublicId);
    }

    await listing.deleteOne();
    res.json({ success: true, message: 'Listing deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ owner: req.user._id })
      .populate('owner', 'name location avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, listings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
