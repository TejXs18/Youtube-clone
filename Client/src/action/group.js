// actions/group.js
import * as api from '../Api/index';
import axios from 'axios';

export const getAllGroups = () => async (dispatch) => {
  try {
    const profile = JSON.parse(localStorage.getItem("Profile"));
    const token = profile?.token;

    const BACKEND_URL = 'https://youtube-clone-pd9i.onrender.com';

    const { data } = await axios.get(`${BACKEND_URL}/group/all`, {
      headers: { Authorization: `Bearer ${token}` }
      
    });
    console.log("Token being sent:", token)

    dispatch({ type: 'GET_ALL_GROUPS', payload: data });
  } catch (error) {
    console.error(error);
  }
};






// Create a new group
export const createGroup = (groupData) => async (dispatch) => {
  try {
    const { data } = await api.createGroup(groupData);
    dispatch({ type: 'CREATE_GROUP', payload: data });
  } catch (error) {
    console.error('Error creating group:', error);
  }
};

// Add a member to a group
export const addMember = (memberData) => async (dispatch) => {
  try {
    const { data } = await api.addMember(memberData);
    dispatch({ type: 'ADD_MEMBER', payload: data });
  } catch (error) {
    console.error('Error adding member:', error);
  }
};

// Search groups by name or keyword
export const searchGroups = (query) => async (dispatch) => {
  try {
    const { data } = await api.searchGroups(query);
    dispatch({ type: 'SEARCH_GROUPS', payload: data });
  } catch (error) {
    console.error('Error searching groups:', error);
  }
};

// Fetch full group details by ID
export const fetchGroupById = (groupId) => async (dispatch) => {
  try {
    const { data } = await api.fetchGroupById(groupId);
    dispatch({ type: 'FETCH_GROUP_BY_ID', payload: data });
  } catch (error) {
    console.error('Error fetching group by ID:', error);
  }
};

// Send invite to a user by email
export const inviteToGroup = (groupId, email) => async (dispatch) => {
  try {
    const { data } = await api.inviteToGroup(groupId, email);
    dispatch({ type: 'INVITE_MEMBER', payload: data });
  } catch (error) {
    console.error('Error inviting user to group:', error);
  }
};
