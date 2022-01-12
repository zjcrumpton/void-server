export interface EntityState {
  size: {
    height: number,
    width: number,
  },
  position: {
    x: number,
    y: number,
  },
  speed: number,
}

export interface Entity {
  state: EntityState,
  update: (keys: any) => void,
}

export class Player implements Entity {
  public state: EntityState;

  constructor({ 
    speed = 100,
    position: {
      x = 0,
      y = 0
    },
    size: { 
      height = 20,
      width = 20
    }
  }: EntityState) {
    this.state = {
      speed,
      position: { x, y },
      size: { height, width }
    };
  }

  update = (keys: any) => {
    if (keys.isPressed.left) {
      this.state.position.x -= this.state.speed;
    }

    if (keys.isPressed.right) {
      this.state.position.x += this.state.speed;
    }

    if (keys.isPressed.up) {
      this.state.position.y -= this.state.speed;
    }

    if (keys.isPressed.down) {
      this.state.position.y += this.state.speed;
    }
  }
}