import Circle from "./Circle";
// Projectiles
class Projectile extends Circle {
    constructor(ctx, x, y, radius, color, velocity) {
        super(ctx, x, y, radius, color);
        this.velocity = velocity;
        // console.log(`x: ${x}, ${y}, ${radius}, ${color}`)
        // console.log(`projectile created velo: ${this.velocityx}`)
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        // console.log(`projectile on its way: x:${this.x}, y:${this.y}`)
        this.draw();
    }
}

export default Projectile;