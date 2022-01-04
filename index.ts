import { Server } from 'socket.io';
import express from 'express';
import { Entity, Player } from './src/entity';
import cors from 'cors';

const HOST = '0.0.0.0';
const PORT = 8080;

const entities: Entity[] = [];

const app = express(); 
const server = app.listen(PORT, HOST, () => {
  console.log(`THE VOID is running @ ${HOST}:${PORT} `);
});

app.use(cors({
  origin: '*'
}))

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

io.on('connection', (client) => {
  const player = new Player(defaultPlayer);
  entities.push(player);
  console.log('xx connect'); // eslint-disable-line
  console.log('xx entities', entities); // eslint-disable-line

  client.emit('entities', entities);

  client.on('keyDown', (keys: any) => {
    player.update(keys);
    client.emit('entities', entities);
  });
});


app.get('/', (req, res) => {
  console.log('in here');
  res.send('connected');
});
