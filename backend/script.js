function useVoice() {
  const peerConn = new RTCPeerConnection();
  const wsConn = new WebSocket("wss://${env.HOST}/api/websocket");
  wsConn.addEventListener("close", (e) => console.log("WS CLOSE EVENT: ", e));
  wsConn.addEventListener("error", (e) => console.error("WS ERROR EVENT: ", e));

  wsConn.addEventListener("message", (e) => {
    const msg = JSON.parse(e.data);
    switch (msg.event) {
      case "candidate":
        const parsedCandidate = JSON.parse(msg.data);
        peerConn.addIceCandidate(new RTCIceCandidate(parsedCandidate, null, 0));
        break;
      case "offer":
        const parsedOffer = JSON.parse(msg.data);
        peerConn
          .setRemoteDescription(new RTCSessionDescription(parsedOffer))
          .then(() => {
            peerConn.createAnswer({}).then((answer) => {
              const answerString = JSON.stringify(answer);

              wsConn.send(
                JSON.stringify({ event: "answer", data: answerString })
              );
              peerConn.setLocalDescription(answer);
            });
          })
          .catch((e) => {
            console.error(e);
          });
        break;
      default:
        console.log("Well this is awkward!: ", msg.event);
    }
  });

  peerConn.oniceconnectionstatechange = (e) => {
    console.log("ICE CONNECTION STATE CHANGE: ", e);
  };

  peerConn.onconnectionstatechange = (e) => {
    console.log("CONNECTION STATE CHANGE: ", e);
  };

  wsConn.addEventListener("open", (e) => {
    console.log("WS OPEN EVENT: ", e);

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        stream
          .getAudioTracks()
          .forEach((track) => peerConn.addTrack(track, stream));
      })
      .catch((e) => {
        console.error(e);
      });

    peerConn.onicecandidate = (candidate) => {
      if (candidate == null) {
        return;
      }

      wsConn.send(
        JSON.stringify({
          event: "candidate",
          data: JSON.stringify(candidate),
        })
      );
    };

    peerConn.ontrack = (e) => {
      console.log("EVENT ONTRACK - KIND & STREAM: ", {
        kind: e.track.kind,
        streams: e.streams,
      });
      if (e.track.kind == "audio") {
        const audioElem = document.getElementById("audio");
        audioElem.srcObject = e.streams[0];
      }
    };
  });
}

document
  .getElementById("btn-use-voice")
  .addEventListener("click", () => useVoice());
