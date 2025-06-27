import React from 'react'
import vid from '../../Components/Video/vid.mp4'
import  WHL  from '../../Components/WHL/WHL'
import { useSelector } from 'react-redux'

const Likedvideo = () => {
    const likedvideolist=useSelector((state)=>state.likedvideoreducer)

    // const likedvideolist=[
    //   {
    //     _id:1,
    //     video_src:vid,
    //     channel:'Dummy Channel',
    //     title:'video 1',
    //     uploader:'abc',
    //     description:'description of video 1'
    //   },
    //   {
    //     _id:2,
    //     video_src:vid,
    //     channel:'Dummy Channel',
    //     title:'video 2',
    //     uploader:'abc',
    //     description:'description of video 1'
    //   },
    //   {
    //     _id:3,
    //     video_src:vid,
    //     channel:'Dummy Channel',
    //     title:'video 3',
    //     uploader:'abc',
    //     description:'description of video 1'
    //   },
    //   {
    //     _id:4,
    //     video_src:vid,
    //     channel:'Dummy Channel',
    //     title:'video 4',
    //     uploader:'abc',
    //     description:'description of video 1'
    //   }

    // ]


  return (
    <WHL page={'Liked video'} videoList={likedvideolist}/>
  )
}

export default Likedvideo