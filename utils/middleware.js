const Listing = require('../models/listings');
const Review = require('../models/review');

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  req.flash('error', 'You must be logged in');
  return res.redirect('/login');
}

async function isListingOwner(req, res, next) {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash('error', 'Listing not found');
    return res.redirect('/listings');
  }
  if (req.user && listing.owner && listing.owner.equals(req.user._id)) return next();
  req.flash('error', 'You do not have permission');
  return res.redirect('/listings');
}

async function isReviewAuthor(req, res, next) {
  const { reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review) {
    req.flash('error', 'Review not found');
    return res.redirect('back');
  }
  if (req.user && review.author && review.author.equals(req.user._id)) return next();
  req.flash('error', 'You do not have permission');
  return res.redirect('back');
}

module.exports = { isLoggedIn, isListingOwner, isReviewAuthor };
