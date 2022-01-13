import { Server } from 'socket.io';
import express from 'express';
import { Entity, Player } from './src/entity';
import cors from 'cors';
import { setInterval } from 'timers';
import Database from './src/Database';

const HOST = '0.0.0.0';
const PORT = parseInt(process.env.PORT || '8080', 10);

let entities: Entity[] = [];
let clients: any[] = [];
let players: any = {};

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
  /* JASON LOG */ console.log('\nEntities => ', entities); // eslint-disable-line
  /* JASON LOG */ console.log('Players => ', players); // eslint-disable-line
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
    
    
    client.emit('entities', entities);

    client.on('join', (id: string) => {
      const savedPlayer = db.getPlayerById(id);

      const playerToAdd = {
        name: savedPlayer.username,
        color: savedPlayer.color,
        size: {
          height: 54,
          width: 54,
        },
        position: savedPlayer.position,
        speed: 1.5,
      }

      const player = new Player(playerToAdd);
      
      players[client.id] = {};
      players[client.id].entity = player;
      players[client.id].keys = { isPressed };

      entities.push(player);
      clients.push(client);
      /* JASON LOG */ console.log('\nEntities => ', entities); // eslint-disable-line
      /* JASON LOG */ console.log('Players => ', players); // eslint-disable-line

      client.on('disconnect', () => {
        entities = entities.filter((p) => p !== player); 
        clients = clients.filter((c) => c.id !== client.id);

        const passwordDigest = db.getPlayerById(id).passwordDigest;
        db.save({ id, position: player.state.position, color: player.state.color, passwordDigest, username: player.state.name });

        delete players[client.id];
        updateEntities();
        /* JASON LOG */ console.log('\nEntities => ', entities); // eslint-disable-line
        /* JASON LOG */ console.log('Players => ', players); // eslint-disable-line
      })
      
      client.on('keyDown', (keys: any) => {
        players[client.id].entity.update(keys);
        players[client.id].keys = keys;
        updateEntities();
      });
  
      client.on('keyUp', (keys: any) => {
        players[client.id].keys = keys;
        updateEntities();
      });
   
    });

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

