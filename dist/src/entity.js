"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
class Player {
    constructor({ speed = 1.5, position: { x = 0, y = 0 }, size: { height = 20, width = 20 } }) {
        this.update = (keys) => {
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
        };
        this.state = {
            speed,
            position: { x, y },
            size: { height, width }
        };
    }
}
exports.Player = Player;
