import React from 'react';

const GroupCard = ({ group }) => {
  return (
    <div className="group-card">
      <h3>{group.name}</h3>
      <p className="group-members">
        Members: {group.members.length > 0 ? group.members.join(', ') : 'No members yet'}
      </p>
    </div>
  );
};

export default GroupCard;
