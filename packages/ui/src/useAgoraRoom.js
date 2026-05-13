"use client";
import { useState, useEffect, useRef } from 'react';

const APP_ID = "c91f14c4aada4e92854558c5da360dae"; 

export const useAgoraRoom = (channelName, userName, roomMode) => {
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [activePeers, setActivePeers] = useState([]);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  // 👉 ADDED: State to track the integer UID
  const [localUid, setLocalUid] = useState(null); 
  
  const clientRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const initAgora = async () => {
      if (!channelName) return;

      try {
        const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
        const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        clientRef.current = client;

        client.on("user-published", async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          if (mediaType === "audio") {
            user.audioTrack.play();
          }
        });

        client.on("user-joined", (user) => {
          if (isMounted) setActivePeers((prev) => [...prev, user]);
        });

        client.on("user-left", (user) => {
          if (isMounted) setActivePeers((prev) => prev.filter((u) => u.uid !== user.uid));
        });

        // 👉 FIX: Capture the UID and save it to state
        const uid = await client.join(APP_ID, channelName, null, null);
        if (isMounted) setLocalUid(uid);

        // 👉 FIX: Maximum quality and lag-reduction config
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
          encoderConfig: "high_quality",
          AEC: true, 
          ANS: true, 
          AGC: true  
        });
        
        if (roomMode === 'simulation') {
          await audioTrack.setMuted(true);
          if (isMounted) setIsMicMuted(true);
        }

        await client.publish([audioTrack]);
        
        if (isMounted) {
          setLocalAudioTrack(audioTrack);
          setIsConnected(true);
        }

      } catch (error) {
        console.error("Agora Initialization Failed:", error);
      }
    };

    initAgora();

   return () => {
      isMounted = false;
      if (localAudioTrack) {
        localAudioTrack.stop();
        localAudioTrack.close();
      }
      if (clientRef.current) {
        // 👉 ADDED: Strip all listeners so hot-reloads don't leave ghosts
        clientRef.current.removeAllListeners(); 
        clientRef.current.leave();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName]);

  const toggleMic = async () => {
    if (roomMode === 'simulation') {
      alert("System Protocol: Microphones are strictly disabled during Exam Simulations to maintain test integrity.");
      return;
    }
    if (localAudioTrack) {
      const newState = !isMicMuted;
      await localAudioTrack.setMuted(newState);
      setIsMicMuted(newState);
    }
  };

  // 👉 ADDED: localUid exported
  return { isConnected, activePeers, isMicMuted, toggleMic, localUid }; 
};