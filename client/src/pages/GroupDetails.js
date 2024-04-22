import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './GroupDetails.css';

const GroupDetails = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [groupDetails, setGroupDetails] = useState(null);
  const [members, setMembers] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editableDetails, setEditableDetails] = useState({
    name: '',
    groupType: '',
    info: ''
  });
  const [errors, setErrors] = useState({});

  const fetchGroupDetails = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/groups/${groupId}/details`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setGroupDetails(response.data);
      setEditableDetails({
        name: response.data.name,
        groupType: response.data.group_type,
        info: response.data.info,
      });
    } catch (error) {
      console.error("Error fetching group details:", error);
    }
  }, [groupId]);

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

  const validateFields = () => {
    let formErrors = {};
    let isValid = true;
    if (!editableDetails.name.trim()) {
      formErrors.name = 'Group name is required';
      isValid = false;
    }
    if (!editableDetails.groupType.trim()) {
      formErrors.groupType = 'Group type is required';
      isValid = false;
    }
    if (!editableDetails.info.trim()) {
      formErrors.info = 'Information is required';
      isValid = false;
    }
    setErrors(formErrors);
    return isValid;
  };

  const handleChange = (e) => setEditableDetails({ ...editableDetails, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateFields()) {
      try {
        await axios.put(`http://localhost:3000/api/groups/${groupId}`, {
          name: editableDetails.name,
          groupType: editableDetails.groupType,
          info: editableDetails.info
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setShowEditModal(false);
        fetchGroupDetails();
      } catch (error) {
        console.error("Error updating group details:", error);
      }
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
      <h1 className="title">Group Details</h1>
      {showEditModal ? (
        <div className="modalBackground">
        <div className="modalContainer">
          <form onSubmit={handleSubmit} className="form">
            <label className="label">Group Name:</label>
            <input type="text" name="name" value={editableDetails.name} onChange={handleChange} className="input" />
            {errors.name && <div className="error">{errors.name}</div>}
      
            <label className="label">Group Type:</label>
            <select name="groupType" value={editableDetails.groupType} onChange={handleChange} className="select">
              <option value="">Select Type</option>
              <option value="Family">Family</option>
              <option value="Friends">Friends</option>
              <option value="Trip">Trip</option>
              <option value="Vacation">Vacation</option>
              <option value="Couple">Couple</option>
              <option value="Home">Home</option>
              <option value="Other">Other</option>
            </select>
            {errors.groupType && <div className="error">{errors.groupType}</div>}
      
            <label className="label">Information:</label>
            <textarea name="info" value={editableDetails.info} onChange={handleChange} className="textarea" />
            {errors.info && <div className="error">{errors.info}</div>}
      
            <button type="submit" className="button button-save">Save Changes</button>
            <button type="button" onClick={() => setShowEditModal(false)} className="button button-cancel">Cancel</button>
          </form>
        </div>
      </div>
      
      ) : (
        <>
          <p><span className="field-name">Group Name:</span> <span className="field-value">{groupDetails.name}</span></p>
          <p><span className="field-name">Group Type:</span> <span className="field-value">{groupDetails.group_type}</span></p>
          <p><span className="field-name">Information:</span> <span className="field-value">{groupDetails.info}</span></p>
          <p><span className="field-name">Invitation Link:</span> <span className="field-value">{groupDetails.invitation_link}</span></p>
          <p><span className="field-name">Members:</span> <span className="field-value">{members}</span></p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setShowEditModal(true)} className="bg-green-500 text-white px-10 py-2 mt-3 rounded-lg">Edit</button>
            <button onClick={handleGenerateNewLink} className="bg-blue-500 text-white px-6 py-2 mt-3 rounded-lg">Generate New Invitation Link</button>
            <button onClick={handleDeleteGroup} className="bg-red-500 text-white px-6 py-2 mt-3 rounded-lg">Delete Group</button>
            <button onClick={handleExitGroup} className="bg-gray-500 text-white px-6 py-2 mt-3 rounded-lg">Exit Group</button>
          </div>
        </>
      )}
    </div>
  );

};

export default GroupDetails;
