/* eslint-env browser */
var log = (msg) => {
  document.getElementById("logs").innerHTML += msg + "<br>";
};

window.createSession = (isPublisher) => {
  let pc = new RTCPeerConnection({
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302",
      },
    ],
  });
  pc.oniceconnectionstatechange = (e) => log(pc.iceConnectionState);
  pc.onicecandidate = (event) => {
    if (event.candidate === null) {
      console.log({ sdp: pc.localDescription });
      window.sdp = pc.localDescription;
    }
  };

  if (isPublisher) {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        document.getElementById("audio1").srcObject = stream;
        pc.createOffer()
          .then((d) => pc.setLocalDescription(d))
          .catch(log);
      })
      .catch(log);
  } else {
    pc.addTransceiver("audio");
    pc.createOffer()
      .then((d) => pc.setLocalDescription(d))
      .catch(log);

    pc.ontrack = function (event) {
      var el = document.getElementById("audio1");
      el.srcObject = event.streams[0];
      el.autoplay = true;
      el.controls = true;
    };
  }

  window.startSession = () => {
    let sd = document.getElementById("remoteSessionDescription").value;
    if (sd === "") {
      return alert("Session Description must not be empty");
    }

    try {
      pc.setRemoteDescription(JSON.parse(atob(sd)));
    } catch (e) {
      alert(e);
    }
  };

  window.sendSDP = () => {
    fetch("/api", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: btoa(JSON.stringify(window.sdp)),
    })
      .then((r) => console.log(r.json()))
      .catch((e) => {
        console.log({ e });
      });
  };

  let btns = document.getElementsByClassName("createSessionButton");
  for (let i = 0; i < btns.length; i++) {
    btns[i].style = "display: none";
  }

  document.getElementById("signalingContainer").style = "display: block";
};
