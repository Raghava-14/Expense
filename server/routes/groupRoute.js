const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware'); // Ensure you have this middleware for JWT verification
const groupController = require('../controllers/groupController'); // Adjust the path as necessary

// Create a new group
router.post('/', verifyToken, groupController.createGroup);

// Generate a new invitation link for a group
router.put('/:groupId/new-invitation-link', verifyToken, groupController.generateNewInvitationLink);

// Join a group through invitation link
router.post('/join/:link', verifyToken, groupController.joinGroupByLink);

// Fetch group details by invitation link
router.get('/details/:link', verifyToken, groupController.getGroupByLink);

// Update group details
router.put('/:groupId', verifyToken, groupController.updateGroupDetails);

// List group members
router.get('/:groupId/members', verifyToken, groupController.listGroupMembers);

// Soft delete a group
router.delete('/:groupId/soft-delete', verifyToken, groupController.softDeleteGroup);

// Restore a soft-deleted group
router.post('/:groupId/restore', verifyToken, groupController.restoreGroup);

module.exports = router;
