import React from 'react'
import './LeftSidebar.css'
import shorts from './shorts.png'
import {AiOutlineHome} from "react-icons/ai"
import {MdOutlineExplore, MdOutlineSubscriptions, MdOutlineVideoLibrary, MdOutlineGroup} from "react-icons/md"
import { NavLink } from 'react-router-dom'
function LeftSidebar() {
  return (
         <div className="container_leftSidebar">
        <NavLink to={'/'} className="icon_sidebar_div">
            <AiOutlineHome size={22} className='icon_sidebar'/>
            <div className="text_sidebar_icon">Home</div>
        </NavLink>
        <div className="icon_sidebar_div">
            <MdOutlineExplore size={22} className='icon_sidebar'/>
            <div className="text_sidebar_icon">Explore</div>
        </div>
        <div className="icon_sidebar_div">
            <img src={shorts} width={22} className='icon_sidebar'/>
            <div className="text_sidebar_icon">Shorts</div>
        </div>
        <div className="icon_sidebar_div">
            <MdOutlineSubscriptions size={22} className='icon_sidebar'/>
            <div className="text_sidebar_icon" style={{fontSize:"12px"}}>Subscription</div>
        </div>
        <NavLink to={'/Library'} className="icon_sidebar_div">
            <MdOutlineVideoLibrary size={22} className='icon_sidebar'/>
            <div className="text_sidebar_icon">Library</div>
        </NavLink>
        <NavLink to={'/groups'} className="icon_sidebar_div">
            <MdOutlineGroup size={22} className='icon_sidebar'/>
            <div className="text_sidebar_icon">Groups</div>
        </NavLink>
    </div>

)
}

export default LeftSidebar