"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const SPRINT_SPEED = 4;
class Player {
    constructor({ speed = 100, position: { x = 0, y = 0 }, size: { height = 20, width = 20 } }) {
        this.update = (keys) => {
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
        };
        this.state = {
            speed,
            position: { x, y },
            size: { height, width }
        };
    }
}
exports.Player = Player;
