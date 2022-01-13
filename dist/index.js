"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Keys = void 0;
const socket_io_1 = require("socket.io");
const express_1 = __importDefault(require("express"));
const entity_1 = require("./src/entity");
const cors_1 = __importDefault(require("cors"));
const timers_1 = require("timers");
const Database_1 = __importDefault(require("./src/Database"));
const HOST = '0.0.0.0';
const PORT = parseInt(process.env.PORT || '8080', 10);
const entities = [];
const clients = [];
const players = {};
const app = (0, express_1.default)();
const db = new Database_1.default();
app.use((0, cors_1.default)({
    origin: '*'
}));
app.use(express_1.default.json());
var Keys;
(function (Keys) {
    Keys["RIGHT"] = "right";
    Keys["LEFT"] = "left";
    Keys["DOWN"] = "down";
    Keys["UP"] = "up";
    Keys["SPRINT"] = "sprint";
})(Keys = exports.Keys || (exports.Keys = {}));
const isPressed = {
    [Keys.RIGHT]: false,
    [Keys.LEFT]: false,
    [Keys.UP]: false,
    [Keys.DOWN]: false,
    [Keys.SPRINT]: false,
};
const server = app.listen(PORT, HOST, () => {
    console.log(`THE VOID is running @ ${HOST}:${PORT} `);
    initWorld();
    (0, timers_1.setInterval)(() => {
        Object.keys(players).forEach((k) => {
            const p = players[k];
            p.entity.update(p.keys);
            clients.forEach((c) => {
                c.emit('entities', entities);
            });
        });
    }, 1000 / 120);
});
function initWorld() {
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
    const updateEntities = () => {
        clients.forEach((c) => {
            c.emit('entities', entities);
        });
    };
    io.on('connection', (client) => {
        const player = new entity_1.Player(defaultPlayer);
        players[client.id] = {};
        players[client.id].entity = player;
        players[client.id].keys = { isPressed };
        entities.push(player);
        clients.push(client);
        console.log('xx connect'); // eslint-disable-line
        console.log('xx entities', entities); // eslint-disable-line
        client.emit('entities', entities);
        client.on('keyDown', (keys) => {
            player.update(keys);
            players[client.id].keys = keys;
            updateEntities();
        });
        client.on('keyUp', (keys) => {
            players[client.id].keys = keys;
            updateEntities();
        });
    });
    app.get('/', (req, res) => {
        console.log('in here');
        res.send('connected');
    });
    app.post('/register', (req, res) => __awaiter(this, void 0, void 0, function* () {
        console.log(req.body);
        const username = req.body.username;
        const password = req.body.password;
        const color = req.body.color;
        try {
            if (username && password) {
                const player = yield db.authenticate(username, password, color);
                res.send({ status: 'SUCCESS', player });
            }
            else {
                throw new Error('UNAUTHORIZED - Please provide a username and password');
            }
        }
        catch (e) {
            res.status(401).send({ status: 'FAIL', error: e });
        }
    }));
}
