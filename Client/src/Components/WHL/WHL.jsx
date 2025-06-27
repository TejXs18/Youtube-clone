import React from 'react'
import './WHL.css'
import WHLvideolist from './WHLvideolist.jsx'
import LeftSidebar from '../LeftSidebar/LeftSidebar.jsx'
import {useDispatch, useSelector} from 'react-redux'
import { clearhistory } from '../../action/history.js'


const WHL = ({page,videoList}) => {
    const dispatch=useDispatch()
    const currentUser = useSelector(state => state.currentuserreducer);
    const handleclearhistory=()=>{
        if(currentUser){
            dispatch(clearhistory({userid:currentUser?.result._id}))
        }
    }
//     const currentUser={
//     result:{
//       _id:1,
//       name:'abc',
//       email:'abcd@gmail.com',
//       joinedon:'11-07-2022'
//     }
//   }
  return (
    <div className="container_Pages_App">
        <LeftSidebar/>
        <div className="container2_Pages_App">
            <div className="container_whl">
                <div className="box_WHL leftside_whl">
                    <b>Your {page} Shown Here</b>
                    {
                        page==='History' && 
                        <div className="clear_History_btn" onClick={()=>{
                            handleclearhistory()
                        }}>
                            Clear History
                        </div>
                    }
                </div>
                <div className="rightSide_whl">
                    <h1>{page}</h1>
                    <div className="whl_list">
                        <WHLvideolist page={page} currentUser={currentUser?.result._id} videoList={videoList}/>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default WHL

