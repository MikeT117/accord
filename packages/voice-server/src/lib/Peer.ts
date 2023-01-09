import { AccordVoiceWebsocket } from '@accord/common';
import type { Consumer } from 'mediasoup/node/lib/Consumer';
import type { Producer } from 'mediasoup/node/lib/Producer';
import type { MediaKind, RtpCapabilities, RtpParameters } from 'mediasoup/node/lib/RtpParameters';
import type { DtlsParameters, WebRtcTransport } from 'mediasoup/node/lib/WebRtcTransport';

class TransportNotFoundError extends Error {
  constructor(id: string) {
    super(`Transport with ID: ${id} not found`);
  }
}

export class Peer {
  id: string;
  client: AccordVoiceWebsocket;
  transports: Map<string, WebRtcTransport>;
  consumers: Map<string, Consumer>;
  producer: Producer | null;

  constructor(id: string, client: AccordVoiceWebsocket) {
    this.id = id;
    this.client = client;
    this.transports = new Map<string, WebRtcTransport>();
    this.consumers = new Map<string, Consumer>();
    this.producer = null;
  }

  async pauseProducer() {
    return this.producer?.pause();
  }

  async resumeProducer() {
    return this.producer?.resume();
  }

  async pauseConsumer(id: string) {
    return this.consumers.get(id)?.pause();
  }

  async resumeConsumer(id: string) {
    return this.consumers.get(id)?.resume();
  }

  async connectTransport(transportId: string, dtlsParameters: DtlsParameters) {
    await this.getTransport(transportId).connect({ dtlsParameters });
  }

  async createProducer(transportId: string, rtpParameters: RtpParameters, kind: MediaKind) {
    const producer = await this.getTransport(transportId).produce({ kind, rtpParameters });
    this.producer = producer;
    return producer;
  }

  async createConsumer(transportId: string, producerId: string, rtpCapabilities: RtpCapabilities) {
    const consumer = await this.getTransport(transportId).consume({
      producerId,
      rtpCapabilities,
      paused: true,
    });
    this.consumers.set(consumer.id, consumer);
    return {
      consumer,
      params: {
        producerId,
        id: consumer.id,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
        type: consumer.type,
        producerPaused: consumer.producerPaused,
      },
    };
  }

  destroy() {
    this.producer?.close();
    this.consumers.forEach((consumer) => {
      consumer.close();
    });
    this.transports.forEach((transport) => {
      transport.close();
    });
  }

  removeConsumer(consumerId: string) {
    this.consumers.get(consumerId)?.close();
    this.consumers.delete(consumerId);
  }

  removeProducer() {
    this.producer?.close();
    this.producer = null;
  }

  getTransport(id: string) {
    const transport = this.transports.get(id);
    if (!transport) {
      throw new TransportNotFoundError(id);
    }
    return transport;
  }

  addTransport(transport: WebRtcTransport) {
    this.transports.set(transport.id, transport);
  }
}
