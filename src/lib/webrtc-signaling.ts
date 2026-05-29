'use client';

/**
 * @fileOverview Overhauled WebRTC Signaling Service for Shurukkha Hub.
 * Optimized Phase 31.8: Implements Bi-directional Track Propagation.
 * Ensures reliable remote stream reception for both Offerer and Answerer.
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
} from 'firebase/firestore';

export class WebRTCManager {
  private sessionId: string;
  private peerConnection: RTCPeerConnection | null = null;
  private candidateQueue: RTCIceCandidateInit[] = [];
  private isProcessingRemoteDescription = false;
  private remoteStream: MediaStream = new MediaStream();

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  private rtcConfig: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
    ],
  };

  private async addCandidate(candidate: RTCIceCandidateInit) {
    if (this.peerConnection && this.peerConnection.remoteDescription) {
      try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.warn("[WebRTC] Error adding candidate", e);
      }
    } else {
      this.candidateQueue.push(candidate);
    }
  }

  private async flushCandidates() {
    if (!this.peerConnection || !this.peerConnection.remoteDescription) return;
    while (this.candidateQueue.length > 0) {
      const candidate = this.candidateQueue.shift();
      if (candidate) {
        try {
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.warn("[WebRTC] Error flushing candidate", e);
        }
      }
    }
  }

  /**
   * Initialize a new call (Offerer / Caller side)
   */
  async createCall(localStream: MediaStream, onRemoteStream: (stream: MediaStream) => void) {
    this.peerConnection = new RTCPeerConnection(this.rtcConfig);
    
    // Set up ontrack immediately
    this.peerConnection.ontrack = (event) => {
      console.log("[WebRTC] Track received on Caller side");
      event.streams[0].getTracks().forEach((track) => {
        this.remoteStream.addTrack(track);
      });
      onRemoteStream(this.remoteStream);
    };

    // Add local tracks
    localStream.getTracks().forEach(track => {
      this.peerConnection?.addTrack(track, localStream);
    });

    const sessionRef = doc(db, 'webrtc_sessions', this.sessionId);
    const candidatesCollection = collection(sessionRef, 'ice_candidates');

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        addDoc(candidatesCollection, { ...event.candidate.toJSON(), owner: 'caller' });
      }
    };

    // Create and set local description
    const offerDescription = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    await setDoc(sessionRef, { offer }, { merge: true });

    // Listen for Answer
    onSnapshot(sessionRef, async (snapshot) => {
      const data = snapshot.data();
      if (!this.peerConnection || this.isProcessingRemoteDescription) return;

      if (data?.answer && this.peerConnection.signalingState === 'have-local-offer') {
        this.isProcessingRemoteDescription = true;
        try {
          const answerDescription = new RTCSessionDescription(data.answer);
          await this.peerConnection.setRemoteDescription(answerDescription);
          console.log("[WebRTC] Answer set on Caller side");
          await this.flushCandidates();
        } catch (e) {
          console.error("[WebRTC] Failed to set remote answer", e);
        } finally {
          this.isProcessingRemoteDescription = false;
        }
      }
    });

    // Listen for candidates
    onSnapshot(candidatesCollection, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          if (data.owner !== 'caller') {
            this.addCandidate(data as RTCIceCandidateInit);
          }
        }
      });
    });
  }

  /**
   * Join an existing call (Answerer / Recipient side)
   */
  async answerCall(localStream: MediaStream, onRemoteStream: (stream: MediaStream) => void) {
    this.peerConnection = new RTCPeerConnection(this.rtcConfig);

    // Set up ontrack immediately
    this.peerConnection.ontrack = (event) => {
      console.log("[WebRTC] Track received on Recipient side");
      event.streams[0].getTracks().forEach((track) => {
        this.remoteStream.addTrack(track);
      });
      onRemoteStream(this.remoteStream);
    };

    // Add local tracks before answering
    localStream.getTracks().forEach(track => {
      this.peerConnection?.addTrack(track, localStream);
    });

    const sessionRef = doc(db, 'webrtc_sessions', this.sessionId);
    const candidatesCollection = collection(sessionRef, 'ice_candidates');

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        addDoc(candidatesCollection, { ...event.candidate.toJSON(), owner: 'recipient' });
      }
    };

    const sessionSnapshot = await getDoc(sessionRef);
    const sessionData = sessionSnapshot.data();
    
    if (sessionData?.offer) {
      try {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(sessionData.offer));
        console.log("[WebRTC] Offer set on Recipient side");

        const answerDescription = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answerDescription);

        const answer = {
          type: answerDescription.type,
          sdp: answerDescription.sdp,
        };

        await updateDoc(sessionRef, { answer });
        await this.flushCandidates();
      } catch (e) {
        console.error("[WebRTC] Failed to set offer or create answer", e);
      }
    }

    // Listen for candidates
    onSnapshot(candidatesCollection, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          if (data.owner !== 'recipient') {
            this.addCandidate(data as RTCIceCandidateInit);
          }
        }
      });
    });
  }

  dispose() {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.candidateQueue = [];
    this.isProcessingRemoteDescription = false;
    this.remoteStream = new MediaStream();
  }
}
