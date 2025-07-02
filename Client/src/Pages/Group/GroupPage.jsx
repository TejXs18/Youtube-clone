import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllGroups } from '../../action/group';
import GroupList from '../../Components/Groups/GroupList';

const GroupPage = () => {
  const dispatch = useDispatch();
  const groups = useSelector(state => state.groupReducer.groups);

  useEffect(() => {
    dispatch(getAllGroups());
  }, [dispatch]);

  return (
    <div className="group-page-container">
      <h2>Explore Groups</h2>
      <GroupList groups={groups} />
    </div>
  );
};

export default GroupPage;
