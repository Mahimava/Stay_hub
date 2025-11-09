const express = require('express');
const router = express.Router();
const Listing = require('../models/listings');
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
const { listingSchema } = require('../schema');
const { isLoggedIn, isListingOwner } = require('../utils/middleware');

function validateListing(req, res, next){
  const { error } = listingSchema.validate(req.body);
  if(error){
      const msg = error.details.map(el => el.message).join(', ');
      throw new ExpressError(400, msg);
  } else {
      next();
  }
}

// All listings
router.get('/', wrapAsync(async (req,res) => {
  const allListings = await Listing.find({}).populate('owner', 'username');
  res.render('listings/index.ejs', { allListings });
}));

// New form
router.get('/new', isLoggedIn, (req,res) => {
  res.render('listings/new.ejs');
});

// Show
router.get('/:id', wrapAsync(async (req,res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate('owner', 'username')
    .populate({ path: 'reviews', populate: { path: 'author', select: 'username' } });
  if (!listing) {
    throw new ExpressError(404, 'Listing not found');
  }
  res.render('listings/show', { listing });
}));

// Create
router.post('/', isLoggedIn, validateListing, wrapAsync(async (req,res) => {
  const payload = req.body.listing || {};
  if (typeof payload.image === 'string') {
    const url = payload.image.trim();
    if (url.length > 0) {
      payload.image = { filename: 'listingimage', url };
    } else {
      delete payload.image;
    }
  }
  const newListing = new Listing(payload);
  newListing.owner = req.user._id;
  await newListing.save();
  req.flash('success', 'New listing added');
  res.redirect('/listings');
}));

// Edit form
router.get('/:id/edit', isLoggedIn, isListingOwner, wrapAsync(async (req,res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    throw new ExpressError(404, 'Listing not found');
  }
  res.render('listings/edit.ejs', { listing });
}));

// Update
router.put('/:id', isLoggedIn, isListingOwner, validateListing, wrapAsync(async (req,res) => {
  const { id } = req.params;
  const payload = req.body.listing || {};
  if (typeof payload.image === 'string') {
    const url = payload.image.trim();
    if (url.length > 0) {
      payload.image = { filename: 'listingimage', url };
    } else {
      delete payload.image;
    }
  }
  await Listing.findByIdAndUpdate(id, { ...payload });
  req.flash('success', 'Listing updated');
  res.redirect('/listings');
}));

// Delete
router.delete('/:id', isLoggedIn, isListingOwner, wrapAsync(async (req,res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash('success', 'Listing deleted');
  res.redirect('/listings');
}));

module.exports = router;
