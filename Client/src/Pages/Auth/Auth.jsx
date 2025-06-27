import React from 'react'
import { BiLogOut } from 'react-icons/bi'
import { googleLogout } from '@react-oauth/google';
import { Link } from 'react-router-dom'
import {useDispatch} from "react-redux"
import { setcurrentuser } from '../../action/currentuser';
import './Auth.css'


const Auth=({user,setAuthBtn,setEditCreateChanelbtn}) => {
    const dispatch=useDispatch()
    const logout=()=>{
        dispatch(setcurrentuser(null))
        localStorage.clear()
        googleLogout()
    }


  return (
    <div className="Auth_container" onClick={()=>setAuthBtn(false)}> 
            <div className="Auth_container2" >
            <div className="User_Details">
            <div className="Channel_logo_App"></div>
                <p className="fstChar_logo_App">
                    {user?.result?.name
                  ? user?.result.name.charAt(0).toUpperCase()
                  : user?.result.email.charAt(0).toUpperCase()}
                </p>
                <div className="email_auth">{user?.result.email}</div>
            
            </div>

            <div className="btns_Auth">
                    {user?.result.name ?(
                        <>
                        {
                            <Link to={`/channel/${user?.result?._id}`} className='btn_Auth'>Your Channel</Link>
                        }
                        </>
                    ):(
                        <>
                            <input type="submit" className='btn_Auth' 
                            value="Create Your Own Channel" 
                            onClick={()=>setEditCreateChanelbtn(true)}/>
                        </>
                    )}
                    <div>
                        <div className="btn_Auth" onClick={()=>logout()}>
                            <BiLogOut/>
                            Log Out
                        </div>
                </div>
            </div>
        </div>
    
    </div>

)
}

export default Auth