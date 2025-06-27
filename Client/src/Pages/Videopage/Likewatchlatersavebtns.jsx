import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import './Likewatchlatersavebtns.css'
import { BsThreeDots } from 'react-icons/bs'
import { AiFillDislike, AiFillLike, AiOutlineDislike, AiOutlineLike } from 'react-icons/ai'
import { MdPlaylistAddCheck } from 'react-icons/md'
import { RiPlayListAddFill, RiShareForwardLine } from 'react-icons/ri'
import { likevideo } from '../../action/video'
import { addtolikedvideo, deletelikedvideo } from '../../action/likedvideo'
import { addtowatchlater, deletewatchlater } from '../../action/watchlater'

const Likewatchlatersavebtns = ({ vid, vv }) => {
  const dispatch = useDispatch()
  const currentUser = useSelector(state => state.currentuserreducer)
  const userId = currentUser?.result?._id

  const likedvideolist = useSelector((state) => state.likevideoreducer)
  const watchlaterlist = useSelector((state) => state.watchlaterreducer)

  const [likebtn, setLikebtn] = useState(false)
  const [dislikebtn, setDislikebtn] = useState(false)
  const [savevideo, setSavevideo] = useState(false)
  const [likeCount, setLikeCount] = useState(vv?.Like || 0)

  useEffect(() => {
    if (likedvideolist && watchlaterlist && userId) {
      const liked = likedvideolist?.data?.some(q => q.videoid === vid && q.viewer === userId)
      const saved = watchlaterlist?.data?.some(q => q.videoid === vid && q.viewer === userId)
      setLikebtn(liked)
      setSavevideo(saved)
    }
  }, [likedvideolist, watchlaterlist, userId, vid])

  useEffect(() => {
    setLikeCount(vv?.Like || 0)
  }, [vv])

  const togglesavedvideo = () => {
    if (currentUser) {
      if (savevideo) {
        setSavevideo(false)
        dispatch(deletewatchlater(vid, userId))
      } else {
        setSavevideo(true)
        dispatch(addtowatchlater({ videoid: vid, viewer: userId }))
      }
    } else {
      alert('please login to save video')
    }
  }

  const togglelikevideo = async () => {
    if (!currentUser) return alert("please login to like video")

    try {
      const action = likebtn ? "unlike" : "like"
      const { data } = await dispatch(likevideo({ id: vid, action }))

      setLikebtn(action === "like")
      setLikeCount(data.Like)

      if (action === "like") {
        dispatch(addtolikedvideo({ videoid: vid, viewer: userId }))
        setDislikebtn(false)
      } else {
        dispatch(deletelikedvideo(vid, userId))
      }
    } catch (error) {
      console.error("Like error:", error)
    }
  }

  const toggledislikevideo = () => {
    if (!currentUser) return alert('please login to dislike video')

    if (dislikebtn) {
      setDislikebtn(false)
    } else {
      setDislikebtn(true)
      if (likebtn) {
        setLikebtn(false)
        setLikeCount(likeCount - 1)
        dispatch(likevideo({ id: vid, Like: likeCount - 1 }))
        dispatch(deletelikedvideo(vid, userId))
      }
    }
  }

  return (
    <div className="btns_cont_videoPage">
      <div className="btn_VideoPage">
        <BsThreeDots />
      </div>
      <div className="btn_VideoPage">
        <div className="like_videoPage" onClick={togglelikevideo}>
          {likebtn ? (
            <AiFillLike size={22} className='btns_videoPage' />
          ) : (
            <AiOutlineLike size={22} className='btns_videoPage' />
          )}
          <b>{likeCount} LIKE</b>
        </div>
        <div className="like_videoPage" onClick={toggledislikevideo}>
          {dislikebtn ? (
            <AiFillDislike size={22} className='btns_videoPage' />
          ) : (
            <AiOutlineDislike size={22} className='btns_videoPage' />
          )}
          <b>DISLIKE</b>
        </div>
        <div className="like_videoPage" onClick={togglesavedvideo}>
          {savevideo ? (
            <>
              <MdPlaylistAddCheck size={22} className='btns_videoPage' />
              <b>Saved</b>
            </>
          ) : (
            <>
              <RiPlayListAddFill size={22} className='btns_videoPage' />
              <b>Saved</b>
            </>
          )}
        </div>
        <div className="like_videoPage">
          <RiShareForwardLine size={22} className='btns_videoPage' />
        </div>
      </div>
    </div>
  )
}

export default Likewatchlatersavebtns
