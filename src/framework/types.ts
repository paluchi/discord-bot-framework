// src/core/types.ts

export interface Request {
  message: string;
  userId: string;
  channelId: string;
  // Add any other relevant properties
}

export interface RequestDataResponse {
  status: "awaiting" | "received" | "timeout" | "error";
  response: string;
}

export interface Response {
  send: (message: string) => Promise<void>;
  requestData: (message?: string) => Promise<RequestDataResponse>;
  sendButtons: (
    message: string,
    buttons: { id: string; label: string }[]
  ) => void;
}

export type Next = (middleware?: ChatMiddleware) => void;

export type ChatMiddleware = (
  req: Request,
  res: Response,
  next: Next
) => Promise<void>;
