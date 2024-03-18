const { Group, GroupMember, User, Friendship } = require('../models'); // Adjust the path as necessary
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

        // Check if user is already a member of the group
        const isMember = await GroupMember.findOne({
            where: { group_id: group.id, user_id: joiningUserId }
        });
        if (isMember) {
            return res.status(409).send({ message: "You are already a member of this group." });
        }

        // Fetch all existing group members
        const members = await GroupMember.findAll({
            where: { group_id: group.id },
            attributes: ['user_id']
        });

        // Add user to group
        await GroupMember.create({
            group_id: group.id,
            user_id: joiningUserId
        });

        // Create friendship records with all existing group members
        await Promise.all(members.map(async (member) => {
            // Skip if the member is the user joining the group
            if (member.user_id !== joiningUserId) {
                // Check if there's an existing friendship, update if exists, create if not
                const [friendship, created] = await Friendship.findOrCreate({
                    where: {
                        [Op.or]: [
                            { requester_id: joiningUserId, addressee_id: member.user_id },
                            { requester_id: member.user_id, addressee_id: joiningUserId }
                        ]
                    },
                    defaults: {
                        requester_id: joiningUserId,
                        addressee_id: member.user_id,
                        status: 'accepted'
                    }
                });

                if (!created) {
                    // Update the status to 'accepted' if the friendship already existed but was not in 'accepted' status
                    friendship.status = 'accepted';
                    await friendship.save();
                }
            }
        }));

        res.status(201).send({ message: "Joined group successfully." });
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

  