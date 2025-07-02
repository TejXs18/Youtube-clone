import React, { useEffect, useState } from 'react';
import './group.css';
import GroupCard from './GroupCard';

const GroupList = ({ groups, onSearch }) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // Debounce the search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400); // debounce delay

    return () => clearTimeout(handler); // cleanup
  }, [search]);

  // Trigger search when debounced value changes
  useEffect(() => {
    onSearch(debouncedSearch);
  }, [debouncedSearch, onSearch]);

  return (
    <div className="group-list-container">
      <h2 className="group-list-title">Explore Groups</h2>

      <input
        type="text"
        className="group-search-input"
        placeholder="Search groups..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="group-cards-wrapper">
        {groups?.length > 0 ? (
          groups.map((group) => (
            <GroupCard key={group._id} group={group} />
          ))
        ) : (
          <p className="no-groups-message">No groups found.</p>
        )}
      </div>
    </div>
  );
};

export default GroupList;
