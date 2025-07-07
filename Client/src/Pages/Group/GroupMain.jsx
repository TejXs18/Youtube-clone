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
  console.log('Number of groups:', groups.length);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        await dispatch(getAllGroups());
        setError(null);
      } catch (err) {
        setError('Failed to load groups');
        console.error('Error fetching groups:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, [dispatch]);

  // Update loading state when groups change
  useEffect(() => {
    if (groups.length >= 0) {
      setLoading(false);
    }
  }, [groups]);

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

  if (loading) {
    return (
      <div className="group-list-container">
        <div className="loading-state">
          <h2>Loading Groups...</h2>
          <p>Please wait while we fetch your groups.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="group-list-container">
        <div className="empty-state">
          <h3>Error Loading Groups</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="group-list-container">
      <div className="group-header">
        <h1>Groups</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '0.5rem' }}>
          {groups.length === 0 ? 'No groups yet. Create your first group below!' : `Found ${groups.length} group${groups.length !== 1 ? 's' : ''}`}
        </p>
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
