import { UUID } from 'uuidv7';

export const getTimestampFromUUID = (uuid: string) => {
    const timestampBytes = new Uint8Array(8);
    timestampBytes.set(new Uint8Array(UUID.parse(uuid).bytes.buffer.slice(0, 6)), 2);
    const timestampMs = new DataView(timestampBytes.buffer).getBigUint64(0);

    if (timestampMs > Number.MAX_SAFE_INTEGER || timestampMs < Number.MIN_SAFE_INTEGER) {
        return new Date();
    }

    return new Date(Number(timestampMs));
};
