import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Friends.css';  // Ensure the path is correct

const Friends = () => {
    const [friends, setFriends] = useState([]);
    const [email, setEmail] = useState('');
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchFriends();
    }, []);

    const fetchFriends = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/friendships/list-friends', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setFriends(response.data);
        } catch (err) {
            setError('Failed to fetch friends');
        }
    };

    const handleAddFriend = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3000/api/friendships/send-request', { addresseeEmail: email }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            alert('Friend request sent');
            setEmail('');
        } catch (err) {
            setError('Failed to send friend request');
        }
    };

    const fetchBlockedUsers = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/friendships/blocked-users', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setBlockedUsers(response.data.blockedUsers || []);
        } catch (err) {
            setError('Failed to fetch blocked users');
        }
    };

    return (
        <div>
            <h2 className="title">My Friends</h2>
            <div className="friends-container">
                {friends.map(friend => (
                    <div key={friend.id} className="friend-card">
                        <h3>{friend.first_name} {friend.last_name}</h3>
                        <p>{friend.email}</p>
                    </div>
                ))}
            </div>
            <form onSubmit={handleAddFriend}>
                <input
                    type="email"
                    className="input-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Add a friend by email"
                    required
                />
                <button type="submit" className="btn">Add Friend</button>
            </form>
            <button onClick={fetchBlockedUsers} className="btn">View Blocked Users</button>
            <ul>
                {blockedUsers.map(user => (
                    <div key={user.id} className="friend-card">
                        <h3>{user.first_name} {user.last_name}</h3>
                        <p>{user.email}</p>
                    </div>
                ))}
            </ul>
            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default Friends;
