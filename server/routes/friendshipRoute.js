const express = require('express');
const router = express.Router();
const friendshipController = require('../controllers/friendshipController');
const verifyToken = require('../middleware/authMiddleware');

// Send friend request
router.post('/send-request', verifyToken, friendshipController.sendFriendshipRequest);

//Accept
router.post('/accept-request/:token', verifyToken, friendshipController.acceptFriendshipRequest);

//Decline
router.post('/decline-request/:token', verifyToken, friendshipController.declineFriendshipRequest);

// Remove a friend (change status to "deleted")
router.post('/remove/:userId', verifyToken, friendshipController.removeFriendship);

//Block
router.post('/block/:userId', verifyToken, friendshipController.blockUser);

//Unblock
router.post('/unblock/:userId', verifyToken, friendshipController.unblockUser);

//List friends
router.get('/list-friends', verifyToken, friendshipController.listFriends);

//List blocked users
router.get('/blocked-users', verifyToken, friendshipController.listBlockedUsers);

module.exports = router;