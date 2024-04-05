const { Group, GroupMember, User, Friendship, sequelize } = require('../models'); // Adjust the path as necessary
const { v4: uuidv4 } = require('uuid');
const { Sequelize, Model, DataTypes } = require('sequelize');
const group = require('../models/group');
const { Op } = Sequelize;


// Create a new group
exports.createGroup = async (req, res) => {
  const { name, groupType, info } = req.body;
  const userId = req.user.id; // UserID from JWT

  try {
    const newGroup = await Group.create({
      name,
      group_type: groupType || 'Other',
      info,
      invitation_link: uuidv4(), // Generate unique invitation link
      created_by: userId,
      updated_by: userId // Assuming your model and migration include updated_by
    });

    // Add group creator as the first member
    await GroupMember.create({
      group_id: newGroup.id,
      user_id: userId
    });

    res.status(201).send({ message: "Group created successfully", group: newGroup });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).send({ message: "Server error" });
  }
};



// Generate a new invitation link for a group
exports.generateNewInvitationLink = async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user.id; // Assuming you have user's ID in req.user.id from JWT
  
    try {
      const group = await Group.findOne({ where: { id: groupId } });
      if (!group) {
      return res.status(404).send({ message: "Group not found." });
    }
      // Check if the current user is a member of the group
      const isMember = await GroupMember.findOne({
        where: {
          group_id: groupId,
          user_id: userId
        }
      });
  
      if (!isMember) {
        return res.status(403).send({ message: "Only members of the group can generate a new invitation link." });
      }
  
      // Generate a new unique invitation link
      const newInvitationLink = uuidv4();
  
      // Update the group with the new invitation link
      await Group.update(
        { invitation_link: newInvitationLink, updated_by: userId },
        { where: { id: groupId } }
      );
  
      res.send({
        message: "New invitation link generated successfully",
        newInvitationLink
      });
    } catch (error) {
      console.error("Error generating new invitation link:", error);
      res.status(500).send({ message: "Server error" });
    }
  };
  
  
  // Join group through invitation link
exports.joinGroupByLink = async (req, res) => {
  const { link } = req.params;
  const joiningUserId = req.user.id; // The ID of the user joining the group

  try {
    const group = await Group.findOne({ where: { invitation_link: link } });
    if (!group) {
      return res.status(404).send({ message: "Group not found." });
    }

    // Check for an existing membership record, including soft-deleted ones
    let member = await GroupMember.findOne({
      where: { group_id: group.id, user_id: joiningUserId },
      paranoid: false // Include soft-deleted records
    });

    // If the user is already a member (including soft-deleted membership), handle accordingly
    if (member) {
      if (member.deletedAt) {
        // If the membership was soft-deleted, restore it
        await member.update({ deletedAt: null, deleted_by: null }, { paranoid: false });
        // No need to update friendships as they remain intact
        return res.send({ message: "Membership restored. You are a member again." });
      } else {
        // If the membership exists and is active
        return res.status(409).send({ message: "You are already a member of this group." });
      }
    }

    // If no existing membership record was found, proceed to add the user to the group
    member = await GroupMember.create({
      group_id: group.id,
      user_id: joiningUserId
    });

    // Fetch all current group members
    const members = await GroupMember.findAll({
      where: { group_id: group.id },
      attributes: ['user_id']
    });

    // Create or update friendship records with all existing group members
    await Promise.all(members.map(async (existingMember) => {
      if (existingMember.user_id !== joiningUserId) {
        const [friendship, created] = await Friendship.findOrCreate({
          where: {
            [Op.or]: [
              { requester_id: joiningUserId, addressee_id: existingMember.user_id },
              { requester_id: existingMember.user_id, addressee_id: joiningUserId }
            ]
          },
          defaults: {
            requester_id: joiningUserId,
            addressee_id: existingMember.user_id,
            status: 'accepted'
          }
        });

        if (!created && friendship.status !== 'accepted') {
          // If a friendship exists but is not in 'accepted' status, update it
          friendship.status = 'accepted';
          await friendship.save();
        }
      }
    }));

    res.status(201).send({ message: "Joined group successfully. Friendships updated." });
  } catch (error) {
    console.error("Error joining group and updating friendships:", error);
    res.status(500).send({ message: "Server error." });
  }
};


  // Fetch group details by invitation link
exports.getGroupByLink = async (req, res) => {
    const { link } = req.params;
    try {
        const group = await Group.findOne({
            where: { invitation_link: link },
            include: [{
                model: User,
                as: 'Creator',
                attributes: ['id', 'email', 'first_name', 'last_name']
            }]
        });
        if (!group) {
            return res.status(404).send({ message: "Group not found." });
        }
        res.status(200).send(group);
    } catch (error) {
        console.error("Error fetching group details:", error);
        res.status(500).send({ message: "Server error." });
    }
};

  
  // Update group details
exports.updateGroupDetails = async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user.id; // UserID from JWT
    const { name, groupType, info } = req.body;
  
    try {
      const group = await Group.findOne({ where: { id: groupId } });
      if (!group) {
        return res.status(404).send({ message: "Group not found." });
      }

      // Ensure the user is a member of the group
      const isMember = await GroupMember.findOne({
        where: { group_id: groupId, user_id: userId }
      });
      if (!isMember) {
        return res.status(403).send({ message: "Access denied. Not a group member." });
      }
  
      // Update group details
      await Group.update({ name, group_type: groupType, info }, { where: { id: groupId } });
      res.send({ message: "Group details updated successfully." });
    } catch (error) {
      console.error("Error updating group details:", error);
      res.status(500).send({ message: "Server error" });
    }
  };
  

  // List group members
exports.listGroupMembers = async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user.id; // UserID from JWT
  
    try {
      const group = await Group.findOne({ where: { id: groupId } });
      if (!group) {
        return res.status(404).send({ message: "Group not found." });
      }
      // Ensure the user is a member of the group
      const isMember = await GroupMember.findOne({
        where: { group_id: groupId, user_id: userId }
      });
      if (!isMember) {
        return res.status(403).send({ message: "Access denied. Not a group member." });
      }
  
      // Fetch and list group members
      const members = await GroupMember.findAll({
        where: { group_id: groupId },
        include: [{ model: User, as: 'User', attributes: ['id', 'email', 'first_name', 'last_name'] }]
      });
  
      res.json(members.map(member => member.User));
    } catch (error) {
      console.error("Error listing group members:", error);
      res.status(500).send({ message: "Server error" });
    }
  };
  

// Soft delete a group
exports.softDeleteGroup = async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id; // UserID from JWT
  
  try {
    const group = await Group.findOne({ where: { id: groupId } });
    if (!group) {
      return res.status(404).send({ message: "Group not found." });
    }
    // Ensure the user is a member of the group
    const isMember = await GroupMember.findOne({
      where: { group_id: groupId, user_id: userId }
    });
    if (!isMember) {
      return res.status(403).send({ message: "Not authorized. You must be a member of the group." });
    }

    // Update deleted_by before soft deleting
    await Group.update({ deleted_by: userId }, { where: { id: groupId }, paranoid: false });

    // Attempt to soft delete the group
    const result = await Group.destroy({ where: { id: groupId } });
    if (result === 0) {
      // No records were deleted, indicating the group might not have been found
      return res.status(404).send({ message: "Group not found or already deleted." });
    }

    res.send({ message: "Group has been soft deleted successfully." });
  } catch (error) {
    console.error("Error soft deleting the group:", error);
    res.status(500).send({ message: "Server error." });
  }
};


  
 // Restore a soft-deleted group
exports.restoreGroup = async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id; // UserID from JWT

  try {
      // Include soft-deleted groups in the search to find the target group
      const group = await Group.findOne({
          where: { id: groupId },
          paranoid: false // Include soft-deleted records
      });
      if (!group) {
          return res.status(404).send({ message: "Group not found." });
      }

      const isMember = await GroupMember.findOne({
          where: { group_id: groupId, user_id: userId }
      });
      if (!isMember) {
          return res.status(403).send({ message: "Not authorized. You must be a member of the group." });
      }

      // Restore the group by setting deletedAt and deleted_by to null
      await Group.update({ deletedAt: null, deleted_by: null }, { where: { id: groupId }, paranoid: false });

      res.send({ message: "Group has been restored successfully." });
  } catch (error) {
      console.error("Error restoring the group:", error);
      res.status(500).send({ message: "Server error." });
  }
};


// List all groups a user is a member of
exports.listUserGroups = async (req, res) => {
  const userId = req.user.id; // UserID from JWT

  try {
    const groups = await GroupMember.findAll({
      where: { user_id: userId }, // Use the correct column name
      include: [{
        model: Group,
        as: 'Group', // Make sure this matches the alias in your association
        attributes: ['id', 'name', 'group_type', 'info', 'invitation_link', 'created_by'],
        where: { deletedAt: null },
      }],
      attributes: ['group_id'],
    });

    const groupDetails = groups.map(groupMember => groupMember.Group);
    res.status(200).json(groupDetails);
  } catch (error) {
    console.error("Error listing user's groups:", error);
    res.status(500).send({ message: "Server error." });
  }
};


// Allow a user to exit a group
exports.exitGroup = async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id;

  try {
    const group = await Group.findOne({ where: { id: groupId } });
    if (!group) {
      return res.status(404).send({ message: "Group not found." });
    }

    const member = await GroupMember.findOne({
      where: { group_id: groupId, user_id: userId },
      paranoid: false
    });

    if (!member) {
      return res.status(404).send({ message: "You are not a member of this group." });
    }

    if (member.deletedAt) {
      return res.status(409).send({ message: "You have already exited this group." });
    }

    await member.update({ deleted_by: userId });
    await member.destroy();
    res.send({ message: "You have successfully exited the group." });
  } catch (error) {
    console.error("Error exiting the group:", error);
    res.status(500).send({ message: "Server error." });
  }
};



// Remove a user from a group
exports.removeUserFromGroup = async (req, res) => {
  const { groupId, userIdToRemove } = req.params;
  const actionUserId = req.user.id; // UserID from JWT of the user performing the action

  try {
    const group = await Group.findOne({ where: { id: groupId } });
    if (!group) {
      return res.status(404).send({ message: "Group not found." });
    }

    // Check if the action user is a member of the group
    const actionUserMember = await GroupMember.findOne({ where: { group_id: groupId, user_id: actionUserId }, paranoid: false });
    if (!actionUserMember || actionUserMember.deletedAt) {
      return res.status(403).send({ message: "You must be a member of the group to remove users." });
    }

    const memberToRemove = await GroupMember.findOne({ where: { group_id: groupId, user_id: userIdToRemove }, paranoid: false });
    if (!memberToRemove) {
      return res.status(404).send({ message: "User not found in the group." });
    }

    if (memberToRemove.deletedAt) {
      return res.status(409).send({ message: "User has already been removed from the group." });
    }

    await memberToRemove.update({ deleted_by: actionUserId });
    await memberToRemove.destroy();
    res.send({ message: "User has been successfully removed from the group." });
  } catch (error) {
    console.error("Error removing user from the group:", error);
    res.status(500).send({ message: "Server error." });
  }
};




// User restores themselves to a group
exports.restoreUserToGroupSelf = async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id;

  try {
    const group = await Group.findOne({ where: { id: groupId } });
    if (!group) {
      return res.status(404).send({ message: "Group not found." });
    }

    const member = await GroupMember.findOne({
      where: { group_id: groupId, user_id: userId },
      paranoid: false
    });

    if (!member) {
      return res.status(404).send({ message: "Group membership not found." });
    }

    if (member.deletedAt === null) {
      return res.status(409).send({ message: "You are already a member of this group." });
    }

    // Explicitly set deletedAt and deleted_by to null
    await member.restore();
    await member.update({ deletedAt: null, deleted_by: null }, { paranoid: false });

    res.send({ message: "You have been successfully restored to the group." });
  } catch (error) {
    console.error("Error restoring user to the group:", error);
    res.status(500).send({ message: "Server error." });
  }
};
