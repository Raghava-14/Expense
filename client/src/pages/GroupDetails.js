import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const GroupDetails = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [groupDetails, setGroupDetails] = useState(null);
  const [members, setMembers] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editableDetails, setEditableDetails] = useState({
    name: '',
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
  const handleCancelEdit = () => {
    // Reset editable details to current group details and exit edit mode
    setEditableDetails({
      name: groupDetails.name,
      group_type: groupDetails.group_type,
      info: groupDetails.info
    });
    setEditMode(false);
  };

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
        navigate('/dashboard/groups');
      } catch (error) {
        console.error("Error deleting group:", error);
      }
    }
  };


  const handleExitGroup = async () => {
    const confirmExit = window.confirm("Are you sure you want to exit the group?");

    if (confirmExit) {
      try {
        await axios.post(`http://localhost:3000/api/groups/${groupId}/exit`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        // Optionally, redirect the user after exiting
        navigate('/dashboard/groups'); // Adjust according to your routing
      } catch (error) {
        console.error("Error exiting group:", error);
      }
    }
  };


  if (!groupDetails) return <div>Loading...</div>;

  return (
    <div>
      {editMode ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
          <label>Group Name:</label>
          <input type="text" name="name" value={editableDetails.name} onChange={handleChange} />

          <label>Information:</label>
          <textarea name="info" value={editableDetails.info} onChange={handleChange} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button type="submit" onClick={handleSubmit} class="cursor-pointer transition-all bg-green-500 text-white px-6 py-2 rounded-lg border-green-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px] px-10">Save Changes</button>
            <button onClick={handleCancelEdit} class="cursor-pointer transition-all bg-red-500 text-white px-6 py-2 rounded-lg border-red-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px] px-10">Cancel</button>
          </div>
        </div>
      ) : (
        <>
          {/* Display group details */}
          <p>Group Name: {groupDetails.name}</p>
          <p>Group Type: {groupDetails.group_type}</p>
          <p>Information: {groupDetails.info}</p>
          <p>Invitation Link: {groupDetails.invitation_link}</p>
          <p>Members: {members}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start' }}>
            <button onClick={handleEdit} class="cursor-pointer transition-all bg-green-500 text-white px-6 py-2 rounded-lg border-green-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px] px-10">Edit</button>
            <button onClick={handleGenerateNewLink} class="cursor-pointer transition-all bg-blue-500 text-white px-6 py-2 rounded-lg border-blue-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]px-10 py-3">Generate New Invitation Link</button>
            <button onClick={handleDeleteGroup} class="cursor-pointer transition-all bg-red-500 text-white px-6 py-2 rounded-lg border-red-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]px-10 py-3">Delete Group</button>
            <button onClick={handleExitGroup} class="cursor-pointer transition-all bg-red-500 text-white px-6 py-2 rounded-lg border-red-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px] px-10 py-2.5">Exit Group</button>
          </div>
        </>
      )}
    </div>
  );
};

export default GroupDetails;

