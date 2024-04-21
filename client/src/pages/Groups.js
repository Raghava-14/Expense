import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newGroupDetails, setNewGroupDetails] = useState({
    name: '',
    groupType: 'Other',
    info: ''
  });
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

  const handleCreateGroup = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/api/groups', newGroupDetails, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setShowModal(false);
      // Fetch the groups again to update the list
      // You might want to extract fetchGroups() to be accessible here or just redirect to refresh
      navigate(0); // Simple way to refresh the page, consider a better state management or redirection
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">My Groups</h2>
      <button onClick={() => setShowModal(true)} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded">Create a New Group</button>
      {showModal && (
        <div className="modalBackground">
          <div className="modalContainer">
            <input type="text" placeholder="Group Name" value={newGroupDetails.name} onChange={(e) => setNewGroupDetails({ ...newGroupDetails, name: e.target.value })} />
            <select value={newGroupDetails.groupType} onChange={(e) => setNewGroupDetails({ ...newGroupDetails, groupType: e.target.value })}>
              <option value="Other">Other</option>
              <option value="Friends">Family</option>
              <option value="Family">Trip</option>
              <option value="Family">Vacation</option>
              <option value="Family">Friends</option>
              <option value="Family">Couple</option>
              <option value="Family">Home</option>
            </select>
            <textarea placeholder="Group Info" value={newGroupDetails.info} onChange={(e) => setNewGroupDetails({ ...newGroupDetails, info: e.target.value })}></textarea>
            <button onClick={handleCreateGroup} class="cursor-pointer transition-all bg-green-500 text-white px-6 py-2 rounded-lg border-green-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px] px-10 ml-4">Create Group</button>
            <button onClick={() => setShowModal(false)} class="cursor-pointer transition-all bg-red-500 text-white px-6 py-2 rounded-lg border-red-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px] px-10 ml-4">Cancel</button>
          </div>
        </div>
      )}
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