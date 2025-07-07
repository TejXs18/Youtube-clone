import * as api from '../Api/index';

export const getAllGroups = () => async (dispatch) => {
  try {
    const { data } = await api.getAllGroups();
    dispatch({ type: 'GET_ALL_GROUPS', payload: data });
  } catch (error) {
    console.error(error);
  }
};

export const createGroup = (groupData) => async (dispatch) => {
  try {
    const { data } = await api.createGroup(groupData);
    dispatch({ type: 'CREATE_GROUP', payload: data });
    // Refresh the groups list after creation
    dispatch(getAllGroups());
  } catch (error) {
    console.error('Error creating group:', error);
  }
};

export const searchGroups = (query) => async (dispatch) => {
  try {
    const { data } = await api.searchGroups(query);
    dispatch({ type: 'SEARCH_GROUPS', payload: data });
  } catch (error) {
    console.error('Error searching groups:', error);
  }
};

export const addMemberToGroup = (memberData) => async (dispatch) => {
  try {
    const { data } = await api.addMember(memberData);
    dispatch({ type: 'ADD_MEMBER', payload: data.group });
    // Refresh groups after adding member
    dispatch(getAllGroups());
    return data; // Return the response data including the message
  } catch (error) {
    console.error('Error adding member:', error);
    const errorMessage = error.response?.data?.error || 'Failed to add member';
    alert(errorMessage);
    throw error;
  }
};
