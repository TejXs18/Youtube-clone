import React from 'react'
import Leftsidebar from '../../Components/LeftSidebar/LeftSidebar'
import Showvideogrid from '../../Components/Showvideogrid/Showvideogrid'
import vid from '../../Components/Video/vid.mp4'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'

const Search=()=> {
    //  const vids=[
    //       {
    //         _id:1,
    //         vieo_src:vid,
    //         channel:'Dummy Channel',
    //         title:'video 1',
    //         uploader:'abc',
    //         description:'description of video 1'
    //       },
    //       {
    //         _id:2,
    //         vieo_src:vid,
    //         channel:'Dummy Channel',
    //         title:'video 2',
    //         uploader:'abc',
    //         description:'description of video 1'
    //       },
    //       {
    //         _id:3,
    //         vieo_src:vid,
    //         channel:'Dummy Channel',
    //         title:'video 3',
    //         uploader:'abc',
    //         description:'description of video 1'
    //       },
    //       {
    //         _id:4,
    //         vieo_src:vid,
    //         channel:'Dummy Channel',
    //         title:'video 4',
    //         uploader:'abc',
    //         description:'description of video 1'
    //       }
    
    //     ]
    const {searchQuery}=useParams();
      const vids=useSelector(s=>s?.videoreducer)?.data?.filter(q=>q?.videotitle.toUpperCase().includes(searchQuery?.toUpperCase())).map(m=>m?.videotitle)

  return (
        <div className="container_Pages_App">
      <Leftsidebar/>
      <div className="container2_Pages_App">
        
        <Showvideogrid vid={vids}/>
      </div>
    </div>
  )
}

export default Search