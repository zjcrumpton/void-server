"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const express_1 = __importDefault(require("express"));
const entity_1 = require("./src/entity");
const cors_1 = __importDefault(require("cors"));
const HOST = '0.0.0.0';
const PORT = parseInt(process.env.PORT || '8080', 10);
const entities = [];
const app = (0, express_1.default)();
const server = app.listen(PORT, HOST, () => {
    console.log(`THE VOID is running @ ${HOST}:${PORT} `);
});
app.use((0, cors_1.default)({
    origin: '*'
}));
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    }
});
const defaultPlayer = {
    speed: 1.5,
    position: {
        x: 0,
        y: 0
    },
    size: {
        height: 20,
        width: 20,
    }
};
io.on('connection', (client) => {
    const player = new entity_1.Player(defaultPlayer);
    entities.push(player);
    console.log('xx connect'); // eslint-disable-line
    console.log('xx entities', entities); // eslint-disable-line
    client.emit('entities', entities);
    client.on('keyDown', (keys) => {
        player.update(keys);
        client.emit('entities', entities);
    });
});
app.get('/', (req, res) => {
    console.log('in here');
    res.send('connected');
});
