import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
        // Assuming the response.data itself is the array of friends as per your sample output
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
        // Check if response.data is the expected array, adjust accordingly
        setBlockedUsers(response.data.blockedUsers || []);
    } catch (err) {
        setError('Failed to fetch blocked users');
    }
};

  return (
    <div>
      <h2>My Friends</h2>
      <ul>
        {friends.map(friend => (
          <li key={friend.id}>{friend.first_name} {friend.last_name} - {friend.email}</li>
        ))}
      </ul>
      <form onSubmit={handleAddFriend}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Add friend by email"
          required
        />
        <button type="submit">Add Friend</button>
      </form>
      <button onClick={fetchBlockedUsers}>View Blocked Users</button>
      <ul>
        {blockedUsers.map(user => (
          <li key={user.id}>{user.first_name} {user.last_name} - {user.email}</li>
        ))}
      </ul>
      {error && <p>{error}</p>}
    </div>
  );
};

export default Friends;
