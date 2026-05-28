'use client';

/**
 * @fileOverview WebRTC Signaling Service for Shurukkha Hub.
 * Manages the exchange of offers, answers, and ICE candidates via Firestore.
 * This is a critical component for the DEOS Command Center.
 */

import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  getDoc,
  DocumentData
} from 'firebase/firestore';

export class WebRTCManager {
  private sessionId: string;
  private peerConnection: RTCPeerConnection | null = null;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  // Configuration for ICE Servers
  private rtcConfig: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  /**
   * Initialize a new call (Offer side - Citizen App)
   */
  async createCall(localStream: MediaStream, onRemoteStream: (stream: MediaStream) => void) {
    this.peerConnection = new RTCPeerConnection(this.rtcConfig);
    
    localStream.getTracks().forEach(track => {
      this.peerConnection?.addTrack(track, localStream);
    });

    this.peerConnection.ontrack = (event) => {
      onRemoteStream(event.streams[0]);
    };

    const sessionRef = doc(db, 'webrtc_sessions', this.sessionId);
    const candidatesCollection = collection(sessionRef, 'ice_candidates');

    // Collect ICE Candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        addDoc(candidatesCollection, event.candidate.toJSON());
      }
    };

    // Create Offer
    const offerDescription = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    await setDoc(sessionRef, { offer });

    // Listen for Answer
    onSnapshot(sessionRef, (snapshot) => {
      const data = snapshot.data();
      if (!this.peerConnection?.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        this.peerConnection?.setRemoteDescription(answerDescription);
      }
    });

    // Listen for remote ICE candidates
    onSnapshot(candidatesCollection, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          if (data.candidate) {
            this.peerConnection?.addIceCandidate(new RTCIceCandidate(data));
          }
        }
      });
    });
  }

  /**
   * Join an existing call (Answer side - Dispatcher Console)
   */
  async answerCall(localStream: MediaStream, onRemoteStream: (stream: MediaStream) => void) {
    this.peerConnection = new RTCPeerConnection(this.rtcConfig);

    localStream.getTracks().forEach(track => {
      this.peerConnection?.addTrack(track, localStream);
    });

    this.peerConnection.ontrack = (event) => {
      onRemoteStream(event.streams[0]);
    };

    const sessionRef = doc(db, 'webrtc_sessions', this.sessionId);
    const candidatesCollection = collection(sessionRef, 'ice_candidates');

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        addDoc(candidatesCollection, event.candidate.toJSON());
      }
    };

    const sessionSnapshot = await getDoc(sessionRef);
    const sessionData = sessionSnapshot.data();
    
    if (sessionData?.offer) {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(sessionData.offer));

      const answerDescription = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answerDescription);

      const answer = {
        type: answerDescription.type,
        sdp: answerDescription.sdp,
      };

      await updateDoc(sessionRef, { answer });
    }

    // Listen for ICE candidates
    onSnapshot(candidatesCollection, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          this.peerConnection?.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
  }

  dispose() {
    this.peerConnection?.close();
    this.peerConnection = null;
  }
}
