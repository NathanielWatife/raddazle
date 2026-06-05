export interface Server {
  fetch(request: Request): Promise<Response>;
}

declare const server: Server;
