import Circle from "./Circle";

// Player class
class Player extends Circle {
    constructor(ctx, x, y, radius, color, velocity = { x: 0, y: 0 }) {
        super(ctx, x, y, radius, color);
        this.velocity = velocity;
        this.friction = 0.99
    }

    // update() {
    //     this.draw();
    //     // this.velocity.x *= this.velocity.x <= 0.1 ? 0 : this.friction;
    //     // this.velocity.y *= this.velocity.y <= 0.1 ? 0 : this.friction;
    //     this.x += this.velocity.x;
    //     this.y += this.velocity.y;
    //     this.alpha -= 0.01;
    // }
}


export default Player;