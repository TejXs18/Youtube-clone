import React, { useState } from 'react'
import './Createeditchannel.css'
import {useSelector} from 'react-redux'
import {updatechaneldata} from '../../action/channeluser'
import { useDispatch } from 'react-redux'
import { login } from '../../action/auth'
const Createeditchannel=({setEditCreateChannelbtn})=> {
//     const currentUser={
//     result:{
//       email:'abcd@gmail.com',
//       joinedon:'11-07-2022'
//     }
//   }
    const currentUser = useSelector(state => state.currentuserreducer);

    const dispatch=useDispatch()
    const [name,setName]=useState(currentUser?.result.name)
    const[desc,setDesc]=useState(currentUser?.result?.desc)


    const handlesubmit=()=>{
        if(!name){
            alert("Please enter name!!")
        }else if(!desc){
            alert("Please enter description!!")
        }else{
            dispatch(updatechaneldata(currentUser?.result._id,{name:name,desc:desc}))
            setEditCreateChannelbtn(false)
            setTimeout(()=>{
                dispatch({email:currentUser.result.email})

            },5000)
        }
    }
    
  return (
        <div className="container_Createeditchannel">
            <input type="submit" name='text' value={'X'} className='ibtn_x' onClick={()=>setEditCreateChannelbtn(false)}/>
            <div className="container2_CreateEditChannel">
                <h1>{currentUser?.result?.name?<>Edit</>:<>Create</>} Your Channel</h1>
                <input type="text" placeholder='Enter Your/Channel Name' name='text' value={name} onChange={(e)=>setName(e.target.value)} className='ibox'/>
                <textarea type='text' rows={15} placeholder='enter channel description' className='ibox' value={desc} onChange={(e)=>setDesc(e.target.value)}></textarea>
                <input type="submit" value={'submit'} onClick={handlesubmit} className='ibtn' />
                </div>
        </div>
)
}

export default Createeditchannel