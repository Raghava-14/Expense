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

// Get group details by invitation link
router.get('/details/:link', verifyToken, groupController.getGroupByLink);

// Update group details
router.put('/:groupId', verifyToken, groupController.updateGroupDetails);

// List group members
router.get('/:groupId/members', verifyToken, groupController.listGroupMembers);

// Soft delete a group
router.delete('/:groupId/soft-delete', verifyToken, groupController.softDeleteGroup);

// Restore a soft-deleted group
router.post('/:groupId/restore', verifyToken, groupController.restoreGroup);

// Allow a user to exit a group
router.post('/:groupId/exit', verifyToken, groupController.exitGroup);

// Remove a user from a group by another member
router.delete('/:groupId/remove-user/:userIdToRemove', verifyToken, groupController.removeUserFromGroup);

// List all groups a user is a member of
router.get('/my-groups', verifyToken, groupController.listUserGroups);

// User restores themselves to a group
router.post('/:groupId/restore-self', verifyToken, groupController.restoreUserToGroupSelf);


module.exports = router;
