/* eslint-env browser */

window.connectWS = () => {
  const ws = new WebSocket("wss://${env.HOST}/websocket");
  ws.onclose = (currWS, ev) => {
    console.log("WS CLOSE EVENT: ", ev);
  };
  ws.onerror = (currWS, ev) => {
    console.log("WS ERROR EVENT: ", ev);
  };
  ws.onmessage = (message) => {
    pc.setRemoteDescription(JSON.parse(atob(message.data)));
  };
  ws.onopen = (currWS, ev) => {
    console.log("WS OPEN EVENT: ", ev);
  };

  window.ws = ws;
};

window.initMedia = () => {
  window.pc = new RTCPeerConnection({
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302",
      },
    ],
  });
  pc.oniceconnectionstatechange = (e) => {
    console.log("connection state change", pc.iceConnectionState);
  };
  pc.onicecandidate = (event) => {
    if (event.candidate === null) {
      alert("INIT COMPLETE");
      window.SDP = pc.localDescription;
    }
  };

  pc.onnegotiationneeded = (e) =>
    pc
      .createOffer()
      .then((d) => pc.setLocalDescription(d))
      .catch(console.error);

  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    stream.getAudioTracks().forEach((track) => pc.addTrack(track, stream));
    pc.addTransceiver("audio");
    pc.addTransceiver(stream.getAudioTracks()[0], {
      direction: "sendrecv",
      streams: [stream],
    });
  });

  pc.addTransceiver("audio");
  pc.ontrack = (event) => {
    console.log("Got track event", event);
    const audioElem = document.createElement("audio");
    audioElem.srcObject = event.streams[0];
    audioElem.autoplay = true;
  };
};

window.sendSDP = () => {
  const channelId = document.getElementById("channel_id").value;
  if (channelId.length == 0) {
    alert("No Channel ID");
    return;
  }
  window.ws.send(JSON.stringify({ sdp: window.SDP, channelId }));
};
