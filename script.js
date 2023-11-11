/* eslint-env browser */

const pc = new RTCPeerConnection({
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
});

window.initMedia = (publisher = false) => {
  pc.oniceconnectionstatechange = (e) => {
    console.log("connection state change", pc.iceConnectionState);
  };
  pc.onicecandidate = (event) => {
    if (event.candidate === null) {
      alert("INIT COMPLETE");
      window.SDP = btoa(JSON.stringify(pc.localDescription));
    }
  };

  if (publisher) {
    pc.onnegotiationneeded = (e) =>
      pc
        .createOffer()
        .then((d) => pc.setLocalDescription(d))
        .catch(console.error);

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      stream.getAudioTracks().forEach((track) => pc.addTrack(track, stream));
      pc.addTransceiver("audio");
      pc.addTransceiver(stream.getAudioTracks()[0], {
        direction: "sendonly",
        streams: [stream],
      });
    });
  } else {
    pc.addTransceiver("audio");
    pc.onnegotiationneeded = (e) =>
      pc
        .createOffer()
        .then((d) => pc.setLocalDescription(d))
        .catch(console.error);

    pc.ontrack = (event) => {
      console.log("Got track event", event);
      const audioElem = document.createElement("audio");
      audioElem.srcObject = event.streams[0];
      audioElem.autoplay = true;
    };
  }
};

window.sendSDP = (publisher = false) => {
  fetch(`https://${env.HOST}/api?publisher=${publisher}`, {
    headers: {
      "Content-Type": "text/plain",
    },
    method: "POST",
    body: window.SDP,
  })
    .then((r) => r.text())
    .then((answer) => {
      pc.setRemoteDescription(JSON.parse(atob(answer)));
    });
};
