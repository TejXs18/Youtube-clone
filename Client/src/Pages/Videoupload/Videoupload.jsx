import React, { useState } from 'react'
import './Videoupload.css'
import {buildStyles,CircularProgressbar} from 'react-circular-progressbar'
import {useSelector,useDispatch} from 'react-redux'
import {uploadvideo} from '../../action/video'

const Videoupload = ({setVideoUploadPage}) => {
const [title,setTitle]=useState('')
const [videofile,setVideofile]=useState('')
const [progress,setProgress]=useState(0)
const dispatch=useDispatch()

// const currentUser={
//     result:{
//       _id:1,
//       name:'abc',
//       email:'abcd@gmail.com',
//       joinedon:'11-07-2022'
//     }
// }
 const currentUser = useSelector(state => state.currentuserreducer);
const fileoption = {
        onUploadProgress: (progressEvent) => {
            const { loaded, total } = progressEvent
            const percentage = Math.floor(((loaded / 1000) * 100) / (total / 1000));
            setProgress(percentage)
            if (percentage === 100) {
                setTimeout(function () { }, 3000);
                setVideoUploadPage(false)
            }
        },
    };

const handleSetVideoFile=(e)=>{
    setVideofile(e.target.files[0])
}
    const uploadVideoFile=()=>{
        if(!title){
            alert('please enter title of video')
        }else if(!videofile){
            alert('plzattach a video file');
        }else if(videofile.size>1000000){
            alert('video file size is too large')
        }else{
            const filedata = new FormData()
            filedata.append("file", videofile)
            filedata.append("title", title)
            filedata.append("chanel", currentUser?.result?._id)
            filedata.append("uploader", currentUser?.result.name)
            // console.log(videofile)
            dispatch(uploadvideo({ filedata: filedata, fileoption: fileoption }))            
        }   
    }

  return (
    <div className="container_VidUpload">
        <input type="submit" name='text' value={'X'} onClick={()=>setVideoUploadPage(false)} className='ibtn_x' />
        <div className="container2_VidUpload">
        <div className="ibox_div_vidupload">
            <input type="text"  maxLength={30} placeholder='enter  title of video' className="ibox_vidupload" onChange={(e)=>{
                setTitle(e.target.value)
            }} />
            <label htmlFor="file" className='ibox_videoupload'>
                <input type="file" name='file' style={{fontSize:'1rem'}} onChange={(e)=>{handleSetVideoFile(e)}  } className='ibox_vidupload' />

            </label>
        </div>
        <div className="ibox_div_vidupload">
            <input type="submit" onClick={()=>uploadVideoFile()} value={'Upload'}  className="ibox_vidupload btn_vidUpload" />
            <div className="loader ibox_div_vidupload">
            <CircularProgressbar
            value={progress}
            text={`${progress}`}
            styles={buildStyles(
                {rotation:0.25,
                strokeLinecap:'butt',
                textSize:'20px',
                pathTransitionDuration:0.5,
                pathColor:`rgba(255,255,255),${progress/100}`,
                textColor:'#f88',
                trailColor: '#adff2f',
                backgroundColor:'#3e98c7'
            })}
            />
                </div>
            </div>
        </div>
    </div>
)
}

export default Videoupload