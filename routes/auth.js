const express = require('express');
const passport = require('passport');
const User = require('../models/user');
const router = express.Router();

// GET signup form
router.get('/signup', (req, res) => {
  res.render('signup');
});

// POST signup
router.post('/signup', async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      req.flash('error', 'All fields are required');
      return res.redirect('/signup');
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      req.flash('error', 'User already exists');
      return res.redirect('/signup');
    }

    const user = new User({ username, email });
    await User.register(user, password); // hashes and salts password
    // Auto login after successful signup
    req.login(user, (err) => {
      if (err) {
        req.flash('error', 'Login failed after signup');
        return res.redirect('/login');
      }
      req.flash('success', 'Signup successful');
      return res.redirect('/listings');
    });
  } catch (err) {
    // passport-local-mongoose may throw user exists error or validation errors
    req.flash('error', err.message || 'Signup failed');
    res.redirect('/signup');
  }
});

// GET login form
router.get('/login', (req, res) => {
  res.render('login');
});

// POST login
router.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
  }),
  (req, res) => {
    req.flash('success', 'Logged in successfully');
    res.redirect('/listings');
  }
);

// Logout
router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    req.flash('success', 'Logged out successfully');
    res.redirect('/login');
  });
});

module.exports = router;
