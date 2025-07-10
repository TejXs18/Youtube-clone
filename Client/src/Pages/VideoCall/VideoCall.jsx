import React, { useRef, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './VideoCall.css';

const SIGNALING_SERVER_URL = 'https://youtube-clone-pd9i.onrender.com';
const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }];
const MAX_PEERS = 3; // 3 remote peers + self = 4

const VideoCall = () => {
  const localVideoRef = useRef(null);
  const [remoteStreams, setRemoteStreams] = useState([]); // [{userId, stream}]
  const remoteVideoRefs = useRef({}); // userId: ref
  const [roomId, setRoomId] = useState('');
  const [joined, setJoined] = useState(false);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const peerConnections = useRef({}); // userId: RTCPeerConnection
  const [localStream, setLocalStream] = useState(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [myId, setMyId] = useState(null);
  const [mediaError, setMediaError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('Not connected');

  // Test socket connection
  const testSocketConnection = () => {
    console.log('🟢 [Test] Testing socket connection...');
    setMessages(msgs => [...msgs, '🟢 Testing socket connection...']);
    
    const testSocket = io(SIGNALING_SERVER_URL);
    
    testSocket.on('connect', () => {
      console.log('🟢 [Test] Socket test successful!');
      setMessages(msgs => [...msgs, '🟢 Socket test successful!']);
      testSocket.disconnect();
    });
    
    testSocket.on('connect_error', (error) => {
      console.error('🔴 [Test] Socket test failed:', error);
      setMessages(msgs => [...msgs, `🔴 Socket test failed: ${error.message}`]);
    });
  };

  // Setup socket and join room
  useEffect(() => {
    if (joined && !socket) {
      console.log('🟢 [Frontend] Creating socket connection to:', SIGNALING_SERVER_URL);
      setConnectionStatus('Connecting to server...');
      const s = io(SIGNALING_SERVER_URL);
      setSocket(s);
      
      s.on('connect', () => {
        setMyId(s.id);
        setConnectionStatus('Connected to server');
        setMessages(msgs => [...msgs, `🟢 Connected to signaling server. My ID: ${s.id}`]);
        console.log('🟢 [Frontend] Socket connected. My ID:', s.id);
        console.log('🟢 [Frontend] Joining room:', roomId);
        s.emit('join-room', roomId);
      });

      s.on('connect_error', (error) => {
        console.error('🔴 [Frontend] Socket connection error:', error);
        setConnectionStatus('Connection failed');
        setMessages(msgs => [...msgs, `🔴 Connection error: ${error.message}`]);
      });

      s.on('all-users', async (users) => {
        console.log('🟢 [Frontend] Received all-users:', users);
        setMessages(msgs => [...msgs, `🟢 Users in room: ${users.join(', ')}`]);
        setConnectionStatus(`Connected - ${users.length} other users in room`);
        
        // Ensure local stream is ready before connecting
        await startLocalStream();
        
        // Only the new user (joining) initiates offers
        users.slice(0, MAX_PEERS).forEach(async (userId) => {
          console.log('🟢 [Frontend] Creating connection to existing user:', userId);
          await createPeerConnection(userId, true, s); // initiator = true
        });
      });

      s.on('user-joined', async (userId) => {
        console.log('🟢 [Frontend] User joined:', userId);
        setMessages(msgs => [...msgs, `🟢 User joined: ${userId}`]);
        setConnectionStatus(`Connected - New user joined: ${userId}`);
        
        // Ensure local stream is ready before connecting
        await startLocalStream();
        
        // Existing users create peer connection but do NOT initiate offer
        await createPeerConnection(userId, false, s); // initiator = false
      });

      s.on('offer', async (data) => {
        const { from, offer } = data;
        console.log('🟢 [Frontend] Received offer from', from);
        setMessages(msgs => [...msgs, `🟢 Received offer from ${from}`]);
        
        await createPeerConnection(from, false, s); // initiator = false
        const pc = peerConnections.current[from];
        if (pc) {
          try {
            console.log('🟢 [Frontend] Setting remote description for', from);
            await pc.setRemoteDescription(new window.RTCSessionDescription(offer));
            console.log('🟢 [Frontend] Creating answer for', from);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            console.log('🟢 [Frontend] Sending answer to', from);
            s.emit('answer', { roomId, to: from, answer });
          } catch (e) {
            console.error('🔴 [Frontend] Error handling offer:', e);
            setMessages(msgs => [...msgs, `🔴 Error handling offer from ${from}: ${e.message}`]);
          }
        } else {
          console.error('🔴 [Frontend] No peer connection found for', from);
        }
      });

      s.on('answer', async (data) => {
        const { from, answer } = data;
        console.log('🟢 [Frontend] Received answer from', from);
        setMessages(msgs => [...msgs, `🟢 Received answer from ${from}`]);
        
        const pc = peerConnections.current[from];
        if (pc) {
          try {
            console.log('🟢 [Frontend] Setting remote description (answer) for', from);
            await pc.setRemoteDescription(new window.RTCSessionDescription(answer));
          } catch (e) {
            console.error('🔴 [Frontend] Error handling answer:', e);
            setMessages(msgs => [...msgs, `🔴 Error handling answer from ${from}: ${e.message}`]);
          }
        } else {
          console.error('🔴 [Frontend] No peer connection found for answer from', from);
        }
      });

      s.on('ice-candidate', async (data) => {
        const { from, candidate } = data;
        console.log('🟢 [Frontend] Received ICE candidate from', from);
        setMessages(msgs => [...msgs, `🟢 Received ICE candidate from ${from}`]);
        
        const pc = peerConnections.current[from];
        if (pc) {
          try {
            await pc.addIceCandidate(new window.RTCIceCandidate(candidate));
            console.log('🟢 [Frontend] Added ICE candidate for', from);
          } catch (e) {
            console.error('🔴 [Frontend] Error adding ICE candidate from', from, e);
            setMessages(msgs => [...msgs, `🔴 Error adding ICE candidate from ${from}: ${e.message}`]);
          }
        } else {
          console.error('🔴 [Frontend] No peer connection found for ICE candidate from', from);
        }
      });

      s.on('user-left', (userId) => {
        console.log('🔴 [Frontend] User left:', userId);
        setMessages(msgs => [...msgs, `🔴 User left: ${userId}`]);
        setConnectionStatus(`Connected - User left: ${userId}`);
        
        if (peerConnections.current[userId]) {
          peerConnections.current[userId].close();
          delete peerConnections.current[userId];
          console.log('🟢 [Frontend] Closed peer connection for', userId);
        }
        setRemoteStreams(streams => streams.filter(s => s.userId !== userId));
      });

      return () => {
        console.log('🟢 [Frontend] Cleaning up socket connection');
        // Clean up all peer connections on disconnect
        Object.values(peerConnections.current).forEach(pc => pc.close());
        peerConnections.current = {};
        s.disconnect();
      };
    }
    // eslint-disable-next-line
  }, [joined, roomId, socket]);

  // Attach remote streams to video elements
  useEffect(() => {
    console.log('🟢 [Frontend] Remote streams updated:', remoteStreams.length);
    remoteStreams.forEach(({ userId, stream }) => {
      if (!remoteVideoRefs.current[userId]) {
        remoteVideoRefs.current[userId] = React.createRef();
      }
      const videoElem = remoteVideoRefs.current[userId].current;
      if (videoElem && videoElem.srcObject !== stream) {
        videoElem.srcObject = stream;
        console.log('🟢 [Frontend] Assigned remote stream to video element for user:', userId);
      } else if (!videoElem) {
        console.warn('🔴 [Frontend] No video element found for user:', userId);
      }
    });
  }, [remoteStreams]);

  // Start local media
  const startLocalStream = async () => {
    if (localStream) {
      console.log('🟢 [Frontend] Local stream already exists');
      return;
    }
    
    console.log('🟢 [Frontend] Starting local stream...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      setMediaError('');
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        console.log('🟢 [Frontend] Local stream attached to video element');
      }
      console.log('🟢 [Frontend] Local stream started successfully');
    } catch (err) {
      console.error('🔴 [Frontend] Error starting local stream:', err);
      setMediaError('Could not access camera/mic. Please allow permissions in your browser and refresh the page.');
      setMessages(msgs => [...msgs, '🔴 Could not access camera/mic.']);
    }
  };

  // Helper: Add local tracks to a peer connection
  const addLocalTracks = (pc) => {
    if (localStream) {
      localStream.getTracks().forEach(track => {
        try {
          pc.addTrack(track, localStream);
          console.log('🟢 [Frontend] Added local track:', track.kind);
        } catch (e) {
          console.warn('🔴 [Frontend] Could not add track:', e);
        }
      });
    } else {
      console.warn('🔴 [Frontend] No localStream when trying to add tracks');
    }
  };

  // Create peer connection for a user
  const createPeerConnection = async (userId, initiator, s) => {
    if (peerConnections.current[userId]) {
      console.log('🟢 [Frontend] Connection already exists for', userId);
      return;
    }
    
    console.log('🟢 [Frontend] Creating new RTCPeerConnection for', userId, 'initiator:', initiator);
    const pc = new window.RTCPeerConnection({ iceServers: ICE_SERVERS });
    peerConnections.current[userId] = pc;
    
    // Always add local tracks (if available)
    addLocalTracks(pc);
    
    // If localStream arrives later, add tracks then
    if (!localStream) {
      const interval = setInterval(() => {
        if (localStream) {
          addLocalTracks(pc);
          clearInterval(interval);
        }
      }, 200);
    }
    
    // Handle remote stream
    pc.ontrack = (event) => {
      console.log('🟢 [Frontend] Received remote stream from', userId);
      setRemoteStreams(prev => {
        if (prev.some(s => s.userId === userId)) {
          console.log('🟢 [Frontend] Stream already exists for', userId);
          return prev;
        }
        console.log('🟢 [Frontend] Adding new remote stream for', userId);
        return [...prev, { userId, stream: event.streams[0] }].slice(0, MAX_PEERS);
      });
    };
    
    // ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('🟢 [Frontend] Sending ICE candidate to', userId);
        s.emit('ice-candidate', { roomId, to: userId, candidate: event.candidate });
      }
    };
    
    // Connection state changes
    pc.onconnectionstatechange = () => {
      console.log('🟢 [Frontend] Connection state for', userId, ':', pc.connectionState);
      setMessages(msgs => [...msgs, `🟢 Connection state with ${userId}: ${pc.connectionState}`]);
    };
    
    // ICE connection state changes
    pc.oniceconnectionstatechange = () => {
      console.log('🟢 [Frontend] ICE connection state for', userId, ':', pc.iceConnectionState);
      setMessages(msgs => [...msgs, `🟢 ICE state with ${userId}: ${pc.iceConnectionState}`]);
    };
    
    // If initiator, create offer
    if (initiator) {
      try {
        console.log('🟢 [Frontend] Creating offer for', userId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        console.log('🟢 [Frontend] Sending offer to', userId);
        s.emit('offer', { roomId, to: userId, offer });
      } catch (e) {
        console.error('🔴 [Frontend] Failed to create/send offer:', e);
        setMessages(msgs => [...msgs, `🔴 Failed to create offer for ${userId}: ${e.message}`]);
      }
    }
  };

  const handleJoin = async () => {
    if (!roomId.trim()) return;
    console.log('🟢 [Frontend] Joining room:', roomId);
    setJoined(true);
    await startLocalStream();
  };

  // End call cleanup
  const handleEndCall = () => {
    console.log('🟢 [Frontend] Ending call...');
    if (peerConnections.current) {
      Object.values(peerConnections.current).forEach(pc => pc.close());
      peerConnections.current = {};
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    remoteVideoRefs.current = {};
    setMessages(msgs => [...msgs, '🟢 Call ended.']);
    setJoined(false);
    setSocket(null);
    setRemoteStreams([]);
    setConnectionStatus('Not connected');
  };

  // Screen sharing logic
  const handleShareScreen = async () => {
    if (!peerConnections.current) return;
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];
      // Replace video track in all peer connections
      Object.values(peerConnections.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
        if (sender) sender.replaceTrack(screenTrack);
      });
      // Show screen in local video
      if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;
      setIsScreenSharing(true);
      // When user stops sharing
      screenTrack.onended = () => {
        if (localStream) {
          const camTrack = localStream.getVideoTracks()[0];
          Object.values(peerConnections.current).forEach(pc => {
            const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
            if (sender && camTrack) sender.replaceTrack(camTrack);
          });
          if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
        }
        setIsScreenSharing(false);
      };
    } catch (err) {
      setMessages(msgs => [...msgs, '🔴 Screen sharing failed.']);
    }
  };

  // Recording logic
  const handleStartRecording = () => {
    if (!localVideoRef.current && !remoteStreams.length) return;
    const stream = new window.MediaStream();
    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(track => stream.addTrack(track));
    }
    if (remoteStreams.length > 0) {
      remoteStreams.forEach(s => {
        if (s.stream) {
          s.stream.getTracks().forEach(track => stream.addTrack(track));
        }
      });
    }
    const recorder = new window.MediaRecorder(stream);
    setMediaRecorder(recorder);
    setRecordedChunks([]);
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) setRecordedChunks(prev => [...prev, e.data]);
    };
    recorder.onstop = () => {
      setIsRecording(false);
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `call-recording-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
    };
    recorder.start();
    setIsRecording(true);
    setMessages(msgs => [...msgs, '🟢 Recording started.']);
  };

  const handleStopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setMessages(msgs => [...msgs, '🟢 Recording stopped.']);
    }
  };

  // Stop/Start Video logic
  const handleToggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !videoEnabled;
      });
      setVideoEnabled(v => !v);
    }
  };

  // Mute/Unmute Mic logic
  const handleToggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !audioEnabled;
      });
      setAudioEnabled(a => !a);
    }
  };

  return (
    <div className="video-call-container">
      <div className="video-call-instructions">
        <h3>How to Join a Video Call</h3>
        <ul>
          <li>Decide a <b>Room ID</b> (any word, number, or code) and share it with your friends (up to 4 people).</li>
          <li>All users must enter the <b>same Room ID</b> in the box below and click <b>Join Call</b>.</li>
          <li>The first user will see their own video. When others join with the same Room ID, the call will connect automatically.</li>
          <li>You can use the <b>Share Screen</b>, <b>Record</b>, <b>Mute Mic</b>, and <b>Stop Video</b> buttons during the call.</li>
        </ul>
      </div>
      <h2 className="video-call-title">Video Call (Beta)</h2>
      
      {/* Connection Status */}
      <div style={{ 
        background: connectionStatus.includes('Connected') ? '#1b5e20' : '#d32f2f', 
        color: 'white', 
        padding: '8px 16px', 
        borderRadius: '4px', 
        marginBottom: '16px',
        textAlign: 'center'
      }}>
        <strong>Status:</strong> {connectionStatus}
      </div>
      
      {!joined ? (
        <div className="video-call-join-box">
          <input
            type="text"
            placeholder="Enter Room ID or Friends' Code"
            value={roomId}
            onChange={e => setRoomId(e.target.value)}
            className="video-call-input"
          />
          <button onClick={handleJoin} className="video-call-btn join-btn">
            Join Call
          </button>
          <button onClick={testSocketConnection} className="video-call-btn" style={{ background: '#ff9800' }}>
            Test Connection
          </button>
        </div>
      ) : (
        <div>
          {mediaError && (
            <div className="video-call-error">
              <b>Error:</b> {mediaError}
            </div>
          )}
          <div className="video-call-videos">
            <div>
              <video ref={localVideoRef} autoPlay playsInline muted className="video-call-video" />
              <div className="video-call-label">You</div>
            </div>
            {remoteStreams.map(({ userId }, idx) => {
              if (!remoteVideoRefs.current[userId]) {
                remoteVideoRefs.current[userId] = React.createRef();
              }
              return (
                <div key={userId}>
                  <video ref={remoteVideoRefs.current[userId]} autoPlay playsInline className="video-call-video" />
                  <div className="video-call-label">Friend {idx + 1} ({userId.slice(0, 8)}...)</div>
                </div>
              );
            })}
          </div>
          <div className="video-call-controls">
            <button className="video-call-btn share-btn" onClick={handleShareScreen} disabled={isScreenSharing || !!mediaError}>
              {isScreenSharing ? 'Sharing...' : 'Share Screen'}
            </button>
            <button className="video-call-btn" onClick={handleToggleVideo} disabled={!localStream || !!mediaError}>
              {videoEnabled ? 'Stop Video' : 'Start Video'}
            </button>
            <button className="video-call-btn" onClick={handleToggleAudio} disabled={!localStream || !!mediaError}>
              {audioEnabled ? 'Mute Mic' : 'Unmute Mic'}
            </button>
            {!isRecording ? (
              <button className="video-call-btn record-btn" onClick={handleStartRecording} disabled={!!mediaError}>
                Record
              </button>
            ) : (
              <button className="video-call-btn stop-record-btn" onClick={handleStopRecording} disabled={!!mediaError}>
                Stop Recording
              </button>
            )}
            <button className="video-call-btn end-btn" onClick={handleEndCall}>
              End Call
            </button>
          </div>
          <div className="video-call-log">
            <b>Signaling Log:</b>
            <ul>
              {messages.map((msg, i) => <li key={i}>{msg}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCall; 