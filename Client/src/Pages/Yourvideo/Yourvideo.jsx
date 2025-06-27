import React from 'react'
import vid from '../../Components/Video/vid.mp4'
import './Yourvideo.css'
import Showvideogrid from '../../Components/Showvideogrid/Showvideogrid'
import LeftSidebar from '../../Components/LeftSidebar/LeftSidebar'
import {useSelector} from 'react-redux'



const Yourvideo = () => {
    // const currentUser=1
    const currentUser = useSelector(state => state.currentuserreducer);
    const yourvideolist=useSelector(s=>s.videoreducer)?.data?.filter(q=>q.videochanel===currentUser?.result._id).reverse()
    // const yourvideolist=[
    //           {
    //             _id:1,
    //             video_src:vid,
    //             channel:'Dummy Channel',
    //             title:'video 1',
    //             uploader:'abc',
    //             description:'description of video 1'
    //           },
    //           {
    //             _id:2,
    //             video_src:vid,
    //             channel:'Dummy Channel',
    //             title:'video 2',
    //             uploader:'abc',
    //             description:'description of video 1'
    //           },
    //           {
    //             _id:3,
    //             video_src:vid,
    //             channel:'Dummy Channel',
    //             title:'video 3',
    //             uploader:'abc',
    //             description:'description of video 1'
    //           },
    //           {
    //             _id:4,
    //             video_src:vid,
    //             channel:'Dummy Channel',
    //             title:'video 4',
    //             uploader:'abc',
    //             description:'description of video 1'
    //           }
        
    //         ]

  return (
    <div className="container_Pages_App">
        <LeftSidebar/>
        <div className="container2_Pages_App">
            <div className="container_yourvideo">
                <h1>Your Video</h1>
                {
                    currentUser ?(<>
                    <Showvideogrid vid={yourvideolist}/>
                    </>):
                    <>
                        <h3>Please login to see your upload video list</h3>
                    </>
                }
            </div>
        </div>
    </div>
)
}

export default Yourvideo