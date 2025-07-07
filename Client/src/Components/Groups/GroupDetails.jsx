import React, { useEffect, useState } from 'react';
import './group.css';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addMemberToGroup } from '../../action/group';

const GroupDetails = ({ group }) => {
  const navigate = useNavigate();
  const [newMemberEmail, setNewMemberEmail] = useState('');

  const dispatch = useDispatch();

  const handleAddMember = () => {
    if (newMemberEmail.trim()) {
      console.log('Adding member:', newMemberEmail, 'to group:', group._id);
      dispatch(addMemberToGroup({ groupId: group._id, email: newMemberEmail }))
        .then(response => {
          console.log('Add member response:', response);
          if(response?.message) {
            alert(`Success: ${response.message}`);
          } else {
            alert('Member added successfully!');
          }
        })
        .catch(error => {
          console.error('Error adding member:', error);
          const errorMsg = error.response?.data?.message || error.message || 'Failed to add member';
          alert(`Error: ${errorMsg}`);
        });
      setNewMemberEmail('');
    } else {
      alert('Please enter a valid email address.');
    }
  };

  return (
    <div className="group-details">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
        <button 
          onClick={() => navigate('/groups')} 
          className="secondary" 
          style={{ marginRight: '1rem' }}
        >
          ← Back to Groups
        </button>
        <h2 style={{ margin: 0 }}>{group.name}</h2>
      </div>
      {group.description && <p>{group.description}</p>}

      <h3>Members ({group.members?.length || 0})</h3>
      {group.members && group.members.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {group.members.map((member) => (
            <li key={member._id} style={{ 
              padding: '0.5rem', 
              marginBottom: '0.5rem', 
              backgroundColor: 'rgb(46, 46, 46)', 
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>{member.name}</span>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>{member.email}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>No members yet</p>
      )}

      <div className="invite-section" style={{ border: '2px solid #ff0000', borderRadius: '8px' }}>
        <h3 style={{ color: '#ff0000', marginBottom: '1rem' }}>✉️ Invite New Member</h3>
        <div className="invite-form">
          <input
            type="email"
            placeholder="Enter user's email address"
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddMember()}
            style={{ flex: 1, marginRight: '0.5rem' }}
          />
          <button 
            onClick={handleAddMember} 
            disabled={!newMemberEmail.trim()}
            style={{ 
              background: newMemberEmail.trim() ? '#ff0000' : 'rgba(128, 128, 128, 0.5)',
              minWidth: '120px'
            }}
          >
            {newMemberEmail.trim() ? '📧 Send Invite' : 'Enter Email'}
          </button>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', marginTop: '0.5rem', fontWeight: '500' }}>
          💡 Enter the email address of a registered user to add them to this group
        </p>
        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.3rem' }}>
          ⚡ Press Enter or click the button to send invitation
        </p>
      </div>
    </div>
  );
};

export default GroupDetails;
