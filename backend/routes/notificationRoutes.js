const express = require('express');
const router = express.Router();
const {
    createNotification,
    getUserNotifications,
    getNotificationById,
    markAsRead,
    markAllAsRead,
    deleteNotification
} = require('../controllers/notificationController');

// Create a new notification
router.post('/', createNotification);

// Get all notifications for a user (with pagination)
// GET /notifications/user/:userId?page=1&limit=10
router.get('/user/:userId', getUserNotifications);

// Get a single notification by ID
router.get('/:id', getNotificationById);

// Mark a notification as read
router.patch('/:id/read', markAsRead);

// Mark all notifications as read for a user
router.patch('/user/:userId/read-all', markAllAsRead);

// Delete a notification
router.delete('/:id', deleteNotification);

module.exports = router;
