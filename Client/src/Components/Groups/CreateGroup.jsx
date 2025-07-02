import React, { useState } from 'react';
import './group.css';

const CreateGroup = ({ onCreate }) => {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    onCreate({ name: groupName, description });
    setGroupName('');
    setDescription('');
  };

  return (
    <form className="create-group-form" onSubmit={handleSubmit}>
      <h2>Create Group</h2>
      <input
        type="text"
        placeholder="Group Name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />
      <textarea
        placeholder="Group Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button type="submit">Create</button>
    </form>
  );
};

export default CreateGroup;
