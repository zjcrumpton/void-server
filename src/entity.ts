export interface EntityState {
  name: string,
  color: string,
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

const SPRINT_SPEED = 4;

export class Player implements Entity {
  public state: EntityState;

  constructor({ 
    name = "Joe",
    color = "blue",
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
      name,
      color,
      speed,
      position: { x, y },
      size: { height, width }
    };
  }

  update = (keys: any) => {
    const speed = keys.isPressed.sprint ? SPRINT_SPEED : this.state.speed;

    if (keys.isPressed.left) {
      this.state.position.x -= speed;
    }

    if (keys.isPressed.right) {
      this.state.position.x += speed;
    }

    if (keys.isPressed.up) {
      this.state.position.y -= speed;
    }

    if (keys.isPressed.down) {
      this.state.position.y += speed;
    }
  }
}