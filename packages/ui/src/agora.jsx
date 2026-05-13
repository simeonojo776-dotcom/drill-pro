"use client"; // 👉 CRITICAL for Next.js: Tells the server not to run this browser-only code

import AgoraRTC from "agora-rtc-sdk-ng";

// Initialize the Agora Client
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

// Your specific App ID
const APP_ID = "c91f14c4aada4e92854558c5da360dae"; 

// 👉 MUST have 'export const' here
export const joinVoiceChannel = async (channelName, userName, onUserJoined, onUserLeft) => {
  // Listen for when someone else speaks
  client.on("user-published", async (user, mediaType) => {
    await client.subscribe(user, mediaType);
    if (mediaType === "audio") {
      user.audioTrack.play(); 
    }
  });

  // Listen for entering/leaving
  client.on("user-joined", (user) => {
    if (onUserJoined) onUserJoined(user); 
  });

  client.on("user-left", (user) => {
    if (onUserLeft) onUserLeft(user);
  });

  // Join the room using your session ID
  const uid = await client.join(APP_ID, channelName, null, userName);

  // Turn on the local microphone and broadcast
  const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
  await client.publish([localAudioTrack]);

  return { localAudioTrack, uid, client };
};

// 👉 MUST have 'export const' here
export const leaveVoiceChannel = async (localTrack) => {
  if (localTrack) {
    localTrack.stop(); 
    localTrack.close(); 
  }
  await client.leave(); 
};