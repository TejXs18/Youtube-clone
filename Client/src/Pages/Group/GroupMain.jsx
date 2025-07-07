import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import GroupList from '../../Components/Groups/GroupList';
import CreateGroup from '../../Components/Groups/CreateGroup';
import { getAllGroups, searchGroups, createGroup } from '../../action/group';
import '../../Components/Groups/Group.css';


const GroupMain = () => {
  const dispatch = useDispatch();
  const groups = useSelector((state) => state.groupreducer.data || []);
  console.log('Groups from Redux state:', groups);
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

  const handleCreateGroup = (groupData) => {
    dispatch(createGroup(groupData));
  };

  return (
    <div className="group-list-container">
      <div className="group-header">
        <h1>Groups</h1>
      </div>
      
      {/* Create Group Section */}
      <div style={{ marginBottom: '2rem' }}>
        <CreateGroup onCreate={handleCreateGroup} />
      </div>
      
      {/* Groups List Section */}
      <div>
        <GroupList 
          groups={filteredGroups.length ? filteredGroups : groups} 
          onSearch={handleSearch} 
        />
      </div>
    </div>
  );
};

export default GroupMain;
