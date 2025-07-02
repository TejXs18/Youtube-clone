import React, { useState } from 'react';
import './Comment.css';
import Displaycomments from './Displaycomments';
import { useSelector, useDispatch } from 'react-redux';
import { postcomment } from '../../action/comment';

const Comment = ({ videoId }) => {
  const [commentText, setCommentText] = useState('');
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.currentuserreducer);
  const commentList = useSelector(state => state.commentreducer);

  const specialCharRegex = /[^a-zA-Z0-9\s\u0900-\u097F.,!?]/;

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!commentText.trim()) {
      alert('Please type your comment!');
      return;
    }

    if (specialCharRegex.test(commentText)) {
      alert('Special characters are not allowed.');
      return;
    }

    try {
      // ✅ Fetch city from IP
      const locRes = await fetch('https://ipapi.co/json/');
      const locData = await locRes.json();
      const city = locData.city || 'Unknown';

      dispatch(postcomment({
        videoid: videoId,
        userid: currentUser.result._id,
        commentbody: commentText,
        usercommented: currentUser.result.name,
        commentcity: city
      }));

      console.log('Comment submitted:', commentText, 'City:', city);
      setCommentText('');
    } catch (error) {
      console.error('City fetch failed:', error);
      alert('Could not fetch your city.');
    }
  };

  return (
    <>
      <form className='comments_sub_form_comments' onSubmit={handleOnSubmit}>
        <input
          type='text'
          onChange={(e) => setCommentText(e.target.value)}
          placeholder='Add comment ...'
          className='comment_ibox'
          value={commentText}
        />
        <input type='submit' value='Add' className='comment_add_btn_comments' />
        <div className='display_comment_container'>
          {commentList?.data
            .filter((q) => q.videoid === videoId)
            .reverse()
            .map((m) => (
              <Displaycomments
                key={m._id}
                cid={m._id}
                userid={m.userid}
                commentbody={m.commentbody}
                commenton={m.commenton}
                usercommented={m.usercommented}
                commentcity={m.commentcity}
                likes={m.likes}
                dislikes={m.dislikes}
              />
            ))}
        </div>
      </form>
    </>
  );
};

export default Comment;
