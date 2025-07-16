import React, { useEffect, useState } from 'react';
import {
  StreamVideoClient,
  StreamCall,
  StreamVideoProvider,
  StreamTheme,
  useCallStateHooks,
  ParticipantView,
  useCall,
} from '@stream-io/video-react-sdk';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash } from 'react-icons/fa';
import './VideoCall.css';

const apiKey = import.meta.env.VITE_STREAM_API_KEY;
const callType = 'default';

function VideoCall() {
  const [inputCallId, setInputCallId] = useState('');
  const [callId, setCallId] = useState('');
  const currentUser = useSelector(state => state.currentuserreducer);
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [error, setError] = useState(null);
  const [joined, setJoined] = useState(false);
  const [status, setStatus] = useState('In lobby');
  const [copyMsg, setCopyMsg] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setIsInitializing(false);
      return;
    }
    if (!apiKey) {
      return (
        <div className="video-call-container">
          <div className="video-call-error-card">
            <h2>API Key Missing</h2>
            <p>Please set REACT_APP_STREAM_API_KEY in your .env file and restart the server.</p>
          </div>
        </div>
      );
    }
    
    const initializeClient = async () => {
      try {
        setError(null);
        const userId = currentUser.result._id;
        const res = await axios.get(`https://youtube-clone-pd9i.onrender.com/stream/dev-token/${userId}?apiKey=${apiKey}`);
        const userToken = res.data.token;
        const clientInstance = StreamVideoClient.getOrCreateInstance({
          apiKey,
          user: { id: userId },
          token: userToken,
        });
        setClient(clientInstance);
      } catch (err) {
        setError('Failed to fetch Stream token.');
      } finally {
        setIsInitializing(false);
      }
    };

    initializeClient();
  }, [currentUser]);

  useEffect(() => {
    if (client && callId && joined && !call) {
      const newCall = client.call(callType, callId);
      setCall(newCall);
    }
  }, [client, callId, joined, call]);

  useEffect(() => {
    if (!call || !joined) return;
    
    const joinCall = async () => {
      try {
        setIsJoining(true);
        setStatus('Joining...');
        setError(null);
        
        // Create the call first
        await call.getOrCreate();
        
        // Then join the call
        await call.join();
        
        setStatus('Connected');
        setIsJoining(false);
      } catch (err) {
        console.error('Failed to join call:', err);
        setError(`Failed to join call: ${err.message || 'Unknown error'}`);
        setStatus('Failed to join');
        setIsJoining(false);
        setJoined(false);
        setCall(null);
      }
    };

    joinCall();

    const handleParticipantJoined = (e) => setStatus('A participant joined');
    const handleParticipantLeft = (e) => setStatus('A participant left');
    const handleCallEnded = () => {
      setStatus('Call ended');
      setJoined(false);
      setCall(null);
    };

    call.on('participant_joined', handleParticipantJoined);
    call.on('participant_left', handleParticipantLeft);
    call.on('call_ended', handleCallEnded);

    return () => {
      try {
        call.leave();
      } catch (err) {
        console.error('Error leaving call:', err);
      }
      call.off('participant_joined', handleParticipantJoined);
      call.off('participant_left', handleParticipantLeft);
      call.off('call_ended', handleCallEnded);
    };
  }, [call, joined]);

  const handleJoinCall = async () => {
    if (!client || !inputCallId.trim()) return;
    
    try {
      setError(null);
      setCallId(inputCallId.trim());
      setJoined(true);
    } catch (err) {
      setError('Failed to create call');
      setJoined(false);
    }
  };

  const handleCopyCallId = () => {
    navigator.clipboard.writeText(callId);
    setCopyMsg('Copied!');
    setTimeout(() => setCopyMsg(''), 1200);
  };

  if (!currentUser) {
    return (
      <div className="video-call-container">
        <div className="video-call-error-card">
          <h2>Authentication Required</h2>
          <p>Please log in to join a video call.</p>
        </div>
      </div>
    );
  }

  if (isInitializing) {
    return (
      <div className="video-call-container">
        <div className="video-call-lobby">
          <div className="video-call-header">
            <h1 className="video-call-title">Video Call</h1>
            <p className="video-call-subtitle">Connect with friends and family</p>
          </div>
          
          <div className="video-call-instructions">
            <h3>How to Join the Call</h3>
            <ul>
              <li>Enter a Call ID (room name) below</li>
              <li>Share it with friends to join the same call</li>
              <li>Click the <strong>Join Call</strong> button</li>
              <li>Allow camera and microphone access if prompted</li>
              <li>Wait for other participants to join</li>
            </ul>
          </div>
          
          <div className="video-call-join-section">
            <div className="video-call-input-group">
              <input
                className="video-call-input"
                type="text"
                placeholder="Enter Call ID (e.g. friends123)"
                value={inputCallId}
                onChange={e => setInputCallId(e.target.value)}
                disabled={isInitializing}
              />
              <button
                className="video-call-join-btn"
                disabled={!inputCallId.trim() || isInitializing}
                onClick={handleJoinCall}
              >
                {isInitializing ? 'Initializing...' : 'Join Call'}
              </button>
            </div>
            {error && <div className="video-call-error-message">{error}</div>}
          </div>
        </div>
      </div>
    );
  }

  if (!joined) {
    return (
      <div className="video-call-container">
        <div className="video-call-lobby">
          <div className="video-call-header">
            <h1 className="video-call-title">Video Call</h1>
            <p className="video-call-subtitle">Connect with friends and family</p>
          </div>
          
          <div className="video-call-instructions">
            <h3>How to Join the Call</h3>
            <ul>
              <li>Enter a Call ID (room name) below</li>
              <li>Share it with friends to join the same call</li>
              <li>Click the <strong>Join Call</strong> button</li>
              <li>Allow camera and microphone access if prompted</li>
              <li>Wait for other participants to join</li>
            </ul>
          </div>
          
          <div className="video-call-join-section">
            <div className="video-call-input-group">
              <input
                className="video-call-input"
                type="text"
                placeholder="Enter Call ID (e.g. friends123)"
                value={inputCallId}
                onChange={e => setInputCallId(e.target.value)}
              />
              <button
                className="video-call-join-btn"
                disabled={!inputCallId.trim() || isJoining}
                onClick={handleJoinCall}
              >
                {isJoining ? 'Joining...' : 'Join Call'}
              </button>
            </div>
            {error && <div className="video-call-error-message">{error}</div>}
          </div>
        </div>
      </div>
    );
  }

  if (!call) {
    return (
      <div className="video-call-container">
        <div className="video-call-loading">
          <div className="video-call-spinner"></div>
          <p>Creating call...</p>
          {error && <div className="video-call-error-message">{error}</div>}
        </div>
      </div>
    );
  }

  // Custom participant grid
  function ParticipantGrid() {
    const { useParticipants } = useCallStateHooks();
    const participants = useParticipants();
    return (
      <div className="participant-grid">
        {participants.map((participant) => {
          let displayName =
            participant.isLocalParticipant
              ? 'Me'
              : participant.user?.name || participant.user?.username || participant.userId;
          return (
            <div
              key={participant.sessionId}
              className={`participant-card${participant.isLocalParticipant ? ' me' : ''}`}
            >
              <ParticipantView participant={participant} />
              <div className="participant-name">
                {displayName}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Custom control bar with icons
  function CustomCallControls() {
    const call = useCall();
    const { useMicrophoneState, useCameraState } = useCallStateHooks();
    const { microphone, isMute: isMicMuted } = useMicrophoneState();
    const { camera, isMute: isCamMuted } = useCameraState();

    const handleMicToggle = async () => {
      await microphone.toggle();
    };
    const handleCamToggle = async () => {
      await camera.toggle();
    };
    const handleLeave = async () => {
      await call.leave();
      setJoined(false);
      setCall(null);
    };

    return (
      <div className="custom-call-controls">
        <button className="call-control-btn" onClick={handleMicToggle} title={isMicMuted ? 'Unmute Mic' : 'Mute Mic'}>
          {isMicMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
        </button>
        <button className="call-control-btn" onClick={handleCamToggle} title={isCamMuted ? 'Turn On Camera' : 'Turn Off Camera'}>
          {isCamMuted ? <FaVideoSlash /> : <FaVideo />}
        </button>
        <button className="call-control-btn leave" onClick={handleLeave} title="Leave Call">
          <FaPhoneSlash />
        </button>
      </div>
    );
  }

  return (
    <StreamVideoProvider client={client}>
      <StreamTheme>
        <StreamCall call={call}>
          <div className="video-call-main">
            <div className="video-call-header-bar">
              <div className="video-call-header-info">
                <h2 className="video-call-title">Group Video Call</h2>
                <div className="video-call-status">{status}</div>
              </div>
              
              {callId && (
                <div className="video-call-id-section">
                  <span className="video-call-id">
                    Call ID: <strong>{callId}</strong>
                  </span>
                  <button
                    className="video-call-copy-btn"
                    onClick={handleCopyCallId}
                  >
                    Copy
                  </button>
                  {copyMsg && <span className="video-call-copy-msg">{copyMsg}</span>}
                </div>
              )}
            </div>
            
            <div className="video-call-content">
              <ParticipantGrid />
              <CustomCallControls />
            </div>
          </div>
        </StreamCall>
      </StreamTheme>
    </StreamVideoProvider>
  );
}

export default VideoCall;