import React, { useEffect, useState } from 'react';
import './group.css';

const GroupDetails = ({ group }) => {
  const [newMemberEmail, setNewMemberEmail] = useState('');

  const handleAddMember = () => {
    if (newMemberEmail.trim()) {
      // send to backend (handled later)
      console.log("Invite sent to:", newMemberEmail);
      setNewMemberEmail('');
    }
  };

  return (
    <div className="group-details">
      <h2>{group.name}</h2>
      <p>{group.description}</p>

      <h4>Members</h4>
      <ul>
        {group.members.map((member) => (
          <li key={member._id}>{member.name}</li>
        ))}
      </ul>

      <div className="invite-section">
        <input
          type="email"
          placeholder="Invite by email"
          value={newMemberEmail}
          onChange={(e) => setNewMemberEmail(e.target.value)}
        />
        <button onClick={handleAddMember}>Invite</button>
      </div>
    </div>
  );
};

export default GroupDetails;
