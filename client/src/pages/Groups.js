import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/groups/my-groups', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setGroups(response.data);
      } catch (error) {
        console.error("Error fetching groups:", error);
        // Handle error, e.g., show error message
      }
    };

    fetchGroups();
  }, []);

  const handleGroupClick = (groupId) => {
    navigate(`/dashboard/groups/${groupId}`);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">My Groups</h2>
      {groups.length > 0 ? (
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.id} className="p-4 bg-white shadow rounded-lg" onClick={() => handleGroupClick(group.id)}>
              <h3 className="text-lg font-semibold">{group.name}</h3>
            </div>
          ))}
        </div>
      ) : (
        <p>You are not a member of any groups.</p>
      )}
    </div>
  );
};

export default Groups;
