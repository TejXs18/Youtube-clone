import React from 'react'
import Leftsidebar from '../../Components/LeftSidebar/LeftSidebar'
import './Home.css'
// import vid from '../../Components/Video/vid.mp4'
import Showvideogrid from '../../Components/Showvideogrid/Showvideogrid'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

const Home= ()=> {
  const vids =useSelector(state=>state.videoreducer)?.data?.filter(q=>q).reverse();

    // const vids=[
    //   {
    //     _id:1,
    //     video_src:vid,
    //     channel:'Dummy Channel',
    //     title:'video 1',
    //     uploader:'abc',
    //     description:'description of video 1'
    //   },
    //   {
    //     _id:2,
    //     video_src:vid,
    //     channel:'Dummy Channel',
    //     title:'video 2',
    //     uploader:'abc',
    //     description:'description of video 1'
    //   },
    //   {
    //     _id:3,
    //     video_src:vid,
    //     channel:'Dummy Channel',
    //     title:'video 3',
    //     uploader:'abc',
    //     description:'description of video 1'
    //   },
    //   {
    //     _id:4,
    //     video_src:vid,
    //     channel:'Dummy Channel',
    //     title:'video 4',
    //     uploader:'abc',
    //     description:'description of video 1'
    //   }

    // ]

    const navlist=[
    "All",
    "Python",
    "Java",
    "C++",
    "Movies",
    "Science",
    "Animation",
    "Gaming",
    "Comedy"
  ];
  return (
    <div className="container_Pages_App">
      <Leftsidebar/>
      <div className="container2_Pages_App">
        <Link to="/call" style={{
          display: 'inline-block',
          margin: '1rem 0',
          padding: '0.5rem 1.2rem',
          background: '#1976d2',
          color: '#fff',
          borderRadius: '6px',
          textDecoration: 'none',
          fontWeight: 'bold',
        }}>Start Video Call (Test)</Link>
        <div className="navigation_Home">
          {navlist.map((m)=>{
            return(
              <p key={m} className='btn_nav_home'>{m}</p>
            );
          })}
        </div>
        <Showvideogrid vid={vids}/>
      </div>
    </div>
  )
}
export default Home