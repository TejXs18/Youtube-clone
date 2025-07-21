import React, { useEffect } from 'react';
import './Videopage.css';
import moment from 'moment';
import Likewatchlatersavebtns from './Likewatchlatersavebtns';
import { useParams, Link } from 'react-router-dom';
// import vid from '../../Components/Video/vid.mp4';
import Comment from '../../Components/Comment/Comment';
import Showvideogrid from '../../Components/Showvideogrid/Showvideogrid';
import { useDispatch, useSelector } from 'react-redux';
import { viewvideo } from '../../action/video';
import { addtohistory } from '../../action/history';

const Videopage = () => {
  const { vidd } = useParams(); 
  const dispatch=useDispatch()            
  // const videoId = parseInt(vidd, 10);     
    const currentUser = useSelector(state => state.currentuserreducer);
  const vids=useSelector((state)=>state.videoreducer)
  // const vids = [
  //   {
  //     _id: 1,
  //     video_src: vid,
  //     channel: 'Dummy Channel',
  //     title: 'Video 1',
  //     uploader: 'Alpha',
  //     description: 'Description of video 1',
  //     views: 1234,
  //     createdat: '2024-06-01',
  //   },
  //   {
  //     _id: 2,
  //     video_src: vid,
  //     channel: 'Dummy Channel',
  //     title: 'Video 2',
  //     uploader: 'Beta',
  //     description: 'Description of video 2',
  //     views: 5678,
  //     createdat: '2024-06-02',
  //   },
  // ];
  if (!Array.isArray(vids?.data)) {
    return <div className="container_videoPage">Loading...</div>;
  }
  const vv = vids.data.find((v) => v._id === vidd);
  const handleviews=()=>{
    dispatch(viewvideo({id:vidd}))
  }
  
  if (!vv) {
    return <div className="container_videoPage">Video not found.</div>;
  }
  const handlehistory=()=>{
    dispatch(addtohistory({
      videoid:vidd,
      viewer:currentUser?.result._id,
    }))
  }
  useEffect(()=>{
    if(currentUser){
      handlehistory()
    }
    handleviews()
  },[])
  return (
    <div className="container_videoPage">
      <div className="container2_videoPage" style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
        {/* Left: Main video, details, comments */}
        <div style={{ flex: 2, minWidth: 0 }}>
          <div className="video_display_screen_videoPage">
            <video
              src={`https://youtube-clone-pd9i.onrender.com/${vv?.filepath}`}
              className="video_ShowVideo_videoPage"
              controls
            ></video>

            <div className="video_details_videoPage">
              <div className="video_btns_title_VideoPage_cont">
                <p className="video_title_VideoPage">{vv.title}</p>
                <div className="views_date_btns_VideoPage">
                  <div className="views_videoPage">
                    {vv?.views} views <div className="dot"></div>{' '}
                    {moment(vv?.createdat).fromNow()}
                  </div>
                  <Likewatchlatersavebtns vv={vv} vid={vidd} />
                </div>
              </div>

              <Link to="/" className="chanel_details_videoPage">
                <b className="chanel_logo_videoPage">
                  <p>{vv.uploader?.charAt(0).toUpperCase()}</p>
                </b>
                <p className="chanel_name_videoPage">{vv.uploader}</p>
              </Link>

              <div className="comments_VideoPage">
                <h2>
                  <u>Comments</u>
                </h2>
                <Comment videoId={vv._id}/>
              </div>
            </div>
          </div>
        </div>
        {/* Right: More Videos */}
        <div style={{ flex: 1, minWidth: '320px', marginLeft: '2.5rem' }}>
          <div className="moreVideoBar" style={{ marginBottom: '1rem' }}>More Videos</div>
          {vids?.data && (
            <Showvideogrid vid={vids.data.filter((v) => v._id !== vidd)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Videopage;
