import { nanoid } from 'nanoid';
import { AccordOperation, AccordVoiceWebSocketEventMap } from '@accord/common';
import type { AccordWebSocketEventMap, AccordVoiceWebsocketEmitArgs } from '@accord/common';
import { AccordWebsocketError } from './AccordWebsocketError';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EmitCallback = (payload: any) => Promise<void> | void;

type WebSocketClientEmitPayload = {
  id?: string;
} & AccordVoiceWebsocketEmitArgs;

type WebsocketClientOptions = {
  url: string;
  debug?: boolean;
  reconnect?: boolean;
  refreshToken: (() => string) | string;
  onError?: (ev: Event) => void;
  onClose?: (ev: CloseEvent) => void;
  onReconnect?: (tries: number) => void;
  onConnect?: (ev: Event) => void;
  onAuthenticationSuccessHandler?: () => void;
  onAuthenticationFailureHandler?: () => void;
};

class AccordWebsocketClient {
  #_ws?: WebSocket;
  #_url: string;
  #_maxReconnectTries = 5;
  #_reconnectTries = 0;
  #_refreshToken: (() => string) | string;
  #_log = false;
  #_reconnect = false;
  #_reconnectTimeout = 10000;
  #_accordEventhandlerCallbacks = new Map<string | number, EmitCallback>();
  #_accordEventHandlers = new Map<string | number, EmitCallback>();
  #_onCloseHandler?: (ev: CloseEvent) => void;
  #_onConnectHandler?: (ev: Event) => void;
  #_onReconnectHandler?: (tries: number) => void;
  #_onErrorHandler?: (ev: Event) => void;
  #_onAuthenticationSuccessHandler?: () => void;
  #_onAuthenticationFailureHandler?: () => void;

  constructor({
    url,
    refreshToken,
    reconnect = false,
    debug = false,
    onError,
    onClose,
    onReconnect,
    onConnect,
    onAuthenticationFailureHandler,
    onAuthenticationSuccessHandler,
  }: WebsocketClientOptions) {
    this.#_url = url;
    this.#_onErrorHandler = onError;
    this.#_onCloseHandler = onClose;
    this.#_onReconnectHandler = onReconnect;
    this.#_onConnectHandler = onConnect;
    this.#_log = debug;
    this.#_reconnect = reconnect;
    this.#_refreshToken = refreshToken;
    this.#_onAuthenticationSuccessHandler = onAuthenticationSuccessHandler;
    this.#_onAuthenticationFailureHandler = onAuthenticationFailureHandler;
    this.#_connect();
  }

  get CONNECTING() {
    return 0;
  }

  get OPEN() {
    return 1;
  }

  get CLOSING() {
    return 2;
  }

  get CLOSED() {
    return 3;
  }

  get readyState() {
    return this.#_ws?.readyState ?? 3;
  }

  get callbacks() {
    return this.#_accordEventhandlerCallbacks;
  }

  get accordEvenListeners() {
    return this.#_accordEventHandlers;
  }

  #_connect() {
    this.#_logEvents('Event', 'Connect', `Retries: ${this.#_reconnectTries}`);
    if (this.#_reconnectTries >= this.#_maxReconnectTries) {
      throw new AccordWebsocketError('Max retries reached');
    }
    this.#_ws = new WebSocket(this.#_url);
    this.#_addListeners();
    this.#_reconnectTries++;
  }

  #_authenticate() {
    if (!this.#_ws || this.#_ws.OPEN !== this.#_ws.readyState) {
      return;
    }
    this.emit({
      op: AccordOperation.AUTHENTICATE_OP,
      d: {
        refreshToken:
          typeof this.#_refreshToken === 'function' ? this.#_refreshToken() : this.#_refreshToken,
      },
      callback: ({ success }) => {
        if (success && typeof this.#_onAuthenticationSuccessHandler === 'function') {
          this.#_onAuthenticationSuccessHandler();
        }
        if (!success && typeof this.#_onAuthenticationFailureHandler === 'function') {
          this.#_onAuthenticationFailureHandler();
        }
      },
    });
  }

  disconnect() {
    this.#_logEvents('Event', 'Disconnect');
    if (this.#_ws && this.#_ws.readyState === this.OPEN) {
      this.#_ws.close(1000);
    }
  }

  #_handleOpen(ev: Event) {
    this.#_logEvents('Event', 'Open');

    if (this.#_onConnectHandler) {
      this.#_onConnectHandler(ev);
    }

    this.#_authenticate();
    this.#_reconnectTries = 0;
  }

  #_handleMessage(ev: MessageEvent) {
    const parsed = JSON.parse(ev.data);

    this.#_logEvents('Event', 'Message', `op: ${parsed.op}`, 'Payload', parsed);

    const handler =
      this.#_accordEventHandlers.get(parsed.op) ??
      this.#_accordEventhandlerCallbacks.get(parsed.op);

    if (handler) {
      const ret = handler(parsed.d);
      if (typeof ret === 'object' && typeof ret.then === 'function') {
        Promise.resolve(ret);
      }
    }
  }

  #_handleError(ev: Event) {
    if (typeof this.#_onErrorHandler === 'function') {
      this.#_logEvents('Event', 'Error', 'Info', ev);
    }
  }

  #_handleClose(ev: CloseEvent) {
    this.#_logEvents(
      'Event',
      'Close',
      `Code: ${ev.code}`,
      `Clean: ${ev.wasClean}`,
      `Reason: ${ev.reason}`,
    );
    if (typeof this.#_onCloseHandler === 'function') {
      this.#_onCloseHandler(ev);
    }
    this.#_removeListeners();
    if (!ev.wasClean && this.#_reconnect) {
      if (typeof this.#_onReconnectHandler === 'function') {
        this.#_onReconnectHandler(this.#_reconnectTries);
      }
      setTimeout(() => this.#_connect(), this.#_reconnectTimeout);
    }
  }

  #_addListeners() {
    if (!this.#_ws) {
      throw new Error('Websocket undefined');
    }
    this.#_ws.addEventListener('open', (openEvent) => this.#_handleOpen(openEvent));
    this.#_ws.addEventListener('message', (messageEvent) => this.#_handleMessage(messageEvent));
    this.#_ws.addEventListener('error', (errorEvent) => this.#_handleError(errorEvent));
    this.#_ws.addEventListener('close', (closeEvent) => this.#_handleClose(closeEvent));
  }

  #_removeListeners() {
    if (!this.#_ws) {
      throw new Error('Websocket undefined');
    }
    this.#_ws.removeEventListener('open', this.#_handleOpen);
    this.#_ws.removeEventListener('message', this.#_handleMessage);
    this.#_ws.removeEventListener('error', this.#_handleError);
    this.#_ws.removeEventListener('close', this.#_handleClose);
  }

  emit({ callback, ...payload }: WebSocketClientEmitPayload) {
    this.#_logEvents(
      'Event',
      'Emit',
      `Callback: ${typeof callback === 'function'}`,
      'Payload',
      payload,
    );
    this.#_logEvents('Event', 'Emit', 'Payload', payload);
    const cb = typeof callback === 'function';
    const id = payload.id ?? nanoid();

    if (this.#_ws && this.#_ws.readyState === this.OPEN) {
      if (cb) {
        this.#_accordEventhandlerCallbacks.set(id, callback);
      }
      const serializedPayload = JSON.stringify({ ...payload, cb, id });
      this.#_ws.send(serializedPayload);
    } else {
      console.error('Socket undefiend or not open');
    }
  }

  addAccordEventListener<K extends keyof (AccordWebSocketEventMap & AccordVoiceWebSocketEventMap)>(
    op: K,
    handler: (payload: (AccordWebSocketEventMap & AccordVoiceWebSocketEventMap)[K]) => void,
  ) {
    this.#_accordEventHandlers.set(op, handler);
  }

  #_logEvents(...data: unknown[]) {
    if (this.#_log) {
      console.log(data);
    }
  }

  close() {
    this.#_removeListeners();
    this.removeAccordEventListeners();
    this.#_reconnect = false;
    this.#_ws?.close();
  }

  removeAccordEventListeners() {
    this.#_accordEventHandlers = new Map();
  }
}

export { AccordWebsocketClient };
