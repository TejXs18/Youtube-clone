import React from 'react'
import LeftSidebar from '../../Components/LeftSidebar/LeftSidebar'
import { FaHistory } from 'react-icons/fa'
import { MdOutlineWatchLater } from 'react-icons/md'
import { AiOutlineLike } from 'react-icons/ai'
import vid from '../../Components/Video/vid.mp4'
import  WHLvideolist  from '../../Components/WHL/WHLvideolist.jsx'
import './Library.css' 
import {useSelector} from 'react-redux'


 const Library = () => {
    // const vids=[
    //       {
    //         _id:1,
    //         video_src:vid,
    //         channel:'Dummy Channel',
    //         title:'video 1',
    //         uploader:'abc',
    //         description:'description of video 1'
    //       },
    //       {
    //         _id:2,
    //         video_src:vid,
    //         channel:'Dummy Channel',
    //         title:'video 2',
    //         uploader:'abc',
    //         description:'description of video 1'
    //       },
    //       {
    //         _id:3,
    //         video_src:vid,
    //         channel:'Dummy Channel',
    //         title:'video 3',
    //         uploader:'abc',
    //         description:'description of video 1'
    //       },
    //       {
    //         _id:4,
    //         video_src:vid,
    //         channel:'Dummy Channel',
    //         title:'video 4',
    //         uploader:'abc',
    //         description:'description of video 1'
    //       }
    
    //     ]

//         const currentUser={
//     result:{
//       _id:1,
//       name:'abc',
//       email:'abcd@gmail.com',
//       joinedon:'11-07-2022'
//     }
//   }
    const currentUser = useSelector(state => state.currentuserreducer);
    const watchlatervideolist=useSelector(state=>state.watchlaterreducer)
    const likedvideolist=useSelector(state=>state.likedvideoreducer)
    const watchhistorvideolist=useSelector(state=>state.watchhistoryreducer)

  return (
<div className="container_Pages_App">
    <LeftSidebar/>
    <div className="container2_Pages_App">
        <div className="container_libraryPage">
            <h1 className="title_container_LibraryPage">
                <b>
                    <FaHistory/>
                </b>
                <b>History</b>
            </h1>
            <div className="container_videoList_LibraryPage">
                <WHLvideolist page={'History'} currentUser={currentUser?.result?._id} videoList={watchhistorvideolist} />
            </div>
        </div>
        <div className="container_libraryPage">
            <h1 className="title_container_LibraryPage">
                <b>
                    <MdOutlineWatchLater/>
                </b>
                <b>Watch Later</b>
            </h1>
            <div className="container_videoList_LibraryPage">
                <WHLvideolist page={'Watch Later'} currentUser={currentUser?.result?._id} videoList={watchlatervideolist} />
            </div>
        </div>
        <div className="container_libraryPage">
            <h1 className="title_container_LibraryPage">
                <b>
                    <AiOutlineLike/>
                </b>
                <b>Liked Videos</b>
            </h1>
            <div className="container_videoList_LibraryPage">
                <WHLvideolist page={'Liked Videos'} currentUser={currentUser?.result?._id} videoList={likedvideolist} />
            </div>
        </div>
    </div>
</div>  


)
}

export default Library;
