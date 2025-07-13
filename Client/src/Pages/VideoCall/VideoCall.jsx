import React, { useEffect } from 'react';
import {
  StreamVideoClient,
  StreamCall,
  StreamVideoProvider,
  StreamTheme,
  CallControls,
  CallParticipantsList,
} from '@stream-io/video-react-sdk';
// import './VideoCall.css'; // Optional: keep if you want to style further

import { getDevToken } from '@stream-io/video-react-sdk';

const apiKey = 'aemwtenush72'; // Your Stream Video API key
// Allow quick switching of userId for demo/testing (from localStorage, prompt, or fallback)
const defaultUserId = 'user-' + Math.floor(Math.random() * 10000);
const userId = window.localStorage.getItem('stream_user_id') || defaultUserId;
const userToken = getDevToken(userId); // Dev token for local/dev only
const callType = 'default';
const callId = 'room-id-001'; // Use a unique value for each call/room

const client = new StreamVideoClient({
  apiKey,
  user: { id: userId },
  token: userToken,
});

function VideoCall() {
  const call = client.call(callType, callId);

  useEffect(() => {
    call.join();
    return () => call.leave();
  }, [call]);

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

  // Media stream management
  const startLocalStream = useCallback(async () => {
    if (localStream) {
      logDebug('Local stream already exists');
      return;
    }
    
    logDebug('Starting local stream...');
    setMediaError('');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }, 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1
        }
      });
      
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      startAudioLevelMonitoring();
      addMessage('Local stream started successfully', 'success');
      logDebug('Local stream started successfully');
      
    } catch (err) {
      const errorMessage = 'Could not access camera/mic. Please allow permissions and refresh.';
      setMediaError(errorMessage);
      addMessage(errorMessage, 'error');
      logDebug('Error starting local stream:', err);
    }
  }, [localStream, addMessage, logDebug, startAudioLevelMonitoring]);

  const stopLocalStream = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    stopAudioLevelMonitoring();
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  }, [localStream, stopAudioLevelMonitoring]);

  // Peer connection management
  const createPeerConnection = useCallback(async (userId, initiator, socket) => {
    if (peerConnections.current[userId]) {
      logDebug('Connection already exists for', userId);
      return;
    }
    
    logDebug('Creating new RTCPeerConnection for', userId, 'initiator:', initiator);
    
    const pc = new window.RTCPeerConnection({ 
      iceServers: ICE_SERVERS,
      iceCandidatePoolSize: 10
    });
    peerConnections.current[userId] = pc;
    
    // Add local tracks if available
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
        logDebug(`Added ${track.kind} track to peer connection`);
      });
    }
    
    // Handle remote stream
    pc.ontrack = (event) => {
      logDebug('Received remote stream from', userId);
      const stream = event.streams[0];
      
      setRemoteStreams(prev => {
        if (prev.some(s => s.userId === userId)) {
          return prev;
        }
        return [...prev, { userId, stream }].slice(0, MAX_PEERS);
      });
      
      addMessage(`Connected to ${userId}`, 'success');
    };
    
    // ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', { roomId, to: userId, candidate: event.candidate });
        logDebug('Sent ICE candidate to', userId);
      }
    };
    
    // Connection state monitoring
    pc.onconnectionstatechange = () => {
      logDebug('Connection state for', userId, ':', pc.connectionState);
      addMessage(`Connection with ${userId}: ${pc.connectionState}`);
    };
    
    pc.oniceconnectionstatechange = () => {
      logDebug('ICE connection state for', userId, ':', pc.iceConnectionState);
      addMessage(`ICE state with ${userId}: ${pc.iceConnectionState}`);
    };
    
    // Create offer if initiator
    if (initiator) {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('offer', { roomId, to: userId, offer });
        logDebug('Sent offer to', userId);
      } catch (e) {
        addMessage(`Failed to create offer for ${userId}: ${e.message}`, 'error');
        logDebug('Failed to create/send offer:', e);
      }
    }
  }, [localStream, roomId, addMessage, logDebug]);

  // Socket event handlers
  const setupSocketHandlers = useCallback((socket) => {
    socket.on('connect', () => {
      setMyId(socket.id);
      setConnectionStatus('Connected to server');
      addMessage(`Connected to signaling server. My ID: ${socket.id}`, 'success');
      logDebug('Socket connected. My ID:', socket.id);
      socket.emit('join-room', roomId);
    });

    socket.on('connect_error', (error) => {
      setConnectionStatus('Connection failed');
      addMessage(`Connection error: ${error.message}`, 'error');
      logDebug('Socket connection error:', error);
    });

    socket.on('all-users', async (users) => {
      logDebug('Received all-users:', users);
      addMessage(`Users in room: ${users.join(', ')}`, 'success');
      setConnectionStatus(`Connected - ${users.length} other users in room`);
      
      await startLocalStream();
      
      users.slice(0, MAX_PEERS).forEach(async (userId) => {
        await createPeerConnection(userId, true, socket);
      });
    });

    socket.on('user-joined', async (userId) => {
      logDebug('User joined:', userId);
      addMessage(`User joined: ${userId}`, 'success');
      setConnectionStatus(`Connected - New user joined: ${userId}`);
      
      await startLocalStream();
      await createPeerConnection(userId, false, socket);
    });

    socket.on('offer', async (data) => {
      const { from, offer } = data;
      logDebug('Received offer from', from);
      addMessage(`Received offer from ${from}`, 'success');
      
      await createPeerConnection(from, false, socket);
      const pc = peerConnections.current[from];
      
      if (pc) {
        try {
          await pc.setRemoteDescription(new window.RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('answer', { roomId, to: from, answer });
          logDebug('Sent answer to', from);
        } catch (e) {
          addMessage(`Error handling offer from ${from}: ${e.message}`, 'error');
          logDebug('Error handling offer:', e);
        }
      }
    });

    socket.on('answer', async (data) => {
      const { from, answer } = data;
      logDebug('Received answer from', from);
      addMessage(`Received answer from ${from}`, 'success');
      
      const pc = peerConnections.current[from];
      if (pc) {
        try {
          await pc.setRemoteDescription(new window.RTCSessionDescription(answer));
        } catch (e) {
          addMessage(`Error handling answer from ${from}: ${e.message}`, 'error');
          logDebug('Error handling answer:', e);
        }
      }
    });

    socket.on('ice-candidate', async (data) => {
      const { from, candidate } = data;
      logDebug('Received ICE candidate from', from);
      addMessage(`Received ICE candidate from ${from}`, 'success');
      
      const pc = peerConnections.current[from];
      if (pc) {
        try {
          await pc.addIceCandidate(new window.RTCIceCandidate(candidate));
        } catch (e) {
          addMessage(`Error adding ICE candidate from ${from}: ${e.message}`, 'error');
          logDebug('Error adding ICE candidate:', e);
        }
      }
    });

    socket.on('user-left', (userId) => {
      logDebug('User left:', userId);
      addMessage(`User left: ${userId}`, 'error');
      setConnectionStatus(`Connected - User left: ${userId}`);
      
      if (peerConnections.current[userId]) {
        peerConnections.current[userId].close();
        delete peerConnections.current[userId];
      }
      setRemoteStreams(streams => streams.filter(s => s.userId !== userId));
    });
  }, [roomId, startLocalStream, createPeerConnection, addMessage, logDebug]);

  // Socket connection setup
  useEffect(() => {
    if (joined && !socket) {
      logDebug('Creating socket connection to:', SIGNALING_SERVER_URL);
      setConnectionStatus('Connecting to server...');
      
      const newSocket = io(SIGNALING_SERVER_URL);
      setSocket(newSocket);
      setupSocketHandlers(newSocket);
      
      return () => {
        logDebug('Cleaning up socket connection');
        Object.values(peerConnections.current).forEach(pc => pc.close());
        peerConnections.current = {};
        newSocket.disconnect();
      };
    }
  }, [joined, socket, setupSocketHandlers, logDebug]);

  // Attach remote streams to video elements
  useEffect(() => {
    remoteStreams.forEach(({ userId, stream }) => {
      if (!remoteVideoRefs.current[userId]) {
        remoteVideoRefs.current[userId] = React.createRef();
      }
      
      const videoElem = remoteVideoRefs.current[userId].current;
      if (videoElem && videoElem.srcObject !== stream) {
        videoElem.srcObject = stream;
        logDebug('Assigned remote stream to video element for user:', userId);
      }
    });
  }, [remoteStreams, logDebug]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLocalStream();
      stopAudioLevelMonitoring();
      if (socket) {
        socket.disconnect();
      }
    };
  }, [stopLocalStream, stopAudioLevelMonitoring, socket]);

  // Event handlers
  const handleJoin = useCallback(async () => {
    if (!roomId.trim()) {
      addMessage('Please enter a room ID', 'error');
      return;
    }
    
    logDebug('Joining room:', roomId);
    setJoined(true);
    await startLocalStream();
  }, [roomId, startLocalStream, addMessage, logDebug]);

  const handleEndCall = useCallback(() => {
    logDebug('Ending call...');
    
    // Stop recording if active
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    
    // Close peer connections
    Object.values(peerConnections.current).forEach(pc => pc.close());
    peerConnections.current = {};
    
    // Stop local stream
    stopLocalStream();
    
    // Reset state
    setJoined(false);
    setSocket(null);
    setRemoteStreams([]);
    setConnectionStatus('Not connected');
    setMessages([]);
    setMediaError('');
    setIsScreenSharing(false);
    setIsRecording(false);
    setRecordedChunks([]);
    setDownloadUrl(null);
    
    addMessage('Call ended', 'success');
  }, [stopLocalStream, addMessage, logDebug, isRecording]);

  const handleToggleVideo = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !videoEnabled;
      });
      setVideoEnabled(v => !v);
      addMessage(`Video ${!videoEnabled ? 'enabled' : 'disabled'}`, 'success');
    }
  }, [localStream, videoEnabled, addMessage]);

  const handleToggleAudio = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !audioEnabled;
      });
      setAudioEnabled(a => !a);
      addMessage(`Audio ${!audioEnabled ? 'enabled' : 'disabled'}`, 'success');
    }
  }, [localStream, audioEnabled, addMessage]);

  const handleShareScreen = useCallback(async () => {
    if (!Object.keys(peerConnections.current).length) {
      addMessage('No connections to share screen with', 'error');
      return;
    }
    
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
        video: { 
          cursor: 'always',
          displaySurface: 'monitor'
        } 
      });
      
      const screenTrack = screenStream.getVideoTracks()[0];
      
      // Replace video track in all peer connections
      Object.values(peerConnections.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
        if (sender) sender.replaceTrack(screenTrack);
      });
      
      // Show screen in local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }
      
      setIsScreenSharing(true);
      addMessage('Screen sharing started', 'success');
      
      // Handle screen sharing stop
      screenTrack.onended = () => {
        if (localStream) {
          const camTrack = localStream.getVideoTracks()[0];
          Object.values(peerConnections.current).forEach(pc => {
            const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
            if (sender && camTrack) sender.replaceTrack(camTrack);
          });
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
          }
        }
        setIsScreenSharing(false);
        addMessage('Screen sharing stopped', 'success');
      };
      
    } catch (err) {
      addMessage('Screen sharing failed', 'error');
      logDebug('Screen sharing error:', err);
    }
  }, [localStream, addMessage, logDebug]);

  const handleStartRecording = useCallback(() => {
    if (!localStream && !remoteStreams.length) {
      addMessage('No streams to record', 'error');
      return;
    }
    
    try {
      const streamToRecord = new window.MediaStream();
      
      // Add local stream tracks
      if (localStream) {
        localStream.getTracks().forEach(track => streamToRecord.addTrack(track));
      }
      
      // Add remote stream tracks
      remoteStreams.forEach(({ stream }) => {
        stream.getTracks().forEach(track => streamToRecord.addTrack(track));
      });
      
      const recorder = new window.MediaRecorder(streamToRecord, { 
        mimeType: 'video/webm; codecs=vp8,opus' 
      });
      
      setRecordedChunks([]);
      
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setIsRecording(false);
        addMessage('Recording stopped. Ready to download.', 'success');
      };
      
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      addMessage('Recording started', 'success');
      
    } catch (err) {
      addMessage(`Error starting recording: ${err.message}`, 'error');
      logDebug('Recording error:', err);
    }
  }, [localStream, remoteStreams, recordedChunks, addMessage, logDebug]);

  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  }, [isRecording]);

  const handleDownloadRecording = useCallback(() => {
    if (downloadUrl) {
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = downloadUrl;
      a.download = `call-recording-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
      setDownloadUrl(null);
      setRecordedChunks([]);
      addMessage('Recording downloaded', 'success');
    }
  }, [downloadUrl, addMessage]);

  // Test functions
  const testSocketConnection = useCallback(() => {
    addMessage('Testing socket connection...', 'info');
    
    const testSocket = io(SIGNALING_SERVER_URL);
    
    testSocket.on('connect', () => {
      addMessage('Socket test successful!', 'success');
      testSocket.disconnect();
    });
    
    testSocket.on('connect_error', (error) => {
      addMessage(`Socket test failed: ${error.message}`, 'error');
    });
  }, [addMessage]);

  const testAudioDevices = useCallback(async () => {
    addMessage('Testing audio devices...', 'info');
    
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = devices.filter(device => device.kind === 'audioinput');
      addMessage(`Found ${audioDevices.length} audio devices`, 'success');
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      addMessage('Audio permissions granted', 'success');
      
      const audioTracks = stream.getAudioTracks();
      addMessage(`Audio tracks: ${audioTracks.length}`, 'success');
      
      stream.getTracks().forEach(track => track.stop());
      
    } catch (error) {
      addMessage(`Audio test failed: ${error.message}`, 'error');
    }
  }, [addMessage]);

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
        {audioLevel > 0 && (
          <div style={{ marginTop: '4px', fontSize: '12px' }}>
            Audio Level: {Math.round(audioLevel)}%
          </div>
        )}
      </div>
      
      {!joined ? (
        <div className="video-call-join-box">
          <input
            type="text"
            placeholder="Enter Room ID or Friends' Code"
            value={roomId}
            onChange={e => setRoomId(e.target.value)}
            className="video-call-input"
            onKeyPress={e => e.key === 'Enter' && handleJoin()}
          />
          <button onClick={handleJoin} className="video-call-btn join-btn">
            Join Call
          </button>
          <button onClick={testSocketConnection} className="video-call-btn" style={{ background: '#ff9800' }}>
            Test Connection
          </button>
          <button onClick={testAudioDevices} className="video-call-btn" style={{ background: '#9c27b0' }}>
            Test Audio
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
              <video 
                ref={localVideoRef} 
                autoPlay 
                playsInline 
                muted 
                className="video-call-video" 
              />
              <div className="video-call-label">
                You (Audio: {audioEnabled ? 'ON' : 'OFF'}, Video: {videoEnabled ? 'ON' : 'OFF'})
              </div>
            </div>
            
            {remoteStreams.map(({ userId }, idx) => {
              if (!remoteVideoRefs.current[userId]) {
                remoteVideoRefs.current[userId] = React.createRef();
              }
              return (
                <div key={userId}>
                  <video 
                    ref={remoteVideoRefs.current[userId]} 
                    autoPlay 
                    playsInline 
                    className="video-call-video" 
                  />
                  <div className="video-call-label">
                    Friend {idx + 1} ({userId.slice(0, 8)}...)
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="video-call-controls">
            <button 
              className="video-call-btn share-btn" 
              onClick={handleShareScreen} 
              disabled={isScreenSharing || !!mediaError}
            >
              {isScreenSharing ? 'Sharing...' : 'Share Screen'}
            </button>
            
            <button 
              className="video-call-btn" 
              onClick={handleToggleVideo} 
              disabled={!localStream || !!mediaError}
            >
              {videoEnabled ? 'Stop Video' : 'Start Video'}
            </button>
            
            <button 
              className="video-call-btn" 
              onClick={handleToggleAudio} 
              disabled={!localStream || !!mediaError}
            >
              {audioEnabled ? 'Mute Mic' : 'Unmute Mic'}
            </button>
            
            {!isRecording ? (
              <button 
                className="video-call-btn record-btn" 
                onClick={handleStartRecording} 
                disabled={!!mediaError}
              >
                Record
              </button>
            ) : (
              <button 
                className="video-call-btn stop-record-btn" 
                onClick={handleStopRecording} 
                disabled={!!mediaError}
              >
                Stop Recording
              </button>
            )}
            
            {downloadUrl && (
              <button 
                className="video-call-btn" 
                onClick={handleDownloadRecording}
                style={{ background: '#4caf50' }}
              >
                Download Recording
              </button>
            )}
            
            <button className="video-call-btn end-btn" onClick={handleEndCall}>
              End Call
            </button>
          </div>
          
          <div className="video-call-log">
            <b>Signaling Log:</b>
            <ul>
              {messages.slice(-10).map((msg, i) => <li key={i}>{msg}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
  
export default VideoCall;