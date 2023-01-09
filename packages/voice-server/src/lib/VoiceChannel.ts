import type { Router } from 'mediasoup/node/lib/Router';
import type { MediaKind, RtpCapabilities, RtpParameters } from 'mediasoup/node/lib/RtpParameters';
import type { DtlsParameters } from 'mediasoup/node/lib/WebRtcTransport';
import type { Worker } from 'mediasoup/node/lib/Worker';
import { AccordRTCOperation, AccordRTCOperations } from '@accord/common';
import type { AccordVoiceWebsocket } from '@accord/common';
import { Peer } from './Peer';
import type { Producer } from 'mediasoup/node/lib/Producer';

class PeerNotFoundError extends Error {
  constructor(id: string) {
    super(`Peer with ID: ${id} not found`);
  }
}

class NotConsumableError extends Error {
  constructor() {
    super('Producer cannot be consumed');
  }
}

class CreatePeerIDNullError extends Error {
  constructor() {
    super('ID cannot be null');
  }
}

export class VoiceChannel {
  id!: string;
  guildId!: string;
  defaultGuildRoleId!: string;
  worker!: Worker;
  router!: Router;
  peers!: Map<string, Peer>;

  constructor(id: string, guildId: string, defaultGuildRoleId: string, worker: Worker) {
    console.log('Voice channel created: ', { id, guildId });
    this.id = id;
    this.guildId = guildId;
    this.defaultGuildRoleId = defaultGuildRoleId;
    this.worker = worker;
    this.peers = new Map<string, Peer>();
  }

  async createRouter() {
    this.router = await this.worker.createRouter({
      mediaCodecs: [
        {
          kind: 'audio',
          mimeType: 'audio/opus',
          clockRate: 48000,
          channels: 2,
          rtcpFeedback: [{ type: 'transport-cc' }],
        },
      ],
    });
  }

  async createTransport(id: string) {
    const transport = await this.router.createWebRtcTransport({
      listenIps: [
        {
          ip: '0.0.0.0',
          announcedIp: '192.168.0.246',
        },
      ],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    });

    this.getPeer(id).addTransport(transport);

    return {
      params: {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
      },
    };
  }

  async connectTransport(id: string, transportId: string, dtlsParameters: DtlsParameters) {
    await this.getPeer(id).connectTransport(transportId, dtlsParameters);
  }

  async produce(id: string, transportId: string, rtpParameters: RtpParameters, kind: MediaKind) {
    const producer = await this.getPeer(id).createProducer(transportId, rtpParameters, kind);

    producer.on('transportclose', () => {
      this.closeProducer(id);
    });

    this.broadcastToPeers({
      op: AccordRTCOperation.PRODUCER_JOINED,
      d: { id, producerId: producer.id },
      excludeId: id,
    });

    return producer.id;
  }

  async consume(
    id: string,
    transportId: string,
    producerId: string,
    rtpCapabilities: RtpCapabilities,
  ) {
    if (!this.router.canConsume({ producerId, rtpCapabilities })) {
      throw new NotConsumableError();
    }

    const consumerPeer = this.getPeer(id);
    const producerPeer = this.getPeerByProducerId(producerId);

    if (!producerPeer) {
      throw new NotConsumableError();
    }

    const { consumer, params } = await consumerPeer.createConsumer(
      transportId,
      producerId,
      rtpCapabilities,
    );

    consumer.on('transportclose', () => {
      consumerPeer.removeConsumer(consumer.id);
    });

    return { ...params, userId: producerPeer.id };
  }

  closeProducer(id: string) {
    this.getPeer(id).removeProducer();
  }

  async createPeer(client: AccordVoiceWebsocket) {
    if (!client.id) {
      throw new CreatePeerIDNullError();
    }
    const peer = this.peers.get(client.id);
    if (!peer) {
      this.peers.set(client.id, new Peer(client.id, client));
    }
  }

  getPeer(id: string) {
    const peer = this.peers.get(id);
    if (!peer) {
      throw new PeerNotFoundError(id);
    }
    return peer;
  }

  getPeerByProducerId(producerId: string) {
    let peer: Peer | null = null;
    this.peers.forEach((p) => {
      if (p.producer?.id === producerId) {
        peer = p;
      }
    });
    return peer as Peer | null;
  }

  async removePeer(id: string) {
    const peer = this.peers.get(id);
    peer?.destroy();
    this.peers.delete(id);
  }

  getProducerIds(peerId: string) {
    const producerIds: string[] = [];
    this.peers.forEach((peer) => {
      if (peer.id !== peerId) {
        if (peer.producer?.id) {
          producerIds.push(peer.producer.id);
        }
      }
    });
    return producerIds;
  }

  getPeerIds() {
    const peerIds: string[] = [];
    this.peers.forEach((peer) => {
      peerIds.push(peer.id);
    });
    return peerIds;
  }

  broadcastToPeers({
    d,
    op,
    excludeId,
  }: {
    op: AccordRTCOperations;
    d: unknown;
    excludeId?: string;
  }) {
    this.peers.forEach((peer) => {
      if (peer.id !== excludeId) {
        this.sendToPeer({ peer, op, d });
      }
    });
  }

  sendToPeer({ peer, d, op }: { peer: Peer; op: AccordRTCOperations; d: unknown }) {
    peer.client.send(JSON.stringify({ op, d }));
  }

  getPeersTransports() {
    const peerTransports: { id: string; transports: number }[] = [];
    this.peers.forEach((peer) => {
      peerTransports.push({ id: peer.id, transports: peer.transports.size });
    });
    return peerTransports;
  }

  getPeersConsumers() {
    const peerConsumers: { id: string; consumers: number }[] = [];
    this.peers.forEach((peer) => {
      peerConsumers.push({ id: peer.id, consumers: peer.consumers.size });
    });
    return peerConsumers;
  }

  getPeersProducers() {
    const peerProducers: { id: string; producer: Producer }[] = [];
    this.peers.forEach((peer) => {
      if (peer.producer) {
        peerProducers.push({ id: peer.id, producer: peer.producer });
      }
    });
    return peerProducers;
  }

  getPeersInfo() {
    return {
      transports: this.getPeersTransports(),
      consumers: this.getPeersConsumers(),
      producers: this.getPeersProducers(),
    };
  }
}
