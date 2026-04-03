// src/components/VideoCall.js

import React, { useEffect, useRef } from 'react'
import { useSocket } from '../context/SocketContext'

const VideoCall = ({ sessionId }) => {
  const socket = useSocket()

  const localRef = useRef(null)
  const remoteRef = useRef(null)

  const peerRef = useRef(null)
  const streamRef = useRef(null)

  /* ───────── INIT MEDIA ───────── */
  useEffect(() => {
    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })

        streamRef.current = stream

        if (localRef.current) {
          localRef.current.srcObject = stream
        }

        createPeer(stream)

      } catch (err) {
        console.log("❌ Media error:", err)
      }
    }

    init()
  }, [])

  /* ───────── CREATE PEER ───────── */
  const createPeer = (stream) => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    })

    peerRef.current = peer

    stream.getTracks().forEach(track => {
      peer.addTrack(track, stream)
    })

    peer.ontrack = (e) => {
      if (remoteRef.current) {
        remoteRef.current.srcObject = e.streams[0]
      }
    }

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit('ice-candidate', {
          sessionId,
          candidate: e.candidate
        })
      }
    }
  }

  /* ───────── START CALL ───────── */
  const startCall = async () => {
    if (!peerRef.current) return

    const offer = await peerRef.current.createOffer()
    await peerRef.current.setLocalDescription(offer)

    socket.emit('video-offer', { sessionId, offer })
  }

  /* ───────── SOCKET EVENTS ───────── */
  useEffect(() => {
    if (!socket) return

    socket.on('video-offer', async ({ offer }) => {
      await peerRef.current.setRemoteDescription(offer)

      const answer = await peerRef.current.createAnswer()
      await peerRef.current.setLocalDescription(answer)

      socket.emit('video-answer', { sessionId, answer })
    })

    socket.on('video-answer', async ({ answer }) => {
      await peerRef.current.setRemoteDescription(answer)
    })

    socket.on('ice-candidate', async ({ candidate }) => {
      try {
        await peerRef.current.addIceCandidate(candidate)
      } catch (err) {
        console.log("❌ ICE error:", err)
      }
    })

    return () => {
      socket.off('video-offer')
      socket.off('video-answer')
      socket.off('ice-candidate')
    }

  }, [socket])

  /* ───────── CLEANUP (VERY IMPORTANT) ───────── */
  useEffect(() => {
    return () => {
      console.log("🧹 Cleaning video call")

      peerRef.current?.close()

      streamRef.current?.getTracks().forEach(track => {
        track.stop()
      })
    }
  }, [])

  /* ───────── UI ───────── */
  return (
    <div style={styles.container}>
      
      <div style={styles.videoWrapper}>
        <video ref={remoteRef} autoPlay style={styles.remote} />
        <video ref={localRef} autoPlay muted style={styles.local} />
      </div>

      <button onClick={startCall} style={styles.btn}>
        📞 Start Call
      </button>

    </div>
  )
}

export default VideoCall

/* ───────── STYLES ───────── */
const styles = {
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: '#020617',
    padding: '6px'
  },

  videoWrapper: {
    flex: 1,
    position: 'relative'
  },

  remote: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '8px',
    background: '#000'
  },

  local: {
    position: 'absolute',
    width: '90px',
    bottom: 10,
    right: 10,
    borderRadius: '8px',
    border: '2px solid #fff'
  },

  btn: {
    marginTop: '6px',
    padding: '8px',
    borderRadius: '8px',
    border: 'none',
    background: '#4f46e5',
    color: '#fff',
    cursor: 'pointer'
  }
}