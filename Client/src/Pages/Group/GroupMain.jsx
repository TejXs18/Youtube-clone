import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import GroupList from '../../Components/Groups/GroupList';
import { getAllGroups, searchGroups } from '../../action/group';

const GroupMain = () => {
  const dispatch = useDispatch();
  const groups = useSelector((state) => state.groupReducer);
  const [filteredGroups, setFilteredGroups] = useState([]);

  useEffect(() => {
    dispatch(getAllGroups());
  }, [dispatch]);

  const handleSearch = (query) => {
    if (!query.trim()) {
      setFilteredGroups(groups);
    } else {
      const matches = groups.filter((g) =>
        g.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredGroups(matches);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <GroupList groups={filteredGroups.length ? filteredGroups : groups} onSearch={handleSearch} />
    </div>
  );
};

export default GroupMain;
