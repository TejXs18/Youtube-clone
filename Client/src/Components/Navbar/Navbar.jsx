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

const Navbar = ({ toggleDrawer, setEditCreateChannelbtn }) => {
  const [authBtn, setAuthBtn] = useState(false);
  const [user, setuser] = useState(null);
  const [profile, setprofile] = useState({});
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.currentuserreducer);

  const successlogin = () => {
    if (profile.email) {
      dispatch(login({ email: profile.email }));
    }
  };

  const google_login = useGoogleLogin({
    onSuccess: tokenResponse => setuser(tokenResponse),
    onError: error => console.log("Login Failed", error)
  });

  useEffect(() => {
    if (user) {
      axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
        headers: { Authorization: `Bearer ${user.access_token}`, Accept: 'application/json' }
      })
        .then((res) => {
          setprofile(res.data);
          successlogin();
        })
        .catch(err => console.log(err));
    }
  }, [user]);

  const logout = () => {
    dispatch(setcurrentuser(null));
    googleLogout();
    localStorage.clear();
  };

  useEffect(() => {
    const token = currentUser?.token;
    if (token) {
      const decodetoken = jwtDecode(token);
      if (decodetoken.exp * 1000 < new Date().getTime()) logout();
    }
    dispatch(setcurrentuser(JSON.parse(localStorage.getItem("Profile"))));
  }, [currentUser?.token, dispatch]);

  return (
    <>
      <div className='Container_Navbar'>
        <div className="Navbar_Row_Top">
          <div className="Burger_Logo_Navbar">
            <div className="burger" onClick={() => toggleDrawer()}>
              <p></p><p></p><p></p>
            </div>
            <Link to='/' className='logo_div_Navbar'>
              <img src={logo} alt="logo" />
              <p className='logo_title_navbar'>Your-tube</p>
            </Link>
          </div>

          <div className="Searchbar_Wrapper desktop-only">
            <Searchbar />
          </div>

          <div className="Right_Section_Navbar">
            <RiVideoAddLine size={22} className='vid_bell_Navbar' />
            <div className="apps_box">
              {[...Array(9)].map((_, i) => <p key={i} className='appBox'></p>)}
            </div>
            <IoMdNotificationsOutline size={22} className='vid_bell_Navbar' />
            <div className='Auth_cont_Navbar'>
              {currentUser ? (
                <div className="Channel_logo_App" onClick={() => setAuthBtn(true)}>
                  <p className='fstChar_logo_App'>
                    {(currentUser?.result?.name || currentUser?.result?.email)?.charAt(0).toUpperCase()}
                  </p>
                </div>
              ) : (
                <p className='Auth_Btn' onClick={google_login}>
                  <BiUserCircle size={22} />
                  <b>Sign in</b>
                </p>
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
