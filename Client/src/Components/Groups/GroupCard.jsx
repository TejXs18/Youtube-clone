import React from 'react';
import { useNavigate } from 'react-router-dom';

const GroupCard = ({ group }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/group/${group._id}`);
  };

  return (
    <div className="group-card" onClick={handleClick} style={{ cursor: 'pointer' }}>
      <h3>{group.name}</h3>
      <p className="group-members">
        Members: {group.members?.length > 0 ? group.members.map(member => member.name || member.email || member).join(', ') : 'No members yet'}
      </p>
      <p className="click-hint" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', marginTop: '0.5rem' }}>
        Click to view details
      </p>
    </div>
  );
};

export default GroupCard;
