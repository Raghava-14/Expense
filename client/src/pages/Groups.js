import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newGroupDetails, setNewGroupDetails] = useState({
    name: '',
    groupType: '',
    info: ''
  });
  const [errors, setErrors] = useState({});
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
      }
    };

    fetchGroups();
  }, []);

  const validateForm = () => {
    let hasError = false;
    let errors = {};

    if (!newGroupDetails.name.trim()) {
      errors.name = 'Group name is required';
      hasError = true;
    }
    if (!newGroupDetails.groupType.trim()) {
      errors.groupType = 'Group type is required';
      hasError = true;
    }
    if (!newGroupDetails.info.trim()) {
      errors.info = 'Group info is required';
      hasError = true;
    }

    setErrors(errors);
    return !hasError;
  };

  const handleGroupClick = (groupId) => {
    navigate(`/dashboard/groups/${groupId}`);
  };

  const handleCreateGroup = async () => {
    if (validateForm()) {
      try {
        const token = localStorage.getItem('token');
        await axios.post('http://localhost:3000/api/groups', newGroupDetails, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setShowModal(false);
        navigate(0); // Refresh the page to show the new group
      } catch (error) {
        console.error("Error creating group:", error);
        alert('Failed to create group. Please try again.');
      }
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">My Groups</h2>
      <button onClick={() => setShowModal(true)} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded">Create a New Group</button>
      {showModal && (
        <div className="modalBackground flex items-center justify-center fixed inset-0 bg-black bg-opacity-25">
          <div className="modalContainer bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
            <h3 className="font-semibold text-xl mb-4">Create a New Group</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Group Name</label>
              <input type="text" placeholder="Enter group name" value={newGroupDetails.name} onChange={(e) => setNewGroupDetails({ ...newGroupDetails, name: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Group Type</label>
              <select value={newGroupDetails.groupType} onChange={(e) => setNewGroupDetails({ ...newGroupDetails, groupType: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                <option value="" disabled>Select group type</option>
                <option value="Family">Family</option>
                <option value="Friends">Friends</option>
                <option value="Trip">Trip</option>
                <option value="Vacation">Vacation</option>
                <option value="Couple">Couple</option>
                <option value="Home">Home</option>
                <option value="Other">Other</option>
              </select>
              {errors.groupType && <p className="text-red-500 text-xs mt-1">{errors.groupType}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Group Info</label>
              <textarea placeholder="Additional info about the group" value={newGroupDetails.info} onChange={(e) => setNewGroupDetails({ ...newGroupDetails, info: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
              {errors.info && <p className="text-red-500 text-xs mt-1">{errors.info}</p>}
            </div>
            <div className="flex justify-end space-x-4">
              <button onClick={handleCreateGroup} className="px-4 py-2 bg-green-500 text-white rounded-lg">Create Group</button>
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-red-500 text-white rounded-lg">Cancel</button>
            </div>
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
