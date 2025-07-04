import * as api from '../Api/index';

export const getAllGroups = () => async (dispatch) => {
  try {
    const { data } = await api.getAllGroups();
    dispatch({ type: 'GET_ALL_GROUPS', payload: data });
  } catch (error) {
    console.error(error);
  }
};
