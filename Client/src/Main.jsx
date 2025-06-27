import { StrictMode } from 'react'
import React from 'react';
import { createRoot } from 'react-dom/client'
import ReactDOM from 'react-dom/client';
import './index.css'
import App from './App.jsx'
import reportWebVitals from './reportWebVitals.js'
import {Provider} from 'react-redux'
import {applyMiddleware,compose} from 'redux'
import {legacy_createStore as createstore} from "redux"
import {thunk}from 'redux-thunk'
import Reducers from './Reducers/index.js'
import { GoogleOAuthProvider } from '@react-oauth/google';


const store=createstore(Reducers,compose(applyMiddleware(thunk)));
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(

  <Provider store={store}>
    <GoogleOAuthProvider clientId="351489597724-g0doobbscdoo68f27rr72qesc79hiqa5.apps.googleusercontent.com">
  <React.StrictMode>
    <App />
  </React.StrictMode>
  </GoogleOAuthProvider>
  </Provider>
);

reportWebVitals();