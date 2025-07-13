import React, { useEffect, useState } from 'react';
import {
  StreamVideoClient,
  StreamCall,
  StreamVideoProvider,
  StreamTheme,
  CallControls,
  CallParticipantsList,
} from '@stream-io/video-react-sdk';
import axios from 'axios';
import { useSelector } from 'react-redux';

const apiKey = 'aemwtenush72';
const callType = 'default';

function VideoCall() {
  const [inputCallId, setInputCallId] = useState('');
  const [callId, setCallId] = useState('');
  const currentUser = useSelector(state => state.currentuserreducer);
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [joined, setJoined] = useState(false);
  const [status, setStatus] = useState('In lobby');
  const [copyMsg, setCopyMsg] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    const userId = currentUser.result._id;
    axios.get(`https://youtube-clone-pd9i.onrender.com/stream/dev-token/${userId}?apiKey=${apiKey}`)
      .then(res => {
        const userToken = res.data.token;
        const clientInstance = new StreamVideoClient({
          apiKey,
          user: { id: userId },
          token: userToken,
        });
        setClient(clientInstance);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch Stream token.');
        setLoading(false);
      });
  }, [currentUser]);

  useEffect(() => {
    if (!call || !joined) return;
    call.join();
    setStatus('Joining...');
    const handleParticipantJoined = (e) => setStatus('A participant joined');
    const handleParticipantLeft = (e) => setStatus('A participant left');
    call.on('participant_joined', handleParticipantJoined);
    call.on('participant_left', handleParticipantLeft);
    return () => {
      call.leave();
      call.off('participant_joined', handleParticipantJoined);
      call.off('participant_left', handleParticipantLeft);
    };
  }, [call, joined]);

  if (!currentUser) {
    return <div className="video-call-container">Please log in to join a video call.</div>;
  }
  if (loading || !client || !call) {
    return <div className="video-call-container">Loading video call...</div>;
  }
  if (error) {
    return <div className="video-call-container video-call-error">{error}</div>;
  }

  if (!joined) {
    return (
      <div className="video-call-container" style={{ textAlign: 'center' }}>
        <h2 className="video-call-title">Minimal Video Call Lobby</h2>
        <div className="video-call-instructions" style={{ margin: '0 auto 1.5rem auto', maxWidth: 480, background: '#181818', borderRadius: 8, padding: '1.2rem 1.5rem', color: '#eee', boxShadow: '0 2px 8px #0002' }}>
          <h3 style={{ color: '#90caf9', fontWeight: 600, marginTop: 0 }}>How to Join the Call</h3>
          <ul style={{ textAlign: 'left', fontSize: '1rem', margin: 0, paddingLeft: '1.2rem' }}>
            <li>Enter a Call ID (room name) below. Share it with friends to join the same call.</li>
            <li>Click the <b>Join Call</b> button.</li>
            <li>Allow camera and microphone access if prompted.</li>
            <li>Wait for other participants to join.</li>
            <li>Use the controls at the bottom to mute, leave, or manage your call.</li>
          </ul>
        </div>
        <div className="video-call-join-box">
          <input
            className="video-call-input"
            type="text"
            placeholder="Enter Call ID (e.g. friends123)"
            value={inputCallId}
            onChange={e => setInputCallId(e.target.value)}
            style={{ minWidth: 180 }}
          />
          <button
            className="join-btn"
            style={{ padding: '10px 18px', fontSize: '1rem', borderRadius: 8, background: '#1976d2', color: '#fff', border: 'none' }}
            disabled={!inputCallId.trim()}
            onClick={() => {
              setCallId(inputCallId.trim());
              setJoined(true);
            }}
          >
            Join Call
          </button>
        </div>
      </div>
    );
  }

  return (
    <StreamVideoProvider client={client}>
      <StreamTheme>
        <StreamCall call={call}>
          <div className="video-call-container" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#18181b', borderRadius: 16, boxShadow: '0 2px 16px #0004' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
              <h2 className="video-call-title" style={{ margin: 0, fontSize: '1.5rem' }}>Group Video Call</h2>
              {callId && (
                <>
                  <span style={{ background: '#222', color: '#90caf9', fontSize: '1rem', borderRadius: 6, padding: '3px 10px', marginLeft: 10 }}>
                    Call ID: <b>{callId}</b>
                  </span>
                  <button
                    className="share-btn"
                    style={{ marginLeft: 6, padding: '2px 10px', fontSize: '0.95rem', borderRadius: 6, border: 'none', cursor: 'pointer' }}
                    onClick={() => {
                      navigator.clipboard.writeText(callId);
                      setCopyMsg('Copied!');
                      setTimeout(() => setCopyMsg(''), 1200);
                    }}
                  >Copy</button>
                  {copyMsg && <span style={{ color: '#90caf9', marginLeft: 6 }}>{copyMsg}</span>}
                </>
              )}
            </div>
            <div style={{ color: '#90caf9', marginBottom: 18 }}>{status}</div>
            <div className="video-call-videos" style={{ flex: 1, width: '100%', maxWidth: 900 }}>
              <CallParticipantsList />
            </div>
            <div className="video-call-controls" style={{ marginBottom: 32 }}>
              <CallControls />
            </div>
          </div>
        </StreamCall>
      </StreamTheme>
    </StreamVideoProvider>
  );
}

export default VideoCall;