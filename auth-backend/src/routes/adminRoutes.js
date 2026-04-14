'use strict';
const express = require('express');
const router  = express.Router();

const { getStats, getAllUsers, changeUserRole, deleteUser } = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// All admin routes require: valid JWT + ADMIN role
router.use(protect);
router.use(restrictTo('ADMIN'));

router.get   ('/stats',              getStats);
router.get   ('/users',              getAllUsers);
router.patch ('/users/:id/role',     changeUserRole);
router.delete('/users/:id',          deleteUser);

module.exports = router;
