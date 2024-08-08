import { ChatMiddleware } from "./types";

export class ChatRouter {
  private middlewares: ChatMiddleware[] = [];

  use(middleware: ChatMiddleware): void {
    this.middlewares.push(middleware);
  }

  getMiddlewares(): ChatMiddleware[] {
    return this.middlewares;
  }
}
