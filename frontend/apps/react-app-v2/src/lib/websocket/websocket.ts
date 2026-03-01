const MAX_RETRY_INTERVAL = 30000;
const CONNECTION_TIMEOUT = 5000;

const WEBSOCKET_CLOSE_CODE = {
    UNKNOWN: 4000,
    AUTHENTICATION_TIMEOUT: 4001,
    AUTHENTICATION_FAILED: 4002,
    SESSION_EXPIRED: 4003,
} as const;

export type WebSocketConfig = {
    endpoint: string;
    log: boolean;
    retry: boolean;
    retries: number;
    identify: () => Uint8Array<ArrayBufferLike>;
    onMessage: (data: ArrayBuffer, respond: (payload: Uint8Array<ArrayBufferLike>) => void) => void;
    onInvalidSession: () => void;
};

export type AccordWebsocket = ReturnType<typeof websocket>;

export function websocket() {
    let retries = 1;
    let retryInterval = 5 * 1000;
    let log = true;
    let connectionTimeout: number;
    let conn: WebSocket;
    let config: WebSocketConfig;

    function loadConfig(cfg: WebSocketConfig) {
        config = cfg;
    }

    function connect() {
        if (!config) {
            return;
        }

        logEvents("Event", "Connecting", `Attempts: ${retries}`);

        conn = new WebSocket(config.endpoint);
        conn.binaryType = "arraybuffer";

        // Using window due to typescript assuming we're in a NodeJS environment.
        connectionTimeout = window.setTimeout(() => {
            if (conn.readyState === WebSocket.CONNECTING) {
                logEvents("Event", "Connection", "Timeout", `Attempts: ${retries}`);
                shutdown();
            }
        }, CONNECTION_TIMEOUT);

        addEventListeners();
    }

    function addEventListeners() {
        if (!conn) {
            return;
        }
        logEvents("Event", "Listeners", "Create");
        conn.addEventListener("open", handleOpenEvent);
        conn.addEventListener("message", handleMsgEvent);
        conn.addEventListener("close", reconnect);
        window.addEventListener("beforeunload", shutdown);
    }

    function removeEventListeners() {
        if (!conn) {
            return;
        }
        logEvents("Event", "Listeners", "Remove");
        conn.removeEventListener("open", handleOpenEvent);
        conn.removeEventListener("message", handleMsgEvent);
        conn.removeEventListener("close", reconnect);
        window.removeEventListener("beforeunload", shutdown);
    }

    function handleMsgEvent(message: MessageEvent<ArrayBuffer>) {
        logEvents("Event", "Message");
        if (typeof config.onMessage !== "function") {
            return;
        }

        config.onMessage(message.data, send);
    }

    function reconnect(ev: CloseEvent) {
        logEvents("Event", "Close", `Code: ${ev.code}`, `Clean: ${ev.wasClean}`, `Reason: ${ev.reason}`);

        if (ev.code === 1000) {
            console.warn("websocket connection closed normally, not retrying");
            return;
        }

        if (retries > config.retries) {
            console.error("websocket connection failed, max retries reached");
            return;
        }

        if (
            ev.code === WEBSOCKET_CLOSE_CODE.AUTHENTICATION_FAILED ||
            ev.code === WEBSOCKET_CLOSE_CODE.SESSION_EXPIRED
        ) {
            if (typeof config.onInvalidSession === "function") {
                config.onInvalidSession();
            }
            console.error("websocket connection authentication failed and/or session expired, not retrying");
            return;
        }

        setTimeout(
            () => {
                shutdown();
                connect();
            },
            Math.min(retryInterval, MAX_RETRY_INTERVAL),
        );

        retryInterval *= 2;
        retries += 1;
    }

    function shutdown() {
        logEvents("Event", "Shutdown");
        removeEventListeners();
        if (!conn || conn.readyState === WebSocket.CLOSED) {
            return;
        }
        conn.close(1000);
    }

    function handleOpenEvent() {
        logEvents("Event", "Open");
        retries = 1;
        retryInterval = 5 * 1000;
        clearTimeout(connectionTimeout);
        conn.send(config.identify());
    }

    function logEvents(...data: unknown[]) {
        if (log) {
            console.log(data);
        }
    }

    function send(payload: Uint8Array<ArrayBufferLike>) {
        if (conn.readyState !== conn.OPEN) {
            return;
        }

        conn.send(payload);
    }

    return { connect, shutdown, send, loadConfig };
}
