import { useSessionStore } from '@/shared-stores/sessionStore';
import { toastStore } from '@/shared-components/Toast';
import { RTC_WEBSOCKET_ENDPOINT } from '../../../constants';
import { useCallback, useEffect, useRef } from 'react';
import { AccordWebsocketClient } from '../../../lib/websocketClient/AccordWebsocketClient';
import { useI18nContext } from '../../../i18n/i18n-react';

const state: {
    guildId: string | null;
    channelId: string | null;
    wConn: AccordWebsocketClient | null;
    pConn: RTCPeerConnection | null;
    trackAssociations: Map<string, string>;
} = {
    guildId: null,
    channelId: null,
    wConn: null,
    pConn: null,
    trackAssociations: new Map<string, string>(),
};

export const useAccordVoice = (userId: string) => {
    const { LL } = useI18nContext();
    const audioElemRef = useRef<HTMLAudioElement>(null);

    const joinVoiceChannel = (channelId: string, guildId: string) => {
        state.pConn = new RTCPeerConnection();
        state.channelId = channelId;
        state.guildId = guildId;

        state.wConn = new AccordWebsocketClient({
            url: RTC_WEBSOCKET_ENDPOINT,
            identifyPayload: () => ({
                accesstoken: useSessionStore.getState().accesstoken.split(' ')[1],
                refreshtoken: useSessionStore.getState().refreshtoken,
                channelId,
                guildId,
            }),
            onError: (e) => {
                state.pConn?.close();
                console.error('WS ERROR EVENT: ', e);
                toastStore.create({
                    title: LL.Toasts.Titles.VoiceConnectionClosed(),
                    type: 'ERROR',
                });
            },
            onClose: (e) => {
                state.pConn?.close();
                console.log('WS CLOSE EVENT: ', e);
                toastStore.create({
                    title: LL.Toasts.Titles.VoiceConnectionClosed(),
                    type: 'ERROR',
                });
            },
            debug: false,
            reconnect: true,
        });

        state.wConn.addAccordEventListener<RTCIceCandidateInit>('CANDIDATE', (candidate) => {
            if (!state.pConn) {
                return;
            }

            state.pConn.addIceCandidate(new RTCIceCandidate(candidate));
        });

        state.wConn.addAccordEventListener<RTCSessionDescriptionInit>('OFFER', (offer) => {
            if (!state.pConn) {
                return;
            }

            state.pConn
                ?.setRemoteDescription(new RTCSessionDescription(offer))
                .then(() => {
                    state.pConn?.createAnswer({}).then((answer) => {
                        state.wConn?.emit<{ answer: RTCSessionDescriptionInit }>({
                            op: 'ANSWER',
                            d: { answer },
                        });

                        state.pConn?.setLocalDescription(answer);
                    });
                })
                .catch((e) => {
                    console.error('WEBRTC ERROR EVENT: ', e);

                    state.pConn?.close();
                    state.wConn?.close();

                    toastStore.create({
                        title: LL.Toasts.Descriptions.VoiceConnectionError(),
                        type: 'ERROR',
                        description: LL.Toasts.Descriptions.VoiceConnectionError(),
                        duration: Infinity,
                    });
                });
        });

        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((stream) => {
                stream.getAudioTracks().forEach((track) => {
                    state.pConn?.addTrack(track, stream);
                });
            })
            .catch((e) => {
                console.error(e);

                toastStore.create({
                    title: LL.Toasts.Titles.UnableToAccessMicrophone(),
                    type: 'ERROR',
                    duration: Infinity,
                });
            });

        state.pConn.onicecandidate = (candidate) => {
            if (candidate == null || !state.wConn) {
                return;
            }

            state.wConn.emit<{ candidate: RTCPeerConnectionIceEvent }>({
                op: 'CANDIDATE',
                d: { candidate },
            });
        };

        state.pConn.ontrack = (e) => {
            if (e.track.kind !== 'audio' || !audioElemRef.current) {
                return;
            }

            state.trackAssociations.set(e.streams[0].id, e.track.id);
            audioElemRef.current.srcObject = e.streams[0];
        };
    };

    const selfMute = () => {
        const track = state.pConn?.getSenders()[0].track;

        if (!track || !state.wConn) {
            return;
        }

        state.wConn.emit({
            op: 'SELF_MUTE',
            d: { selfMute: track.enabled },
        });

        track.enabled = !track.enabled;
    };

    const mute = (userId: string) => {
        const trackId = state.trackAssociations.get(userId);

        if (!trackId) {
            return;
        }

        state.pConn?.getReceivers().forEach((s) => {
            if (s.track.id === trackId) {
                s.track.enabled = !s.track.enabled;
            }
        });
    };

    const leaveVoiceChannel = () => {
        state.wConn?.close();
        state.pConn?.close();
        state.guildId = null;
        state.channelId = null;
        state.wConn = null;
        state.pConn = null;
    };

    const AccordAudio = useCallback(() => <audio ref={audioElemRef} autoPlay />, []);

    useEffect(() => {
        return leaveVoiceChannel;
    }, []);

    return {
        currentUserId: userId,
        joinVoiceChannel,
        leaveVoiceChannel,
        AccordAudio,
        selfMute,
        mute,
    };
};
