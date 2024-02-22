export class AccordWebsocketError extends Error {
    id = Date.now().toString();
    constructor(message: string) {
        super(message);
        console.trace();
    }
}
