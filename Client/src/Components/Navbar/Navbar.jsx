import React, { useState, useEffect } from 'react';
import './Navbar.css';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import logo from './logo.ico';
import { RiVideoAddLine } from "react-icons/ri";
import { IoMdNotificationsOutline } from "react-icons/io";
import { BiUserCircle } from "react-icons/bi";
import Searchbar from './Searchbar/Searchbar';
import Auth from '../../Pages/Auth/Auth';
import axios from "axios";
import { login } from "../../action/auth";
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import { setcurrentuser } from '../../action/currentuser';
import { jwtDecode } from "jwt-decode";
import { MdVideoCall } from "react-icons/md";

const Navbar = ({ toggleDrawer, setEditCreateChannelbtn }) => {
  const [authBtn, setAuthBtn] = useState(false);
  const [user, setuser] = useState(null);
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.currentuserreducer);

  const google_login = useGoogleLogin({
    onSuccess: tokenResponse => setuser(tokenResponse),
    onError: error => console.log("Login Failed", error)
  });

  useEffect(() => {
    if (user) {
      axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
        headers: {
          Authorization: `Bearer ${user.access_token}`,
          Accept: 'application/json'
        }
      })
        .then((res) => {
          const googleUser = res.data;

          const userProfile = {
            result: {
              name: googleUser.name,
              email: googleUser.email,
              picture: googleUser.picture,
              _id: googleUser.id,
            },
            token: user.access_token
          };

          // Save user
          localStorage.setItem("Profile", JSON.stringify(userProfile));
          dispatch(setcurrentuser(userProfile));

          // Optional backend auth
          dispatch(login({ email: googleUser.email }));
        })
        .catch(err => console.log("Google user fetch error:", err));
    }
  }, [user, dispatch]);

  const logout = () => {
    dispatch(setcurrentuser(null));
    googleLogout();
    localStorage.clear();
  };

  useEffect(() => {
    const profile = localStorage.getItem("Profile");
    if (profile) {
      try {
        const parsedProfile = JSON.parse(profile);
        const token = parsedProfile.token;

        const decodedToken = jwtDecode(token); // May fail if access_token is not JWT
        if (decodedToken.exp * 1000 < new Date().getTime()) {
          logout();
        } else {
          dispatch(setcurrentuser(parsedProfile));
        }
      } catch (err) {
        console.error("Token decode error:", err);
        logout();
      }
    }
  }, [dispatch]);

  return (
    <>
      <div className='Container_Navbar'>
        <div className="Navbar_Row_Top">
          <div className="Burger_Logo_Navbar">
            <div 
              className="burger" 
              onClick={toggleDrawer}
              role="button"
              aria-label="Toggle menu"
              tabIndex={0}
            >
              <p></p><p></p><p></p>
            </div>
            <Link to='/' className='logo_div_Navbar'>
              <img src={logo} alt="Your-tube logo" />
              <p className='logo_title_navbar'>Your-tube</p>
            </Link>
          </div>

          <div className="Searchbar_Wrapper desktop-only">
            <Searchbar />
          </div>

          <div className="Right_Section_Navbar">
            <RiVideoAddLine 
              size={22} 
              className='vid_bell_Navbar' 
              role="button"
              aria-label="Upload video"
              tabIndex={0}
            />
            <Link to='/call' style={{ display: 'flex', alignItems: 'center' }}>
              <MdVideoCall 
                size={24} 
                className='vid_bell_Navbar' 
                role="button"
                aria-label="Video Call"
                tabIndex={0}
                style={{ marginLeft: '0.3rem' }}
              />
            </Link>
            <div className="apps_box">
              {[...Array(9)].map((_, i) => <div key={i} className='appBox'></div>)}
            </div>
            <IoMdNotificationsOutline 
              size={22} 
              className='vid_bell_Navbar'
              role="button"
              aria-label="Notifications"
              tabIndex={0}
            />
            <div className='Auth_cont_Navbar'>
              {currentUser ? (
                <div 
                  className="Channel_logo_App" 
                  onClick={() => setAuthBtn(true)}
                  role="button"
                  aria-label="Account menu"
                  tabIndex={0}
                >
                  <p className='fstChar_logo_App'>
                    {(currentUser?.result?.name || currentUser?.result?.email)?.charAt(0).toUpperCase()}
                  </p>
                </div>
              ) : (
                <button 
                  className='Auth_Btn' 
                  onClick={google_login}
                  aria-label="Sign in"
                >
                  <BiUserCircle size={22} />
                  <b>Sign in</b>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="Searchbar_Wrapper mobile-only">
          <Searchbar />
        </div>
      </div>

      {authBtn && (
        <Auth
          setEditCreateChanelbtn={setEditCreateChannelbtn}
          setAuthBtn={setAuthBtn}
          user={currentUser}
        />
      )}
    </>
  );
};

export default Navbar;
