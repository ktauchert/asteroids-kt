

import Player from "./lib/Player";
import Projectile from "./lib/Projectile";
import Enemy from "./lib/Enemy";
import gsap from "gsap";
import Particle from "./lib/Particle";
import axios from "axios";

const PLAYER_RADIUS = 20;
const PLAYER_COLOR = 'rgb(220, 220, 220)';
const PROJECTILE_COLOR = 'rgb(255, 125, 0)';

const scoreEl = document.getElementById('score');
const canvas = document.querySelector("canvas");
const chosenLevelEl = document.getElementById('chosen-level');


// const gameOverEl = document.getElementById('game-over-container');
const userScoreEl = document.getElementById('user-score');
const startGameBtn = document.getElementById('start-game-btn');
const levelBtns = document.querySelectorAll('.level-btn');
const submitScoreBtn = $('#submit-score-btn');
const getScoresBtn = $('#get-score-btn');
const $gameMenuModal = $('#gameMenuModal');
const $level = $('#level');

let userScore = 0;
let keys = [];

const headerHeight = 58;

let enemyRadius = 0;
let animationHandler;
let spawnInterval = null;
let level = "Easy";
let enemySpawnTimeout = 2000;
let pointsHitEnemy = 100;
let pointsDestroyEnemy = 250;
let splitEnemies = false;
let enemiesBounce = false;

canvas.width = innerWidth;
canvas.height = innerHeight - 62;
// canvas context
const ctx = canvas.getContext("2d");
const playerInitPosX = canvas.width / 2;
const playerInitPosY = canvas.height / 2;
// projectiles array for holding all projectiles that are launched

let player = new Player(ctx, playerInitPosX, playerInitPosY, PLAYER_RADIUS, PLAYER_COLOR);
let projectiles = [];
let enemies = [];
let particles = [];
// create player init position



// const projectile = new Projectile(
//     ctx, playerInitPosX, playerInitPosY, 5, 'red', { x: 1, y: 1 }
// )
// animation of the game

function init() {
    player = new Player(ctx, playerInitPosX, playerInitPosY, PLAYER_RADIUS, PLAYER_COLOR);
    projectiles = [];
    enemies = [];
    particles = [];
    userScore = 0;
    scoreEl.innerText = userScore;
    userScoreEl.innerText = userScore;
}
function collides(objA, objB) {
    const dist = Math.hypot(
        objA.x - objB.x,
        objA.y - objB.y
    );
    return dist - objA.radius - objB.radius < 1;
}
function projectileOffScreen(projectile) {
    // off screen on x Axis
    if (projectile.x - projectile.radius < 0 || projectile.x + projectile.radius > canvas.width) {
        return true;
    }
    // off screen y axis
    if (projectile.y - projectile.radius < 0 || projectile.y + projectile.radius > canvas.height) {
        return true;
    }

    return false;
}
function enemyOffScreen(enemy) {
    // off screen on x Axis
    // return false;
    if (enemy.x < -100 || enemy.x > canvas.width + 100) {
        return true;
    }
    // off screen y axis
    if (enemy.y < -100 || enemy.y > canvas.height + 100) {
        return true;
    }

    return false;
}
function calcSplitEnemyVelocity(enemy, projectile) {
    const angle = Math.atan2(
        enemy.y - projectile.y,
        enemy.x - projectile.x
    );
    const enemyOneVelocity = {
        x: Math.cos(2 * Math.PI * Math.random() + angle),
        y: Math.sin(2 * Math.PI * Math.random() + angle)
    }
    const enemyTwoVelocity = {
        x: Math.cos(angle - 2 * Math.PI * Math.random()),
        y: Math.sin(angle - 2 * Math.PI * Math.random())
    }

    return [
        enemyOneVelocity, enemyTwoVelocity
    ];
}
function calcCollisionedVelocity(enemy1, enemy2) {
    const angle = Math.atan2(
        enemy1.y - enemy2.y,
        enemy1.x - enemy2.x
    );
    const enemyOneVelocity = {
        x: Math.cos(0.5 * Math.PI + angle),
        y: Math.sin(0.5 * Math.PI + angle)
    }
    const enemyTwoVelocity = {
        x: Math.cos(angle - 0.5 * Math.PI),
        y: Math.sin(angle - 0.5 * Math.PI)
    }

    return [
        enemyOneVelocity, enemyTwoVelocity
    ];
}
function animate() {
    animationHandler = requestAnimationFrame(animate);
    ctx.fillStyle = 'rgba(0,0,0, 0.1)'
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    player.draw();
    particles.forEach((particle, pIndex) => {
        if (particle.alpha <= 0) {
            particles.splice(pIndex, 1);
        } else {
            particle.update();
        }
    })
    projectiles.forEach((projectile, pIndex) => {
        projectile.update();
        if (projectileOffScreen(projectile)) {
            projectiles.splice(pIndex, 1);
        }
    });
    enemies.forEach((enemy, eIndex) => {
        enemy.update();
        if (enemyOffScreen(enemy)) {
            enemies.splice(eIndex, 1);
        }
        if (eIndex + 1 != enemy.length) {
            // console.log("enemy left");
            for (let i = eIndex + 1; i < enemies.length; i++) {
                // Enemybounce
                if (enemiesBounce && collides(enemy, enemies[i])) {
                    // console.log("Enemy collides")
                    const splitVelocities = calcSplitEnemyVelocity(enemy, enemies[i]);

                    enemy.velocity = splitVelocities[0];
                    enemy.update()
                    enemies[i].velocity = splitVelocities[1];
                    enemies[i].update()
                }
            }
        }
    });
    enemies.forEach((enemy, eIndex) => {
        enemy.update();

        // Enemy hits Player
        if (collides(player, enemy)) {
            cancelAnimationFrame(animationHandler);
            clearInterval(spawnInterval);
            spawnInterval = null;
            setTimeout(() => {
                $gameMenuModal.modal('show');
            }, 800);
            // gameOverEl.classList.remove('hidden');
            ctx.fillStyle = 'rgba(222,50,0, 1)'
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            userScoreEl.innerText = userScore;
        }
        projectiles.forEach(
            (projectile, pIndex) => {
                if (collides(projectile, enemy)) {

                    for (let i = 0; i < enemy.radius; i++) {
                        particles.push(new Particle(
                            ctx,
                            projectile.x,
                            projectile.y,
                            Math.random() * 2,
                            enemy.color, {
                            x: (Math.random() - 0.5) * (Math.random() * 6),
                            y: (Math.random() - 0.5) * (Math.random() * 6),
                        }
                        ))
                    }
                    if (enemy.radius > 10) {
                        userScore += pointsHitEnemy;
                        gsap.to(enemy, {
                            radius: enemy.radius - 10
                        })
                        if (splitEnemies) {
                            const newEnemyVelo = calcSplitEnemyVelocity(enemy, projectile);
                            enemies.splice(eIndex, 1);
                            enemies.push(new Enemy(ctx, enemy.x + enemy.radius - 10, enemy.y + enemy.radius - 10, enemy.radius - 10, enemy.color, newEnemyVelo[0]));
                            enemies.push(new Enemy(ctx, enemy.x + enemy.radius - 10, enemy.y + enemy.radius - 10, enemy.radius - 10, enemy.color, newEnemyVelo[1]));
                        } else {
                            enemy.radius -= 10;
                        }


                        setTimeout(() => {
                            projectiles.splice(pIndex, 1);
                        }, 0);
                    } else {
                        userScore += pointsDestroyEnemy;
                        setTimeout(() => {
                            enemies.splice(eIndex, 1);
                            projectiles.splice(pIndex, 1);
                        }, 0);
                    }
                    scoreEl.innerHTML = userScore;
                }
            }
        )
    });
}
function setDifficulty() {
    let level = $level.val();
    console.log(level)
    switch (level) {
        case "Very Easy":
            pointsHitEnemy = 75;
            pointsDestroyEnemy = 150;
            enemySpawnTimeout = 200;
            splitEnemies = false;
            enemiesBounce = false;
            break;
        case "Easy":
            pointsHitEnemy = 100;
            pointsDestroyEnemy = 250;
            enemySpawnTimeout = 1500;
            splitEnemies = false;
            enemiesBounce = false;
            break;
        case "Middle":
            pointsHitEnemy = 150;
            pointsDestroyEnemy = 400;
            enemySpawnTimeout = 1000;
            splitEnemies = true;
            enemiesBounce = false;
            break;
        case "Hard":
            pointsHitEnemy = 250;
            pointsDestroyEnemy = 600;
            enemySpawnTimeout = 1000;
            splitEnemies = true;
            enemiesBounce = true;
            break;
        case "Ridiculous":
            pointsHitEnemy = 350;
            pointsDestroyEnemy = 800;
            enemySpawnTimeout = 500;
            splitEnemies = true;
            enemiesBounce = true;
            break;
        default:
            pointsHitEnemy = 100;
            pointsDestroyEnemy = 250;
            enemySpawnTimeout = 1500;
            splitEnemies = false;
            enemiesBounce = false;
            level = "Easy"
            break;
    }
    chosenLevelEl.innerHTML = level;
}
function spawnEnemies() {
    spawnInterval = setInterval(() => {

        enemyRadius = Math.ceil(Math.random() * 4) * 10
        let randomX = Math.random() <= 0.5;
        let randomEdge = Math.random() <= 0.5;
        let randEnemy = {
            x: randomX ?
                Math.random() * canvas.width :
                (randomEdge ? 0 - enemyRadius : canvas.width + enemyRadius),
            y: !randomX ?
                Math.random() * canvas.height :
                (randomEdge <= 0.5 ? 0 - enemyRadius : canvas.height + enemyRadius),
            radius: enemyRadius,
            color: `hsl(${Math.random() * 360}, 50%, 50%)`,
            velocity: {
                x: 1,
                y: 1,
            },
        };

        const angle = Math.atan2(
            canvas.height / 2 - randEnemy.y,
            canvas.width / 2 - randEnemy.x
        );
        randEnemy.velocity.x = Math.cos(angle);
        randEnemy.velocity.y = Math.sin(angle);

        enemies.push(
            new Enemy(
                ctx,
                randEnemy.x,
                randEnemy.y,
                randEnemy.radius,
                randEnemy.color,
                randEnemy.velocity
            )
        );
    }, enemySpawnTimeout);
}
const inDev = false;
const urlLocal = "http://localhost/php-stuff/asteroids.php";
const urlOnline = "./php/asteroids.php";

function saveHighScore(name = "", score = 0, game = "asteroids") {
    if (score === 0) return false;
    if (name === "") return false;
    let difficulty = $level.val();;

    axios({
        method: "post",
        url: inDev ? urlLocal : urlOnline,
        headers: { 'Content-Type': 'text' },
        data: {
            task: "setHighscore",
            name,
            score,
            game,
            difficulty
        }
    })
        .then(res => {
            // console.log(res);
            getHighscores('asteroids');
        })
}
function getHighscores(game = "asteroids") {
    //return true;
    axios({
        method: 'post',
        // url: "./php/saveHighScore.php",
        url: inDev ? urlLocal : urlOnline,
        headers: { 'Content-Type': 'text' },
        data: {
            task: "getHighscore",
            game
        }
    })
        .then(({ data }) => {
            let highscoreTable = "";
            console.log(data)
            data["values"].forEach(
                highscore => {
                    highscoreTable += `<tr><td scope="row">${highscore.username}</td><td>${highscore.score}</td><td>${highscore.difficulty}</td><td>${highscore.created_at}</td></tr>`
                }
            )
            $('#highcores-table-body').html(highscoreTable);
        })
}
// Eventlistener
canvas.addEventListener("click", (e) => {
    const center = {
        x: playerInitPosX,
        y: playerInitPosY,
    };
    const mousePos = {
        x: e.clientX,
        y: e.clientY - headerHeight,
    };
    const kath1 = mousePos.y - center.y;
    const kath2 = mousePos.x - center.x;
    // const length = Math.sqrt(kath1 * kath1 + kath2 * kath2);

    const angle = Math.atan2(mousePos.y - center.y, mousePos.x - center.x);
    const velocity = {
        x: Math.cos(angle) * 7.5,
        y: Math.sin(angle) * 7.5,
    };
    projectiles.push(new Projectile(ctx, center.x, center.y, 5, PROJECTILE_COLOR, velocity));
});

startGameBtn.addEventListener('click', () => {
    init();
    animate();
    spawnEnemies();
    $gameMenuModal.modal('hide')
    // gameOverEl.classList.add('hidden');
})
submitScoreBtn.on('click', (e) => {
    e.preventDefault();
    // console.log("Saved")
    let name = $('#name').val();
    saveHighScore(name, userScore);
})
getScoresBtn.on('click', () => {
    getHighscores('asteroids');
})
$('#openGameModalBtn').on('click', () => {
    getHighscores('asteroids');
})
$level.on('change', setDifficulty)
// window.addEventListener("keyup", keysPressed, false);
$('#close-modal-btn').on('click', () => {
    $gameMenuModal.modal('hide');
})