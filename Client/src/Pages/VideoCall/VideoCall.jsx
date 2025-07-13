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
const callId = 'room-id-001';

function VideoCall() {
  const currentUser = useSelector(state => state.currentuserreducer);
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
        setCall(clientInstance.call(callType, callId));
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch Stream token.');
        setLoading(false);
      });
  }, [currentUser]);

  useEffect(() => {
    if (call) {
      call.join();
      return () => call.leave();
    }
  }, [call]);

  if (!currentUser) {
    return <div style={{ color: '#fff', padding: 40 }}>Please log in to join a video call.</div>;
  }
  if (loading || !client || !call) {
    return <div style={{ color: '#fff', padding: 40 }}>Loading video call...</div>;
  }
  if (error) {
    return <div style={{ color: 'red', padding: 40 }}>{error}</div>;
  }

  return (
    <StreamVideoProvider client={client}>
      <StreamTheme>
        <StreamCall call={call}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100vh', background: '#18181b' }}>
            <h2 style={{ color: '#fff', margin: '24px 0' }}>Group Video Call</h2>
            <div style={{ flex: 1, width: '100%', maxWidth: 900 }}>
              <CallParticipantsList />
            </div>
            <div style={{ marginBottom: 32 }}>
              <CallControls />
            </div>
          </div>
        </StreamCall>
      </StreamTheme>
    </StreamVideoProvider>
  );
}

export default VideoCall;