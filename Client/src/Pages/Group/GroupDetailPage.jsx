import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import GroupDetails from '../../Components/Groups/GroupDetails';
import '../../Components/Groups/group.css';

const GroupDetailPage = () => {
  const { id } = useParams();
  const groups = useSelector((state) => state.groupreducer.data || []);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (groups.length > 0) {
      const foundGroup = groups.find(g => g._id === id);
      setGroup(foundGroup);
      setLoading(false);
    }
  }, [id, groups]);

  if (loading) {
    return (
      <div className="group-detail-page" style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading group details...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="group-detail-page" style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Group Not Found</h2>
        <p>The group you're looking for doesn't exist or may have been deleted.</p>
      </div>
    );
  }

  return (
    <div className="group-detail-page" style={{ padding: '1rem' }}>
      <GroupDetails group={group} />
    </div>
  );
};

export default GroupDetailPage;
