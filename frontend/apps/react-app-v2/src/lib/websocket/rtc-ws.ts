import { websocket, type AccordWebsocket } from "./websocket";
import * as root from "../protobuf/gen/proto-bundle";
import {
    rtcCandidateSchema,
    rtcSessionDescriptionSchema,
    type RTCCandidateType,
} from "../zod-validation/webrtc-schema";
import { WEBRTC_SDP_TYPE } from "../constants";
import { tokenStoreActions, tokenStoreState } from "../zustand/stores/token-store";
import { rtcStoreActions } from "../zustand/stores/rtc-store";

function createWebRTCEventPayload(payload: root.pb.IWebRTCEvent) {
    return root.pb.WebRTCEvent.encode(root.pb.WebRTCEvent.create(payload)).finish();
}

export const accordVoiceController = (() => {
    let ws: AccordWebsocket | null = null;
    let peer: RTCPeerConnection | null = null;
    let audio: HTMLAudioElement | null = null;

    let tracks: Map<string, string> = new Map<string, string>();
    let pendingICECandidates: RTCCandidateType[] = [];

    async function createPeerConnection() {
        rtcStoreActions.setRTCState("connecting");

        peer = new RTCPeerConnection();
        audio = new Audio();

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getAudioTracks().forEach((track) => {
            // non-null assertion: 'peer' will be initialised at this point
            peer!.addTrack(track, stream);
        });

        peer.addEventListener("icecandidate", ({ candidate }) => {
            if (!ws || !candidate) {
                return;
            }

            ws.send(
                createWebRTCEventPayload({
                    op: root.pb.WebRTCOpCode.WEBRTC_ICE_CANDIDATE,
                    ver: 0,
                    webrtcIceCandidate: root.pb.WebRTCICECandidate.create({
                        ver: 0,
                        ...candidate,
                        candidate: candidate.candidate,
                        sdpMLineIndex: candidate.sdpMLineIndex,
                        sdpMid: candidate.sdpMid,
                        usernameFragment: candidate.usernameFragment,
                    }),
                }),
            );
        });

        peer.addEventListener("track", ({ track, streams }) => {
            if (!audio || track.kind !== "audio" || !streams.length) {
                return;
            }

            track.onmute = () => console.log(`RTC Track Mute Event - ID: ${track.id} - Muted: ${track.muted}`);
            track.onunmute = () => console.log(`RTC Track Mute Event - ID: ${track.id} - Muted: ${track.muted}`);

            audio.srcObject = streams[0];
            tracks.set(streams[0].id, track.id);
            audio.setAttribute("autoplay", "true");
        });

        peer.addEventListener("connectionstatechange", () => {
            // non-null assertion: 'peer' will be initialised at this point as we're adding a listener
            rtcStoreActions.setRTCState(peer!.connectionState);
        });
    }

    function toggleSelfMute() {
        if (!ws || !audio || !peer || peer.connectionState !== "connected") {
            return;
        }

        const senders = peer.getSenders();
        if (!senders.length || !senders[0].track) {
            return;
        }

        senders[0].track.enabled = !senders[0].track.enabled;

        ws.send(
            createWebRTCEventPayload({
                op: root.pb.WebRTCOpCode.WEBRTC_SELF_MUTE,
                ver: 0,
                webrtcSelfUpdate: root.pb.WebRTCSelfUpdate.create({
                    ver: 0,
                    selfMute: senders[0].track.enabled,
                    selfDeaf: audio.muted,
                }),
            }),
        );
    }

    function toggleNonSelfMute(id: string) {
        if (!ws || !audio || !peer || peer.connectionState !== "connected") {
            return;
        }

        const trackId = tracks.get(id);
        if (!trackId) {
            return;
        }

        peer.getReceivers().forEach((r) => {
            if (r.track.id !== trackId) {
                return;
            }
            r.track.enabled = !r.track.enabled;
        });
    }

    async function handleIceCandidate(payload: root.pb.IWebRTCICECandidate) {
        try {
            const data = rtcCandidateSchema.parse(payload);

            if (!peer || !peer.remoteDescription) {
                pendingICECandidates.push(data);
                return;
            }

            await peer.addIceCandidate(new RTCIceCandidate(data));
        } catch (e) {
            console.error(e);
        }
    }

    async function handleSessionDescription(sdp: root.pb.IWebRTCSessionDescription) {
        try {
            if (!ws) {
                return;
            }

            if (!peer) {
                await createPeerConnection();
            }

            const sessionDescription = rtcSessionDescriptionSchema.parse(sdp);
            // non-null assertion: 'peer' is initialised above if not already, it will throw on error,
            // this code will not be executed if peer is not initialised
            await peer!.setRemoteDescription(new RTCSessionDescription(sessionDescription));

            if (sdp.type === WEBRTC_SDP_TYPE.ANSWER) {
                return;
            }

            // non-null assertion: 'peer' is initialised above if not already, it will throw on error,
            // this code will not be executed if peer is not initialised
            await Promise.allSettled(pendingICECandidates.map((c) => peer!.addIceCandidate(new RTCIceCandidate(c))));
            pendingICECandidates = [];

            // non-null assertion: 'peer' is initialised above if not already, it will throw on error,
            // this code will not be executed if peer is not initialised
            const answer = await peer!.createAnswer();
            await peer!.setLocalDescription(answer);

            ws.send(
                createWebRTCEventPayload({
                    op: root.pb.WebRTCOpCode.WEBRTC_SESSION_DESCRIPTION,
                    ver: 0,
                    webrtcSessionDescription: root.pb.WebRTCSessionDescription.create({
                        ver: 0,
                        sdp: answer.sdp,
                        type: answer.type,
                    }),
                }),
            );
        } catch (e) {
            console.error(e);
        }
    }

    async function incomingEventHandler(buffer: ArrayBuffer) {
        const payload = root.pb.WebRTCEvent.decode(new Uint8Array(buffer));

        switch (payload.op) {
            case root.pb.WebRTCOpCode.WEBRTC_ICE_CANDIDATE: {
                if (!payload.webrtcIceCandidate) {
                    return;
                }
                await handleIceCandidate(payload.webrtcIceCandidate);
                break;
            }
            case root.pb.WebRTCOpCode.WEBRTC_SESSION_DESCRIPTION: {
                if (!payload.webrtcSessionDescription) {
                    return;
                }
                await handleSessionDescription(payload.webrtcSessionDescription);
                break;
            }
            default:
                console.error(`unknown op code ${payload.op}, ignoring`);
        }
    }

    function joinVoiceChannel(guildId: string, channelId: string) {
        if (ws || peer) {
            return;
        }

        ws = websocket();
        ws.loadConfig({
            endpoint: "wss://accord.razor116.com/rtc",
            log: true,
            retries: 5,
            retry: true,
            onInvalidSession: tokenStoreActions.reset,
            identify: () =>
                createWebRTCEventPayload({
                    op: root.pb.WebRTCOpCode.WEBRTC_IDENTIFY,
                    ver: 0,
                    webrtcIdentify: root.pb.WebRTCIdentify.create({
                        ver: 0,
                        token: tokenStoreState().refreshtoken,
                        guildId,
                        channelId,
                    }),
                }),
            onMessage: incomingEventHandler,
        });

        ws.connect();
    }

    function leaveVoiceChannel() {
        if (audio) {
            audio.pause();
            audio.srcObject = null;
            audio = null;
        }

        if (tracks.size) {
            tracks.clear();
        }

        if (peer && peer.connectionState !== "closed") {
            peer.getSenders().forEach((sender) => sender.track?.stop());
            peer.close();
        }

        if (ws) {
            ws.shutdown();
        }

        ws = null;
        peer = null;

        rtcStoreActions.setRTCState("closed");
    }

    return {
        joinVoiceChannel,
        leaveVoiceChannel,
        toggleNonSelfMute,
        toggleSelfMute,
    };
})();
