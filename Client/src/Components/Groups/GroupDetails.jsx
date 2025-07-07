import React, { useEffect, useState } from 'react';
import './group.css';
import { useDispatch } from 'react-redux';
import { addMemberToGroup } from '../../action/group';

const GroupDetails = ({ group }) => {
  const [newMemberEmail, setNewMemberEmail] = useState('');

  const dispatch = useDispatch();

  const handleAddMember = () => {
    if (newMemberEmail.trim()) {
      dispatch(addMemberToGroup({ groupId: group._id, email: newMemberEmail }))
        .then(response => {
          if(response?.message) {
            alert(response.message);
          }
        })
        .catch(error => {
          console.error('Error adding member:', error);
          alert('Failed to add member.');
        });
      setNewMemberEmail('');
    }
  };

  return (
    <div className="group-details">
      <h2>{group.name}</h2>
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

      <div className="invite-section">
        <h3>Invite New Member</h3>
        <div className="invite-form">
          <input
            type="email"
            placeholder="Enter user's email address"
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddMember()}
          />
          <button onClick={handleAddMember} disabled={!newMemberEmail.trim()}>
            Send Invite
          </button>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>
          💡 Enter the email address of a registered user to add them to this group
        </p>
      </div>
    </div>
  );
};

export default GroupDetails;
