import Circle from "./Circle";
// Projectiles
class Particle extends Circle {
    constructor(ctx, x, y, radius, color, velocity) {
        super(ctx, x, y, radius, color);
        this.velocity = velocity;
        this.friction = 0.98;
    }

    update() {
        this.draw();
        this.velocity.x *= this.friction
        this.velocity.y *= this.friction
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.01;
    }
}

export default Particle;