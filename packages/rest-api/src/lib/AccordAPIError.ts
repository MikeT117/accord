import { nanoid } from 'nanoid';

export class AccordAPIError extends Error {
  id: string;
  statusCode: number;
  serverMessage?: string;

  constructor({
    statusCode,
    clientMessage,
    serverMessage,
  }: {
    statusCode: number;
    clientMessage: string;
    serverMessage?: string;
    description?: string;
  }) {
    super(clientMessage ?? serverMessage);
    this.id = nanoid(6);
    this.statusCode = statusCode;
    this.serverMessage = serverMessage;
  }
}
