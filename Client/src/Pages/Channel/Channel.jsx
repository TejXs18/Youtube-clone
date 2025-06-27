import React from 'react'
import DescribeChannel from './DescribeChannel.jsx'
import LeftSidebar from '../../Components/LeftSidebar/LeftSidebar.jsx'
import Showvideogrid from '../../Components/Showvideogrid/Showvideogrid.jsx'
import vid from '../../Components/Video/vid.mp4'
import { useParams } from 'react-router'
import { useSelector } from 'react-redux'

        
const Channel = ({setVideoUploadPage,setEditCreateChannelbtn}) => {
  const {cid} =useParams()
  const vids=useSelector(state=>state.videoreducer)?.data?.filter(q=>q?.videochanel===cid).reverse()
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

  return (
        <div className="container_Pages_App">
            <LeftSidebar/>
            <div className="container2_Pages_App">
                <DescribeChannel cid={cid} setVideoUploadPage={setVideoUploadPage} setEditCreateChannelbtn={setEditCreateChannelbtn} />
                <Showvideogrid vids={vids}/>
            </div>
        </div>
)
}

export default Channel