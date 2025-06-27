import React from 'react'
import './Showvideogrid.css'
import Showvideo from '../Showvideo/Showvideo'

const Showvideogrid=({vid})=> {
  return (
<div className="Container_ShowVideoGrid">
    {
        vid?.reverse().map((vi)=>{
            return(
                <div className="video_box app" key={vi._id}>
                    <Showvideo vid={vi}/>
                </div>
            )
        })
    }
</div>  )
}

export default Showvideogrid