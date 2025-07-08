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

  // Setup socket and join room
  useEffect(() => {
    if (joined && !socket) {
      const s = io(SIGNALING_SERVER_URL);
      setSocket(s);
      s.on('connect', () => {
        setMyId(s.id);
        setMessages(msgs => [...msgs, 'Connected to signaling server.']);
        s.emit('join-room', roomId);
      });
      s.on('all-users', async (users) => {
        setMessages(msgs => [...msgs, `Users in room: ${users.join(', ')}`]);
        await startLocalStream();
        users.slice(0, MAX_PEERS).forEach(async (userId) => {
          await createPeerConnection(userId, true, s);
        });
      });
      s.on('user-joined', async (userId) => {
        setMessages(msgs => [...msgs, `User joined: ${userId}`]);
        await createPeerConnection(userId, false, s);
      });
      s.on('offer', async (data) => {
        const { from, offer } = data;
        setMessages(msgs => [...msgs, `Received offer from ${from}`]);
        await createPeerConnection(from, false, s);
        const pc = peerConnections.current[from];
        if (pc) {
          await pc.setRemoteDescription(new window.RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          s.emit('answer', { roomId, to: from, answer });
        }
      });
      s.on('answer', async (data) => {
        const { from, answer } = data;
        setMessages(msgs => [...msgs, `Received answer from ${from}`]);
        const pc = peerConnections.current[from];
        if (pc) {
          await pc.setRemoteDescription(new window.RTCSessionDescription(answer));
        }
      });
      s.on('ice-candidate', async (data) => {
        const { from, candidate } = data;
        setMessages(msgs => [...msgs, `Received ICE candidate from ${from}`]);
        const pc = peerConnections.current[from];
        if (pc) {
          try {
            await pc.addIceCandidate(new window.RTCIceCandidate(candidate));
          } catch (e) {
            setMessages(msgs => [...msgs, `Error adding ICE candidate from ${from}`]);
          }
        }
      });
      s.on('user-left', (userId) => {
        setMessages(msgs => [...msgs, `User left: ${userId}`]);
        if (peerConnections.current[userId]) {
          peerConnections.current[userId].close();
          delete peerConnections.current[userId];
        }
        setRemoteStreams(streams => streams.filter(s => s.userId !== userId));
      });
      return () => {
        s.disconnect();
      };
    }
    // eslint-disable-next-line
  }, [joined, roomId, socket]);

  // Attach remote streams to video elements
  useEffect(() => {
    remoteStreams.forEach(({ userId, stream }) => {
      if (!remoteVideoRefs.current[userId]) {
        remoteVideoRefs.current[userId] = React.createRef();
      }
      const videoElem = remoteVideoRefs.current[userId].current;
      if (videoElem && videoElem.srcObject !== stream) {
        videoElem.srcObject = stream;
      }
    });
  }, [remoteStreams]);

  // Start local media
  const startLocalStream = async () => {
    if (localStream) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      setMediaError('');
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      setMediaError('Could not access camera/mic. Please allow permissions in your browser and refresh the page.');
      setMessages(msgs => [...msgs, 'Could not access camera/mic.']);
    }
  };

  // Create peer connection for a user
  const createPeerConnection = async (userId, initiator, s) => {
    if (peerConnections.current[userId]) return;
    const pc = new window.RTCPeerConnection({ iceServers: ICE_SERVERS });
    peerConnections.current[userId] = pc;
    // Add local tracks
    if (localStream) {
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    }
    // Handle remote stream
    pc.ontrack = (event) => {
      setRemoteStreams(prev => {
        if (prev.some(s => s.userId === userId)) return prev;
        return [...prev, { userId, stream: event.streams[0] }].slice(0, MAX_PEERS);
      });
    };
    // ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        s.emit('ice-candidate', { roomId, to: userId, candidate: event.candidate });
      }
    };
    // If initiator, create offer
    if (initiator) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      s.emit('offer', { roomId, to: userId, offer });
    }
  };

  const handleJoin = async () => {
    if (!roomId.trim()) return;
    setJoined(true);
    await startLocalStream();
  };

  // End call cleanup
  const handleEndCall = () => {
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
    setMessages(msgs => [...msgs, 'Call ended.']);
    setJoined(false);
    setSocket(null);
    setRemoteStreams([]);
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
      setMessages(msgs => [...msgs, 'Screen sharing failed.']);
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
    setMessages(msgs => [...msgs, 'Recording started.']);
  };

  const handleStopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setMessages(msgs => [...msgs, 'Recording stopped.']);
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
                  <div className="video-call-label">Friend {idx + 1}</div>
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