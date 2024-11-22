const User = require('../models/user.model');
const router = require('express').Router();
const mongoose = require('mongoose');
const { roles } = require('../utils/constants');

// Route to get all users
router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find();
    res.render('manage-users', { users });
  } catch (error) {
    next(error);
  }
});

// Route to view a user's profile
router.get('/user/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Invalid id');
      res.redirect('/admin/users');
      return;
    }
    const person = await User.findById(id);
    res.render('profile', { person });
  } catch (error) {
    next(error);
  }
});

// Route to update user role and status
router.post('/update-role-status', async (req, res, next) => {
  try {
    const { id, role, status } = req.body;

    if (!id || !role || !status) {
      req.flash('error', 'Invalid request');
      return res.redirect('back');
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Invalid id');
      return res.redirect('back');
    }

    const rolesArray = Object.values(roles);
    if (!rolesArray.includes(role)) {
      req.flash('error', 'Invalid role');
      return res.redirect('back');
    }

    const statuses = ['Active', 'Inactive'];
    if (!statuses.includes(status)) {
      req.flash('error', 'Invalid status');
      return res.redirect('back');
    }

    // Admin cannot remove themselves from being an admin
    if (req.user.id === id && role !== req.user.role) {
      req.flash('error', 'Admins cannot change their own role');
      return res.redirect('back');
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role, status },
      { new: true, runValidators: true }
    );

    req.flash('info', `Updated ${user.email}'s role to ${user.role} and status to ${user.status}`);
    res.redirect('back');
  } catch (error) {
    next(error);
  }
});

// Route to delete a user
router.post('/delete-user', async (req, res, next) => {
  try {
    const { id } = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Invalid request or ID');
      return res.redirect('back');
    }

    if (req.user.id === id) {
      req.flash('error', 'Admins cannot delete themselves');
      return res.redirect('back');
    }

    await User.findByIdAndDelete(id);

    req.flash('info', 'User deleted successfully');
    res.redirect('back');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
