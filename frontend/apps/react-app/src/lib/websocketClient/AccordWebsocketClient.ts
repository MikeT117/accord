import { nanoid } from 'nanoid';
import { AccordWebsocketError } from './AccordWebsocketError';

type EmitCallback = (payload: any) => Promise<void> | void;

type WebSocketClientEmitPayload<T = any, R = never> = {
  id?: string;
  callback?: (payload: R) => Promise<void> | void;
  op: string;
  d: T;
};

type WebsocketClientOptions = {
  url: string;
  debug?: boolean;
  reconnect?: boolean;
  accesstoken: (() => string) | string;
  refreshtoken: (() => string) | string;
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
  #_accesstoken: (() => string) | string;
  #_refreshtoken: (() => string) | string;
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
    accesstoken,
    refreshtoken,
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
    this.#_accesstoken = accesstoken;
    this.#_refreshtoken = refreshtoken;
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
    this.emit<{ accesstoken: string; refreshtoken: string }, never>({
      op: 'AUTHENTICATE_OP',
      d: {
        accesstoken:
          typeof this.#_accesstoken === 'function' ? this.#_accesstoken() : this.#_accesstoken,
        refreshtoken:
          typeof this.#_refreshtoken === 'function' ? this.#_refreshtoken() : this.#_refreshtoken,
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

  emit<T, R>({ callback, ...payload }: WebSocketClientEmitPayload<T, R>) {
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

  addAccordEventListener<T = any>(op: string, handler: (payload: T) => void) {
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
