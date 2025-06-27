import React, { useState } from 'react'
import './Comment.css'
import moment from 'moment'
import { useSelector, useDispatch } from 'react-redux'
import { editcomment, deletecomment } from '../../action/comment'

const Displaycomments = ({ cid, commentbody, userid, commenton, usercommented }) => {
  const [edit, setEdit] = useState(false)
  const [editedCommentBody, setEditedCommentBody] = useState('')
  const [commentid, setCommentId] = useState('')
  const dispatch = useDispatch()
  const currentUser = useSelector(state => state.currentuserreducer)

  const handleEdit = (ctid, ctbdy) => {
    setEdit(true)
    setCommentId(ctid)
    setEditedCommentBody(ctbdy)
  }

  const handleonsubmit = (e) => {
  e.preventDefault();
  if (!editedCommentBody.trim()) {
    alert("Type your comment");
    return;
  }
  dispatch(editcomment({ id: commentid, commentbody: editedCommentBody }));
  setEditedCommentBody("");
  setEdit(false);
}

  const handleDel = (id) => {
    dispatch(deletecomment(id))
  }

  return (
    <>
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
  <p className="comment_body">{commentbody}</p>
)}

      <p className="usercommented">
        {" "} {usercommented} commented {moment(commenton).fromNow()}
      </p>
      {currentUser?.result._id === userid && (
        <p className="EditDel_DisplayComment">
          <i onClick={() => handleEdit(cid, commentbody)}>Edit</i>
          <i onClick={() => handleDel(cid)}>Delete</i>
        </p>
      )}
    </>
  )
}

export default Displaycomments
