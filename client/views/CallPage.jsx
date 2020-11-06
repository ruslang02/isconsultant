import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components'
import { Button } from '../components/Button';
const { RTCPeerConnection, RTCSessionDescription } = window;

const Page = styled.section`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;
const VideoContainer = styled.div`
  flex-grow: 1;
  background: linear-gradient(90deg, rgba(54,54,55,1) 0%, rgba(82,57,120,1) 100%);
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const ActionsBar = styled.footer`
  flex-shrink: 0;
  padding: 1rem 0;
  background: white;
  box-shadow: 0px 2px 15px rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
`;
const VideoComponent = styled.div`
  border-radius: 15px;
  box-shadow: 0px 2px 20px rgba(0, 0, 0, 0.25);
  width: 320px;
  // height: 180px;
  background: dodgerblue;
  overflow: hidden;
  display: flex;
  margin: 2rem;
  video {
    width: 100%;
  }
`

const peerConnection = new RTCPeerConnection();

function Video({ stream }) {
  const video = useRef()
  useEffect(() => {
    video.current.srcObject = stream
    video.current.autoplay = true;
    video.current.muted = true;
  }, []);
  return (
    <VideoComponent>
      <video ref={video} />
    </VideoComponent>
  )
}

export function CallPage() {
  const [streams, setStreams] = useState([]);
  useEffect(() => {
    peerConnection.addEventListener('track', (ev) => {
      setStreams(ev.streams);
    });
    navigator.getUserMedia({
      video: true,
      audio: true,
    }, (stream) => {
      setStreams([...streams, stream]);
    }, console.error);
  }, []);
  return (
    <Page>
      <VideoContainer>
        {streams.map((stream) => (<Video stream={stream} />))}
      </VideoContainer>
      <ActionsBar>
        <Button>Disconnect</Button>
      </ActionsBar>
    </Page>
  )
}