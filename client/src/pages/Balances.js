import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NetBalance from '../components/NetBalance';

const FriendsBalancePage = () => {
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [expensesDetails, setExpensesDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://localhost:3000/api/friendships/list-friends', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const friendsData = response.data;
      await Promise.all(friendsData.map(async (friend) => {
        const balanceResponse = await axios.get(`http://localhost:3000/api/expenses/balance/${friend.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        friend.balance = parseFloat(balanceResponse.data.data.net_balance);
      }));
      setFriends(friendsData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch friends:', error);
      setLoading(false);
    }
  };

  const toggleDetails = async (friend) => {
    if (selectedFriend && selectedFriend.id === friend.id) {
      setSelectedFriend(null); // Toggle off if the same friend is clicked again
      setExpensesDetails([]);
    } else {
      const token = localStorage.getItem('token');
      const detailsResponse = await axios.get(`http://localhost:3000/api/expenses/balance/${friend.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedFriend(friend);
      setExpensesDetails(detailsResponse.data.data.expensesInvolved);
    }
  };

  return (
    <div>
      <h1>Balances</h1>
      <NetBalance />
      {loading ? <p>Loading...</p> : (
        <div className="flex flex-wrap justify-start items-stretch gap-4 p-4">
          {friends.map(friend => (
            <div key={friend.id} className="w-64 h-20 bg-white shadow-lg rounded-lg p-4 cursor-pointer hover:shadow-xl" onClick={() => toggleDetails(friend)}>
              <h3 className="font-bold">{friend.first_name} {friend.last_name}</h3>
              <p style={{ color: friend.balance >= 0 ? 'green' : 'red' }}>
                {friend.balance >= 0 ? `You are owed $${friend.balance.toFixed(2)}` : `You owe $${Math.abs(friend.balance).toFixed(2)}`}
              </p>
              {selectedFriend && selectedFriend.id === friend.id && (
                <div className="mt-2 bg-gray-100 p-3 rounded shadow">
                  <h4 className="font-bold text-lg mb-2">Expense Details:</h4>
                  {expensesDetails.map(expense => (
                    <div key={expense.expenseId} className="bg-white rounded shadow p-2 mb-2">
                      <p className="font-bold">{expense.name}</p>
                      <p>{expense.date.slice(0, 10)}</p>
                      <p>Split: {expense.splitType}</p>
                      <p>Balance: <span style={{ color: expense.balance.startsWith('-') ? 'red' : 'green' }}>{expense.balance}</span></p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendsBalancePage;
