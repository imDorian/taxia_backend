import app from "./app.js";
import http from "http";
import { Server } from "socket.io";

export const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('Client connected');
    socket.on("message", (data) => {
        console.log(data);
        socket.emit("respuesta", { "message": "Buscando eventos..." });
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export { io };




