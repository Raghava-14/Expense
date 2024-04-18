import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NetBalance = () => {
  const [netBalance, setNetBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNetBalance = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('token'); // Ensure token is managed correctly
      try {
        const response = await axios.get('http://localhost:3000/api/expenses/balance', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNetBalance(response.data.data.netBalance);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch net balance:', error);
        setIsLoading(false);
      }
    };

    fetchNetBalance();
  }, []);

  const balanceMessage = netBalance >= 0 ? `You are owed $${netBalance} in total.` : `You owe $${Math.abs(netBalance)} in total.`;

  return (
    <div style={{ padding: '20px', margin: '20px 0', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
      <h3>Net Balance</h3>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div style={{ color: netBalance >= 0 ? 'green' : 'red', fontSize: '1.5em' }}>
          {balanceMessage}
        </div>
      )}
    </div>
  );
};

export default NetBalance;
