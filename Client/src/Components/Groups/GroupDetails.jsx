import React, { useEffect, useState } from 'react';
import './group.css';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addMemberToGroup } from '../../action/group';

const GroupDetails = ({ group }) => {
  const navigate = useNavigate();
  const [addMemberEmail, setAddMemberEmail] = useState('');
  const [inviteMemberEmail, setInviteMemberEmail] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  const dispatch = useDispatch();

  const handleAddMember = async () => {
    if (!addMemberEmail.trim()) {
      alert('Please enter a valid email address.');
      return;
    }

    setIsAddingMember(true);
    try {
      console.log('Adding member:', addMemberEmail, 'to group:', group._id);
      const response = await dispatch(addMemberToGroup({ groupId: group._id, email: addMemberEmail }));
      console.log('Add member response:', response);
      
      if(response?.message) {
        alert(`✅ Success: ${response.message}`);
      } else {
        alert('✅ Member added successfully!');
      }
      setAddMemberEmail('');
    } catch (error) {
      console.error('Error adding member:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to add member';
      alert(`❌ Error: ${errorMsg}`);
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteMemberEmail.trim()) {
      alert('Please enter a valid email address.');
      return;
    }

    setIsInviting(true);
    try {
      console.log('Inviting member:', inviteMemberEmail, 'to group:', group._id);
      // You can create a separate invite API call here
      // For now, using the same endpoint with a flag
      const response = await dispatch(addMemberToGroup({ 
        groupId: group._id, 
        email: inviteMemberEmail, 
        isInvite: true 
      }));
      
      console.log('Invite response:', response);
      if(response?.message) {
        alert(`📧 Invitation sent: ${response.message}`);
      } else {
        alert('📧 Invitation sent successfully!');
      }
      setInviteMemberEmail('');
    } catch (error) {
      console.error('Error sending invite:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to send invite';
      alert(`❌ Error: ${errorMsg}`);
    } finally {
      setIsInviting(false);
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

      {/* Add Member Section */}
      <div className="invite-section" style={{ 
        border: '2px solid #00ff00', 
        borderRadius: '8px', 
        marginBottom: '1.5rem',
        backgroundColor: 'rgb(28, 28, 28)',
        color: 'white'
      }}>
        <h3 style={{ color: '#00ff00', marginBottom: '1rem' }}>👥 Add Existing Member</h3>
        <div className="invite-form">
          <input
            type="email"
            placeholder="Enter registered user's email"
            value={addMemberEmail}
            onChange={(e) => setAddMemberEmail(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddMember()}
            disabled={isAddingMember}
            style={{ 
              flex: 1, 
              marginRight: '0.5rem',
              backgroundColor: 'rgb(46, 46, 46)',
              color: 'white',
              border: '1px solid rgba(128, 128, 128, 0.5)'
            }}
          />
          <button 
            onClick={handleAddMember} 
            disabled={!addMemberEmail.trim() || isAddingMember}
            style={{ 
              background: (addMemberEmail.trim() && !isAddingMember) ? '#00ff00' : 'rgba(128, 128, 128, 0.5)',
              minWidth: '120px',
              color: 'white'
            }}
          >
            {isAddingMember ? '⏳ Adding...' : (addMemberEmail.trim() ? '✅ Add Member' : 'Enter Email')}
          </button>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', marginTop: '0.5rem', fontWeight: '500' }}>
          ✅ Directly add users who are already registered in the system
        </p>
      </div>

      {/* Invite Member Section */}
      <div className="invite-section" style={{ 
        border: '2px solid #ff0000', 
        borderRadius: '8px',
        backgroundColor: 'rgb(28, 28, 28)',
        color: 'white'
      }}>
        <h3 style={{ color: '#ff0000', marginBottom: '1rem' }}>📧 Send Invitation</h3>
        <div className="invite-form">
          <input
            type="email"
            placeholder="Enter email to invite"
            value={inviteMemberEmail}
            onChange={(e) => setInviteMemberEmail(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleInviteMember()}
            disabled={isInviting}
            style={{ 
              flex: 1, 
              marginRight: '0.5rem',
              backgroundColor: 'rgb(46, 46, 46)',
              color: 'white',
              border: '1px solid rgba(128, 128, 128, 0.5)'
            }}
          />
          <button 
            onClick={handleInviteMember} 
            disabled={!inviteMemberEmail.trim() || isInviting}
            style={{ 
              background: (inviteMemberEmail.trim() && !isInviting) ? '#ff0000' : 'rgba(128, 128, 128, 0.5)',
              minWidth: '120px',
              color: 'white'
            }}
          >
            {isInviting ? '⏳ Sending...' : (inviteMemberEmail.trim() ? '📧 Send Invite' : 'Enter Email')}
          </button>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', marginTop: '0.5rem', fontWeight: '500' }}>
          📧 Send invitation link to users who may not be registered yet
        </p>
        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.3rem' }}>
          ⚡ Press Enter or click the button to send invitation
        </p>
      </div>
    </div>
  );
};

export default GroupDetails;
