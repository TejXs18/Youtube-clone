// Allroutes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Pages/Home/Home';
import Search from './Pages/Search/Search';
import Videopage from './Pages/Videopage/Videopage.jsx';
import Channel from './Pages/Channel/Channel.jsx';
import  Library  from './Pages/Library/Library.jsx';
import  Likedvideo  from './Pages/Likedvideo/Likedvideo.jsx';
import Watchhistory from './Pages/Watchhistory.jsx/Watchhistory.jsx';
import Watchlater from './Pages/Watchlater/Watchlater.jsx';
import Yourvideo from './Pages/Yourvideo/Yourvideo.jsx';
import GroupMain from './Pages/Group/GroupMain.jsx';
import GroupDetailPage from './Pages/Group/GroupDetailPage.jsx'

function Allroutes({setVideoUploadPage,setEditCreateChannelbtn}) {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/search/:searchQuery" element={<Search />} />
      <Route path="/videopage/:vidd" element={<Videopage />}/>
      <Route path="/Library" element={<Library/>}/>
      <Route path="/Likedvideo" element={<Likedvideo/>}/>
      <Route path="/Watchhistory" element={<Watchhistory/>}/>
      <Route path="/Watchlater" element={<Watchlater/>}/>
      <Route path="/Yourvideo" element={<Yourvideo/>}/>
      <Route path='/channel/:cid' element={<Channel setEditCreateChannelbtn={setEditCreateChannelbtn} setVideoUploadPage={setVideoUploadPage}/>}/>
      <Route path="/groups" element={<GroupMain />} />
      <Route path="/group/:id" element={<GroupDetailPage />} />
    </Routes>
  );
}

export default Allroutes;
