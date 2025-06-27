import React from 'react'
import { FaEdit,FaUpload } from 'react-icons/fa'
import './DescribeChannel.css'
import {useSelector} from 'react-redux'
 const DescribeChannel = ({cid,setVideoUploadPage,setEditCreateChannelbtn}) => {
    // const channel=[
    //     {
    //         _id:1,
    //         name:"channel1",
    //         email:'abcd@gmail.com',
    //         joinedon:'22-07-2020',
    //         desc:'bithead'
    //     }
    // ]
    const channel=useSelector(state=>state.chanelreducer)
    const currenChannel=channel.filter((c)=>c._id=== cid)[0]
//     const currentUser={
//     result:{
//       _id:1,
//       name:'abc',
//       email:'abcd@gmail.com',
//       joinedon:'11-07-2022'
//     }
//   }
    const currentUser = useSelector(state => state.currentuserreducer);
    
  return (
    <div className="container3__chanel">
        <div className="chanel_logo_chanel">
            <b>{currenChannel?.name.charAt(0).toUpperCase()}</b>
        </div>
        <div className="description_chanel">
            <b>{currenChannel?.name}</b>
            <p>{currenChannel?.desc}</p>
        </div>
        {currentUser?.result._id===currenChannel?._id&&(
            <>
            <p className="editbtn_chanel" onClick={()=>setEditCreateChannelbtn(true)}>
                <FaEdit/>
                <b>Edit Channel</b>
            </p>
            <p className="uploadbtn_chanel" onClick={()=>setVideoUploadPage(true)}>
                <FaUpload/>
                <b>Upload Videos</b>
            </p>
            </>
        )}
    </div>
  )
}
export default DescribeChannel
