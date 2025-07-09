import React from 'react'
import './Showvideo.css'
import { Link } from 'react-router-dom';
import moment from 'moment';

function Showvideo({ vid }) {
  if (!vid?.filepath) return <div className="video_unavailable">Video unavailable</div>;
  return (
    <>
      <Link to={`/videopage/${vid._id}`}>
        <video src={`https://youtube-clone-pd9i.onrender.com/${vid?.filepath}`} className='video_ShowVideo' onError={e => { e.target.style.display = 'none'; alert('Video failed to load!'); }} />
      </Link>
      <div className="video_description">
        <div className="Channel_logo_App">
          <div className="fstChar_logo_App">
            <>{vid?.uploader?.charAt(0).toUpperCase()}</>
          </div>
        </div>
        <div className="video_details">
          <p className="title_vid_Show_Video">{vid?.videotitle}</p>
          <pre className="vid_views_UploadTime">{vid?.uploader}</pre>
          <pre className="vid_views_UploadTime">
            {vid?.views} views <div className="dot"></div> {moment(vid.createdat).fromNow()}
          </pre>
        </div>
      </div>
    </>
  )
}

export default Showvideo
