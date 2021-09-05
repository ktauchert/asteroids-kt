import Circle from "./Circle";

class Enemy extends Circle {
    constructor(ctx, x, y, radius, color, velocity) {
        super(ctx, x, y, radius, color, velocity);
        this.velocity = velocity;
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        // console.log(`projectile on its way: x:${this.x}, y:${this.y}`)
        this.draw();
    }
}


export default Enemy;