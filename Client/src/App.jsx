import { useEffect, useState } from 'react'
import Allroutes from './Allroutes'
import './App.css'
import Navbar from './Components/Navbar/Navbar'
import { BrowserRouter } from 'react-router-dom'
import Drawerslidebar from './Components/LeftSidebar/Drawersliderbar'
import Createeditchannel from './Pages/Channel/Createeditchannel'
import Videoupload from './Pages/Videoupload/Videoupload'
import { useDispatch } from 'react-redux'
import { fetchallchannel } from './action/channeluser'
import { getallvideo } from './action/video'
import { getallcomment } from './action/comment'
import { getallhistory } from './action/history'
import { getalllikedvideo } from './action/likedvideo'
import { getallwatchlater } from './action/watchlater'
import { getAllGroups } from './action/group';


function App() {

    const [toggleDrawerSidebar, setToggleDrawerSidebar] = useState({
      display:"none"
    });
    const dispatch = useDispatch();
    useEffect(()=>{
      dispatch(fetchallchannel())
      dispatch(getallvideo())
      dispatch(getallcomment())
      dispatch(getallhistory())
      dispatch(getalllikedvideo())
      dispatch(getallwatchlater())
      dispatch(getAllGroups());
    },[dispatch])

    const toggleDrawer=()=>{
      if(toggleDrawerSidebar.display==='none'){
        setToggleDrawerSidebar({
          display:'flex',
        })
      }else{
        setToggleDrawerSidebar({
          display:'none',
        })
      }

    }
    const [EditCreateChannelbtn, setEditCreateChannelbtn] = useState(false)
    const [videoUploadPage,setVideoUploadPage]=useState(false)
  return (
    <BrowserRouter>
    {
      videoUploadPage&&<Videoupload setVideoUploadPage={setVideoUploadPage}/>
    }
    {EditCreateChannelbtn&&(
      <Createeditchannel setEditCreateChannelbtn={setEditCreateChannelbtn} />
    )}
  <Navbar 
    setEditCreateChannelbtn={setEditCreateChannelbtn} 
    toggleDrawer={toggleDrawer}
  />
  <Drawerslidebar toggledraw={toggleDrawer} toggledrawersidebar={toggleDrawerSidebar} />
  <Allroutes setEditCreateChannelbtn={setEditCreateChannelbtn} setVideoUploadPage={setVideoUploadPage} />
</BrowserRouter>
  )
}

export default App
