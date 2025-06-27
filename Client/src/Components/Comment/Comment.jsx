import React, { useState } from 'react'
import './Comment.css'
import Displaycomments from './Displaycomments'
import {useSelector} from 'react-redux'
import { useDispatch } from 'react-redux'
import { postcomment } from '../../action/comment'

const Comment = ({ videoId }) => {
  const [commentText, setCommentText] = useState("")
  const dispatch=useDispatch()
const currentUser = useSelector(state => state.currentuserreducer);
  const commentList=useSelector(state=>state.commentreducer)
  // const commentList = [
  //   {
  //     _id: 1,
  //     commentbody: 'hello 1',
  //     commenton: new Date(),
  //     usercommented: 'abc 1',
  //     videoid: 1,
  //   },
  //   {
  //     _id: 2,
  //     commentbody: 'hello 2',
  //     commenton: new Date(),
  //     usercommented: 'abc 2',
  //     videoid: 2,
  //   },
  // ]

  const handleOnSubmit = (e) => {
    e.preventDefault()
    if (currentUser) {
      if (!commentText.trim()) {
        alert('Please type your comment!')
      } else {
        dispatch((postcomment({
          videoid: videoId,
         userid: currentUser?.result._id,
          commentbody: commentText,
          usercommented: currentUser.result.name
        })))
        console.log("Comment submitted:", commentText)
        setCommentText("") // clear input after submission
      }
    }
  }

  return (
    <>
      <form className='comments_sub_form_comments' onSubmit={handleOnSubmit}>
        <input
          type="text"
          onChange={(e) => setCommentText(e.target.value)}
          placeholder='Add comment ...'
          className='comment_ibox'
          value={commentText}
        />
        <input type="submit" value='Add' className='comment_add_btn_comments' />
        <div className="display_comment_container">
          {commentList?.data.filter((q) => q.videoid === videoId)
            .reverse()
            .map((m) => (
              <Displaycomments
                key={m._id}
                cid={m._id}
                userid={m.userid}
                commentbody={m.commentbody}
                commenton={m.commenton}
                usercommented={m.usercommented}
              />
            ))}
        </div>
      </form>
    </>
  )
}

export default Comment
