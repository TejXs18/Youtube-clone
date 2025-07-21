import * as api from "../Api";

// Post new comment
export const postcomment = (commentdata) => async (dispatch) => {
  try {
    const { data } = await api.postcomment(commentdata);
    dispatch({ type: "POST_COMMENT", payload: data });
    dispatch(getallcomment());
  } catch (error) {
    console.log(error);
  }
};

// Edit a comment
export const editcomment = (commentdata) => async (dispatch) => {
  try {
    const { id, commentbody } = commentdata;
    const { data } = await api.editcomment(id, commentbody);
    dispatch({ type: "EDIT_COMMENT", payload: data });
    dispatch(getallcomment());
  } catch (error) {
    console.log(error);
  }
};

// Get all comments
export const getallcomment = () => async (dispatch) => {
  try {
    const { data } = await api.getallcomment();
    dispatch({ type: "FETCH_ALL_COMMENTS", payload: data });
  } catch (error) {
    console.log(error);
  }
};

// Delete a comment
export const deletecomment = (id) => async (dispatch) => {
  try {
    await api.deletecomment(id);
    dispatch(getallcomment());
  } catch (error) {
    console.log(error);
  }
};

// Like a comment
export const likecomment = (id, userId) => async (dispatch) => {
  try {
    await api.likecomment(id, userId);
    dispatch(getallcomment());
  } catch (error) {
    console.log(error);
  }
};

// Dislike a comment (auto-delete if 2+ dislikes)
export const dislikecomment = (id, userId) => async (dispatch) => {

// Real-time update from socket
export const updateCommentLike = (updatedComment) => ({
  type: 'UPDATE_COMMENT_LIKE',
  payload: updatedComment,
});

// Real-time removal from socket
export const removeComment = (commentId) => ({
  type: 'REMOVE_COMMENT',
  payload: commentId,
});

  try {
    const { data } = await api.dislikecomment(id, userId);
    dispatch(getallcomment());

    if (data?.deleted) {
      console.log("Comment auto-deleted after 2 dislikes");
    }
  } catch (error) {
    console.log(error);
  }
};
