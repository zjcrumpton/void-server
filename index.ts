import { Server } from 'socket.io';
import express from 'express';
import { Entity, Player } from './src/entity';
import cors from 'cors';
import { setInterval } from 'timers';
import Database from './src/Database';

const HOST = '0.0.0.0';
const PORT = parseInt(process.env.PORT || '8080', 10);

const entities: Entity[] = [];
const clients: any[] = [];

const players: any = {};

const app = express();

const db = new Database();

app.use(cors({
  origin: '*'
}));

app.use(express.json());


export enum Keys {
  RIGHT = 'right',
  LEFT = 'left',
  DOWN = 'down',
  UP = 'up',
  SPRINT = 'sprint',
}

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

  setInterval(() => {
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
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ["GET", "POST"]
    }
  });
  
  const defaultPlayer = {
    speed: 1.5,
    position: {
      x: 0,
      y:  0
    },
    size: { 
      height: 20,
      width:20,
    }
  };
  
  const updateEntities = () => {
    clients.forEach((c) => {
      c.emit('entities', entities);
    });
  }
  
  io.on('connection', (client) => {
    const player = new Player(defaultPlayer);
    players[client.id] = {};
    players[client.id].entity = player;
    players[client.id].keys = { isPressed };
  
    entities.push(player);
    clients.push(client);
    console.log('xx connect'); // eslint-disable-line
    console.log('xx entities', entities); // eslint-disable-line
  
    client.emit('entities', entities);
    
  
    client.on('keyDown', (keys: any) => {
      player.update(keys);
      players[client.id].keys = keys;
      updateEntities();
    });

    client.on('keyUp', (keys: any) => {
      players[client.id].keys = keys;
      updateEntities();
    })
  });
  
  app.get('/', (req, res) => {
    console.log('in here');
    res.send('connected');
  });


  app.post('/register', async (req, res) => {
    console.log(req.body);

    const username = req.body.username;
    const password = req.body.password;
    const color = req.body.color;

    try { 
      if (username && password) {
        const player = await db.authenticate(username, password, color);
        res.send({ status: 'SUCCESS', player });
      } else {
        throw new Error('UNAUTHORIZED - Please provide a username and password');
      }
    } catch (e) {
      res.status(401).send({ status: 'FAIL', error: e });
    }
  });
}

