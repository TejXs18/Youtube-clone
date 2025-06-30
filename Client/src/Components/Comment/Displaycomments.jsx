import React, { useState } from 'react';
import './Comment.css';
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux';
import { editcomment, deletecomment } from '../../action/comment';
import axios from 'axios'; 

const Displaycomments = ({
  cid,
  commentbody,
  userid,
  commenton,
  usercommented,
  commentcity,
  likes = [],
  dislikes = []
}) => {
  const [edit, setEdit] = useState(false);
  const [editedCommentBody, setEditedCommentBody] = useState('');
  const [commentid, setCommentId] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.currentuserreducer);

  const userId = currentUser?.result?._id;
  const hasLiked = likes.includes(userId);
  const hasDisliked = dislikes.includes(userId);

  const handleEdit = (ctid, ctbdy) => {
    setEdit(true);
    setCommentId(ctid);
    setEditedCommentBody(ctbdy);
  };

  const handleonsubmit = (e) => {
    e.preventDefault();
    if (!editedCommentBody.trim()) {
      alert("Type your comment");
      return;
    }
    dispatch(editcomment({ id: commentid, commentbody: editedCommentBody }));
    setEditedCommentBody('');
    setEdit(false);
  };

  const handleDel = () => {
    dispatch(deletecomment(cid));
  };

  const handleLike = () => {
    dispatch({ type: 'LIKE_COMMENT', payload: { commentId: cid, userId } });
  };

  const handleDislike = () => {
    dispatch({ type: 'DISLIKE_COMMENT', payload: { commentId: cid, userId } });
    if (dislikes.length + (hasDisliked ? 0 : 1) >= 2) {
      dispatch(deletecomment(cid));
    }
  };

  const handleTranslate = async () => {
    try {
      const res = await axios.post('https://youtube-clone-pd9i.onrender.com/comment/translate', {
        q: commentbody,
        target: 'en'
      });

      setTranslatedText(res.data.translatedText);
    } catch (error) {
      console.error('Translation error:', error);
      alert('Failed to translate the comment.');
    }
  };

  return (
    <div className="display_comment_box">
      {edit ? (
        <div className="comments_Sub_form_comments">
          <input
            type="text"
            onChange={(e) => setEditedCommentBody(e.target.value)}
            placeholder="Edit comment..."
            value={editedCommentBody}
            className="comment_ibox"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleonsubmit(e);
              }
            }}
          />
          <button onClick={handleonsubmit} className="comment_add_btn_comments">
            Change
          </button>
        </div>
      ) : (
        <>
          <p className="comment_body">{commentbody}</p>
          {translatedText && (
            <p className="translated_comment"><strong>Translated:</strong> {translatedText}</p>
          )}
        </>
      )}

      <p className="usercommented">
        {usercommented} ({commentcity || 'Unknown'}) commented {moment(commenton).fromNow()}
      </p>

      <div className="comment_actions">
        <button onClick={handleLike} disabled={hasLiked}>👍 {likes.length}</button>
        <button onClick={handleDislike} disabled={hasDisliked}>👎 {dislikes.length}</button>
        <button onClick={handleTranslate}>🌐 Translate</button>
        {currentUser?.result._id === userid && (
          <span className="EditDel_DisplayComment">
            <i onClick={() => handleEdit(cid, commentbody)}>Edit</i>
            <i onClick={handleDel}>Delete</i>
          </span>
        )}
      </div>
    </div>
  );
};

export default Displaycomments;
