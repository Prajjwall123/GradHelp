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


router.post('/', createNotification);



router.get('/user/:userId', getUserNotifications);


router.get('/:id', getNotificationById);


router.patch('/:id/read', markAsRead);


router.patch('/user/:userId/read-all', markAllAsRead);


router.delete('/:id', deleteNotification);

module.exports = router;
