import { app, setIo } from "./app.mjs";
import { createServer } from "http";
import { Server } from 'socket.io';
import { initSocket as initIndexSocket } from "./routes/index.mjs";
import { normalizePort, onListening, onError } from "./appsupport.mjs";

export const port = normalizePort(process.env.PORT || '3000');


export const server = createServer(app);
export const io = new Server(server, { transports: ["websocket"] })
server.listen(port);

initSockets()
server.on('error', onError);
server.on('listening', onListening);
server.on('request', (req, res) => {
  //debug(`${new Date().toISOString()} request ${req.method} ${req.url}`)
})

function initSockets() {
  setIo(io)
  initIndexSocket(io)
}