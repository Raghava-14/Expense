import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const GroupDetails = () => {
  const { groupId } = useParams();
  const [groupDetails, setGroupDetails] = useState(null);
  const [members, setMembers] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editableDetails, setEditableDetails] = useState({
    name: '',
    group_type: '',
    info: ''
  });


// Define fetchGroupDetails with useCallback
const fetchGroupDetails = useCallback(async () => {
  try {
    const response = await axios.get(`http://localhost:3000/api/groups/${groupId}/details`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    setGroupDetails(response.data);
    setEditableDetails({
      name: response.data.name,
      group_type: response.data.group_type,
      info: response.data.info,
    });
  } catch (error) {
    console.error("Error fetching group details:", error);
  }
}, [groupId]);

// Define fetchMembers with useCallback
const fetchMembers = useCallback(async () => {
  try {
    const response = await axios.get(`http://localhost:3000/api/groups/${groupId}/members`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    setMembers(response.data.map(member => member.first_name).join(', '));
  } catch (error) {
    console.error("Error fetching group members:", error);
  }
}, [groupId]);

useEffect(() => {
  fetchGroupDetails();
  fetchMembers();
}, [fetchGroupDetails, fetchMembers]);

  const handleEdit = () => setEditMode(!editMode);

  const handleChange = (e) => setEditableDetails({ ...editableDetails, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:3000/api/groups/${groupId}`, editableDetails, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchGroupDetails();
      setEditMode(false);
    } catch (error) {
      console.error("Error updating group details:", error);
    }
  };

  const handleGenerateNewLink = async () => {
    try {
      await axios.put(`http://localhost:3000/api/groups/${groupId}/new-invitation-link`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchGroupDetails();
    } catch (error) {
      console.error("Error generating new invitation link:", error);
    }
  };

  const handleDeleteGroup = async () => {
    if (window.confirm("Are you sure you want to delete this group? This cannot be undone.")) {
      try {
        await axios.delete(`http://localhost:3000/api/groups/${groupId}/soft-delete`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        // Redirect or refresh page after deletion
      } catch (error) {
        console.error("Error deleting group:", error);
      }
    }
  };

  if (!groupDetails) return <div>Loading...</div>;

  return (
    <div>
      <h2>Group Details</h2>
      {editMode ? (
        <form onSubmit={handleSubmit}>
          <input type="text" name="name" value={editableDetails.name} onChange={handleChange} />
          <select name="group_type" value={editableDetails.group_type} onChange={handleChange}>
            {/* Options */}
            <option value="Home">Home</option>
            <option value="Couple">Couple</option>
            <option value="Friends">Friends</option>
            <option value="Vacation">Vacation</option>
            <option value="Trip">Trip</option>
            <option value="Family">Family</option>
            <option value="Other">Other</option>
          </select>
          <textarea name="info" value={editableDetails.info} onChange={handleChange} />
          <button type="submit">Save Changes</button>
        </form>
      ) : (
        <>
          {/* Display group details */}
          <p>Group Name: {groupDetails.name}</p>
          <p>Group Type: {groupDetails.group_type}</p>
          <p>Information: {groupDetails.info}</p>
          <p>Invitation Link: {groupDetails.invitation_link}</p>
          <p>Members: {members}</p>
          <button onClick={handleEdit} className="bg-green-900 text-white bg-green-400 border border-green-400 border-b-4 font-medium overflow-hidden relative px-4 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group ml-2">
            <span className="bg-green-400 shadow-green-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
            <span className="relative">Edit</span>
          </button>
        </>
      )}
      <button onClick={handleGenerateNewLink} className="bg-sky-900 text-white bg-sky-400 border border-sky-400 border-b-4 font-medium overflow-hidden relative px-4 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group ml-2">
            <span className="bg-sky-400 shadow-sky-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
            <span className="relative">Generate New Invitation Link</span>
          </button>
      <button onClick={handleDeleteGroup} className="bg-red-900 text-white bg-red-400 border border-red-400 border-b-4 font-medium overflow-hidden relative px-4 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group ml-2">
            <span className="bg-red-400 shadow-red-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
            <span className="relative">Delete Group</span>
          </button>
    </div>
  );
};

export default GroupDetails;
