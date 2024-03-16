const { User, Friendship } = require('../models');
const { Op } = require('sequelize');

//Send friend request
exports.sendFriendshipRequest = async (req, res) => {
    const { addresseeEmail } = req.body;
    const requesterId = req.user.id; // UserID is stored in JWT

    try {
        const addressee = await User.findOne({ where: { email: addresseeEmail } });
        if (!addressee) {
            return res.status(404).send({ message: 'User not found.' });
        }

        // Prevent users from sending requests to themselves
        if (addressee.id === requesterId) {
            return res.status(400).send({ message: "You cannot send a friend request to yourself." });
        }

        const existingFriendship = await Friendship.findOne({
            where: {
                [Op.or]: [
                    { requester_id: requesterId, addressee_id: addressee.id },
                    { requester_id: addressee.id, addressee_id: requesterId }
                ]
            }
        });

        // Scenario handling based on existing friendship status
        if (existingFriendship) {
            switch(existingFriendship.status) {
                case 'pending':
                case 'declined':
                    return res.status(409).send({
                        message: 'Friendship request already exists.',
                        actionRequired: 'Do you want to send another request?'
                    });
                case 'accepted':
                    return res.send({ message: 'You are already friends.' });
                case 'blocked':
                    // Assuming the requester is the one who was blocked; customize as needed
                    return res.status(403).send({ message: 'Request cannot be processed.' });
                case 'unblocked':
                case 'deleted':
                    existingFriendship.status = 'pending';
                    await existingFriendship.save();
                    return res.send({ message: 'Friendship request sent successfully.' });
                default:
                    // Handle any unexpected status
                    return res.status(500).send({ message: 'Unexpected status encountered.' });
            }
        } else {
            await Friendship.create({
                requester_id: requesterId,
                addressee_id: addressee.id,
                status: 'pending'
            });

            return res.send({ message: 'Friendship request sent successfully.' });
        }
    } catch (error) {
        console.error('Error sending friendship request:', error);
        res.status(500).send({ message: 'Server error.' });
    }
};


//Accept friend request
exports.acceptFriendshipRequest = async (req, res) => {
    const { token } = req.params; // Assuming the token is sent as a URL parameter

    try {
        const friendship = await Friendship.findOne({
            where: {
                invitation_token: token,
                status: { [Op.or]: ['pending', 'unblocked'] }
            }
        });
        if (!friendship) {
            return res.status(404).send({ message: 'Friendship request not found or already processed.' });
        }

        friendship.status = 'accepted';
        await friendship.save();

        res.send({ message: 'Friendship request accepted successfully.' });
    } catch (error) {
        console.error('Error accepting friendship request:', error);
        res.status(500).send({ message: 'Server error.' });
    }
};

//Decline friend request
exports.declineFriendshipRequest = async (req, res) => {
    const { token } = req.params; // Assuming the token is sent as a URL parameter

    try {
        const friendship = await Friendship.findOne({
            where: {
                invitation_token: token,
                status: { [Op.in]: ['pending', 'unblocked'] }
            }
        });
        if (!friendship) {
            return res.status(404).send({ message: 'Friendship request already processed or not found.'});
        }

        friendship.status = 'declined';
        await friendship.save();

        res.send({ message: 'Friendship request declined.' });
    } catch (error) {
        console.error('Error declining friendship request:', error);
        res.status(500).send({ message: 'Server error.' });
    }
};

// Remove friend (change status to "deleted")
exports.removeFriendship = async (req, res) => {
    const { userId } = req.params;
    const requesterId = req.user.id;

    try {
        const friendshipToUpdate = await Friendship.findOne({
            where: {
                [Op.or]: [
                    { requester_id: requesterId, addressee_id: userId },
                    { requester_id: userId, addressee_id: requesterId }
                ],
                status: 'accepted' // Can only remove accepted friendships
            }
        });

        if (!friendshipToUpdate) {
            return res.status(404).send({ message: 'Friendship not found or already removed.' });
        }

        friendshipToUpdate.status = 'deleted';
        await friendshipToUpdate.save();

        res.send({ message: 'Friendship removed successfully. You can re-establish the connection anytime.' });
    } catch (error) {
        console.error('Error removing friendship:', error);
        res.status(500).send({ message: 'Server error.' });
    }
};


//Block friend
exports.blockUser = async (req, res) => {
    const { userId } = req.params;
    const requesterId = req.user.id;

    try {
        const friendshipToUpdate = await Friendship.findOne({
            where: {
                [Op.or]: [
                    { requester_id: requesterId, addressee_id: userId },
                    { requester_id: userId, addressee_id: requesterId }
                ],
                status: { [Op.notIn]: ['blocked'] } // Ensure it's not already blocked or deleted
            }
        });

        if (!friendshipToUpdate) {
            return res.status(404).send({ message: 'Friendship not found.' });
        }

        friendshipToUpdate.status = 'blocked';
        await friendshipToUpdate.save();

        res.send({ message: 'User blocked successfully.' });
    } catch (error) {
        console.error('Error blocking user:', error);
        res.status(500).send({ message: 'Server error.' });
    }
};

//Unblock
exports.unblockUser = async (req, res) => {
    const { userId } = req.params;
    const requesterId = req.user.id;

    try {
        const friendshipToUpdate = await Friendship.findOne({
            where: {
                [Op.or]: [
                    { requester_id: requesterId, addressee_id: userId },
                    { requester_id: userId, addressee_id: requesterId }
                ],
                status: 'blocked'
            }
        });

        if (!friendshipToUpdate) {
            return res.status(404).send({ message: 'Blocked friendship not found.' });
        }

        friendshipToUpdate.status = 'unblocked';
        await friendshipToUpdate.save();

        res.send({ message: 'User unblocked successfully. You can now send a friend request again.' });
    } catch (error) {
        console.error('Error unblocking user:', error);
        res.status(500).send({ message: 'Server error.' });
    }
};



//View Blocked Users
exports.listBlockedUsers = async (req, res) => {
    const requesterId = req.user.id;

    try {
        const blockedUsers = await Friendship.findAll({
            where: { requester_id: requesterId, status: 'blocked' },
            include: [{
                model: User,
                as: 'Addressee',
                attributes: ['id', 'email', 'first_name', 'last_name'] // Adjust attributes as needed
            }]
        });

        res.json(blockedUsers.map(friendship => friendship.Addressee));
    } catch (error) {
        console.error('Error listing blocked users:', error);
        res.status(500).send({ message: 'Server error.' });
    }
};
