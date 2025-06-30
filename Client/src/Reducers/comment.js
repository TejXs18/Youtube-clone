const commentreducer = (state = { data: null }, action) => {
  switch (action.type) {
    case "POST_COMMENT":
    case "EDIT_COMMENT":
      return { ...state };

    case "FETCH_ALL_COMMENTS":
      return { ...state, data: action.payload };

    case "LIKE_COMMENT": {
      const { commentId, userId } = action.payload;
      const updatedData = state.data.map(comment => {
        if (comment._id === commentId) {
          const alreadyLiked = comment.likes?.includes(userId);
          const updatedLikes = alreadyLiked
            ? comment.likes
            : [...(comment.likes || []), userId];

          const updatedDislikes = (comment.dislikes || []).filter(id => id !== userId);

          return { ...comment, likes: updatedLikes, dislikes: updatedDislikes };
        }
        return comment;
      });
      return { ...state, data: updatedData };
    }

    case "DISLIKE_COMMENT": {
      const { commentId, userId } = action.payload;
      let updatedData = state.data.map(comment => {
        if (comment._id === commentId) {
          const alreadyDisliked = comment.dislikes?.includes(userId);
          const updatedDislikes = alreadyDisliked
            ? comment.dislikes
            : [...(comment.dislikes || []), userId];

          const updatedLikes = (comment.likes || []).filter(id => id !== userId);

          return { ...comment, dislikes: updatedDislikes, likes: updatedLikes };
        }
        return comment;
      });

      // Check if any comment has 2 or more dislikes → remove it
      updatedData = updatedData.filter(comment => (comment.dislikes?.length || 0) < 2);

      return { ...state, data: updatedData };
    }

    default:
      return state;
  }
};

export default commentreducer;
