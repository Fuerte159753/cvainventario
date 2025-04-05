// routes/userRoutes.js
const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/login', userController.login);
router.get('/profile/:id', userController.getUserProfile);
router.put('/profile/:id', userController.updateProfile);
router.put('/profile/:id/password', userController.updatePassword);

module.exports = router;