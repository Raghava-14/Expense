const { User, Friendship } = require('../models');
const { Op } = require('sequelize');

// Send friend request
exports.sendFriendshipRequest = async (req, res) => {
    const { addresseeEmail } = req.body;
    const currentUserId = req.user.id; // UserID of the current user sending the request

    try {
        const addressee = await User.findOne({ where: { email: addresseeEmail } });
        if (!addressee) {
            return res.status(404).send({ message: 'User not found.' });
        }

        if (addressee.id === currentUserId) {
            return res.status(400).send({ message: "You cannot send a friend request to yourself." });
        }

        const existingFriendship = await Friendship.findOne({
            where: {
                [Op.or]: [
                    { requester_id: currentUserId, addressee_id: addressee.id },
                    { requester_id: addressee.id, addressee_id: currentUserId }
                ]
            }
        });

        // Function to handle actions based on current user and updated_by comparison
        const handleActionBasedOnStatus = (status) => {
            switch (status) {
                case 'pending':
                    return currentUserId === existingFriendship.updated_by ?
                        res.status(409).send({ message: "Request already sent, under processing." }) :
                        res.status(409).send({ message: `A Request has been sent by ${addressee.first_name}, please check your inbox.` });
                case 'accepted':
                    return res.send({ message: "Already friends." });
                case 'declined':
                case 'deleted':
                case 'unblocked':
                    existingFriendship.status = 'pending';
                    existingFriendship.updated_by = currentUserId;
                    return existingFriendship.save()
                        .then(() => res.send({ message: "Request sent successfully." }))
                        .catch(error => res.status(500).send({ message: 'Server error while updating request.' }));
                case 'blocked':
                    return currentUserId === existingFriendship.updated_by ?
                        res.status(403).send({ message: "Unblock user to send connection request." }) :
                        res.status(403).send({ message: "Unable to process request at the moment." });
                default:
                    return res.status(500).send({ message: 'Unexpected status encountered.' });
            }
        };

        if (existingFriendship) {
            return handleActionBasedOnStatus(existingFriendship.status);
        } else {
            return Friendship.create({
                requester_id: currentUserId,
                addressee_id: addressee.id,
                status: 'pending',
                updated_by: currentUserId
            })
            .then(() => res.send({ message: 'Friendship request sent successfully.' }))
            .catch(error => res.status(500).send({ message: 'Server error while creating request.' }));
        }
    } catch (error) {
        console.error('Error sending friendship request:', error);
        res.status(500).send({ message: 'Server error.' });
    }
};


// Accept friend request
exports.acceptFriendshipRequest = async (req, res) => {
    const { token } = req.params; // Assuming the token is sent as a URL parameter
    const currentUserId = req.user.id; // UserID of the current user attempting to accept the request

    try {
        const friendship = await Friendship.findOne({
            where: {
                invitation_token: token,
            },
            include: [{
                model: User,
                as: 'Requester',
                attributes: ['id', 'first_name']
            }]
        });

        if (!friendship) {
            return res.status(404).send({ message: 'Friendship request not found.' });
        }

        // Ensure the current user is the addressee of the pending request
        if (friendship.addressee_id !== currentUserId) {
            return res.status(403).send({ message: "You do not have permission to accept this request." });
        }

        switch (friendship.status) {
            case 'pending':
                friendship.status = 'accepted';
                friendship.updated_by = currentUserId;
                await friendship.save();
                return res.send({ message: `You are now friends with ${friendship.Requester.first_name}.` });

            case 'accepted':
                return res.send({ message: "Already friends." });

            case 'declined':
            case 'deleted':
            case 'blocked':
            case 'unblocked':
                return res.status(400).send({ message: "Not able to process request." });
            
            default:
                return res.status(500).send({ message: 'Unexpected status encountered.' });
        }
    } catch (error) {
        console.error('Error accepting friendship request:', error);
        res.status(500).send({ message: 'Server error.' });
    }
};


// Decline friend request
exports.declineFriendshipRequest = async (req, res) => {
    const { token } = req.params; // Assuming the token is sent as a URL parameter
    const currentUserId = req.user.id; // UserID of the current user attempting to decline the request

    try {
        const friendship = await Friendship.findOne({
            where: {
                invitation_token: token,
            },
            include: [{
                model: User,
                as: 'Requester',
                attributes: ['id', 'first_name']
            }]
        });

        if (!friendship) {
            return res.status(404).send({ message: 'Friendship request not found.' });
        }

        // Ensure the current user is the addressee of the request
        if (friendship.addressee_id !== currentUserId) {
            return res.status(403).send({ message: "You do not have permission to decline this request." });
        }

        switch (friendship.status) {
            case 'pending':
                friendship.status = 'declined';
                friendship.updated_by = currentUserId;
                await friendship.save();
                return res.send({ message: `You have declined the invitation from ${friendship.Requester.first_name}.` });

            case 'declined':
                // Check who is trying to decline it again to tailor the message
                return currentUserId === friendship.updated_by ?
                    res.send({ message: "You have already declined this invitation." }) :
                    res.send({ message: "This invitation has already been declined." });

            case 'accepted':
            case 'deleted':
            case 'blocked':
            case 'unblocked':
                // For these statuses, declining is not a valid action
                return res.status(400).send({ message: "Not able to process request." });
            
            default:
                return res.status(500).send({ message: 'Unexpected status encountered.' });
        }
    } catch (error) {
        console.error('Error declining friendship request:', error);
        res.status(500).send({ message: 'Server error.' });
    }
};


// Remove friend (change status to "deleted")
exports.removeFriendship = async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    try {
        const friendshipToUpdate = await Friendship.findOne({
            where: {
                [Op.or]: [
                    { requester_id: currentUserId, addressee_id: userId },
                    { requester_id: userId, addressee_id: currentUserId }
                ]
            },
            include: [{
                model: User,
                as: currentUserId === userId ? 'Requester' : 'Addressee', // Determine the opposite user based on the current user's role
                attributes: ['id', 'first_name']
            }]
        });

        if (!friendshipToUpdate) {
            return res.status(404).send({ message: 'No friendship found.' });
        }

        switch (friendshipToUpdate.status) {
            case 'accepted':
                friendshipToUpdate.status = 'deleted';
                friendshipToUpdate.updated_by = currentUserId;
                await friendshipToUpdate.save();
                return res.send({ message: `Removed ${friendshipToUpdate[currentUserId === userId ? 'Requester' : 'Addressee'].first_name} from your friends list successfully.` });

            case 'deleted':
                return res.send({ message: `No Friendship exists with ${friendshipToUpdate[currentUserId === userId ? 'Requester' : 'Addressee'].first_name}.` });

            case 'pending':
            case 'declined':
            case 'blocked':
            case 'unblocked':
                return res.status(400).send({ message: "No friendship found to remove." });
            
            default:
                return res.status(500).send({ message: 'Unexpected status encountered.' });
        }
    } catch (error) {
        console.error('Error removing friendship:', error);
        res.status(500).send({ message: 'Server error.' });
    }
};


// Block friend
exports.blockUser = async (req, res) => {
    const { userId } = req.params; // ID of the user to be blocked
    const currentUserId = req.user.id; // UserID of the current user performing the block action

    try {
        const existingFriendship = await Friendship.findOne({
            where: {
                [Op.or]: [
                    { requester_id: currentUserId, addressee_id: userId },
                    { requester_id: userId, addressee_id: currentUserId }
                ]
            },
            include: [{
                model: User,
                as: 'Addressee',
                attributes: ['id', 'first_name']
            }]
        });

        if (!existingFriendship) {
            return res.status(404).send({ message: "You can't block a user without any prior interaction." });
        }

        if (existingFriendship.status === 'blocked') {
            if (existingFriendship.updated_by === currentUserId) {
                return res.send({ message: "Already blocked this user." });
            } else {
                return res.status(403).send({ message: "You can't block someone who has already blocked you." });
            }
        }

        existingFriendship.status = 'blocked';
        existingFriendship.updated_by = currentUserId;
        await existingFriendship.save();

        res.send({ message: `Blocked ${existingFriendship.Addressee.first_name} successfully.` });
    } catch (error) {
        console.error('Error blocking user:', error);
        res.status(500).send({ message: 'Server error.' });
    }
};


// Unblock
exports.unblockUser = async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user.id; // UserID of the current user performing the unblock action

    try {
        const blockedFriendship = await Friendship.findOne({
            where: {
                [Op.or]: [
                    { requester_id: currentUserId, addressee_id: userId },
                    { requester_id: userId, addressee_id: currentUserId }
                ],
                status: 'blocked',
                updated_by: currentUserId // Ensure that the unblock action is initiated by the user who blocked
            },
            include: [{
                model: User,
                as: 'Addressee',
                attributes: ['id', 'first_name']
            }]
        });

        if (!blockedFriendship) {
            // Handle case where current user is the one who was blocked or no blocked relationship found
            const wasIBlocked = await Friendship.findOne({
                where: {
                    [Op.or]: [
                        { requester_id: currentUserId, addressee_id: userId },
                        { requester_id: userId, addressee_id: currentUserId }
                    ],
                    status: 'blocked',
                }
            });
            if (wasIBlocked) {
                return res.status(403).send({ message: "You cannot unblock a user who has blocked you." });
            }
            return res.status(404).send({ message: "No blocked relationship found." });
        }

        blockedFriendship.status = 'unblocked';
        blockedFriendship.updated_by = currentUserId; // Update the unblocker as the last to modify the record
        await blockedFriendship.save();

        res.send({ message: `Unblocked ${blockedFriendship.Addressee.first_name} successfully. You can re-establish connection with them.` });
    } catch (error) {
        console.error('Error unblocking user:', error);
        res.status(500).send({ message: 'Server error.' });
    }
};


// View All Friends
exports.listFriends = async (req, res) => {
    const currentUserId = req.user.id;

    try {
        const friendships = await Friendship.findAll({
            where: {
                [Op.or]: [
                    { requester_id: currentUserId },
                    { addressee_id: currentUserId }
                ],
                status: 'accepted'
            },
            include: [
                {
                    model: User,
                    as: 'Requester',
                    attributes: ['id', 'email', 'first_name', 'last_name'],
                },
                {
                    model: User,
                    as: 'Addressee',
                    attributes: ['id', 'email', 'first_name', 'last_name'],
                }
            ]
        });

        // Map through the friendships to find and return details of the other user (friend)
        const friendsList = friendships.map(friendship => {
            // Determine if the current user is the requester or the addressee to return the other user's details
            if (friendship.requester_id === currentUserId) {
                return friendship.Addressee;
            } else {
                return friendship.Requester;
            }
        });

        res.json(friendsList);
    } catch (error) {
        console.error('Error listing friends:', error);
        res.status(500).send({ message: 'Server error.' });
    }
};



// View Blocked Users
exports.listBlockedUsers = async (req, res) => {
    const currentUserId = req.user.id;

    try {
        const blockedUsers = await Friendship.findAll({
            where: { 
                [Op.or]: [
                    { requester_id: currentUserId, updated_by: currentUserId },
                    { addressee_id: currentUserId, updated_by: currentUserId }
                ],
                status: 'blocked'
            },
            include: [{
                model: User,
                // Dynamically adjust association based on who initiated the block
                as: 'Addressee',
                attributes: ['id', 'email', 'first_name', 'last_name']
            }]
        });

        // Filter out the blocked users where the current user was the initiator
        const filteredBlockedUsers = blockedUsers.filter(friendship => friendship.updated_by === currentUserId);

        // Map to get user details
        const userDetails = filteredBlockedUsers.map(friendship => {
            return {
                id: friendship.Addressee.id,
                email: friendship.Addressee.email,
                first_name: friendship.Addressee.first_name,
                last_name: friendship.Addressee.last_name,
            };
        });

        res.json(userDetails);
    } catch (error) {
        console.error('Error listing blocked users:', error);
        res.status(500).send({ message: 'Server error.' });
    }
};

