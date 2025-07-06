// BONA RUN - Fullscreen Landscape + Sound Effects + Touch Controls

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Logical resolution
const GAME_WIDTH = 800;
const GAME_HEIGHT = 450;
canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

// Resize canvas to fullscreen landscape
function resizeCanvas() {
  const scale = Math.min(window.innerWidth / GAME_WIDTH, window.innerHeight / GAME_HEIGHT);
  canvas.style.width = GAME_WIDTH * scale + "px";
  canvas.style.height = GAME_HEIGHT * scale + "px";
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Load assets
const playerImg = new Image();
playerImg.src = "assets/player.gif.png";

const trainImg = new Image();
trainImg.src = "assets/train.png";

const jumpSound = new Audio("assets/jump.mp3");
const crashSound = new Audio("assets/crash.mp3");

let score = 0;
let isGameOver = false;

const player = {
  x: 375,
  y: 350,
  width: 50,
  height: 50,
  speed: 7,
  dy: 0,
  gravity: 0.5,
  jumpStrength: -12,
  grounded: true,
};

let obstacles = [];

function spawnObstacle() {
  const lane = Math.floor(Math.random() * 3);
  const x = 250 + lane * 100;
  obstacles.push({
    x: x,
    y: -120,
    width: 100,
    height: 100,
    speed: 5,
  });
}

function drawBackground() {
  ctx.fillStyle = "#87CEEB";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#444";
  ctx.fillRect(250, 0, 300, canvas.height);

  ctx.strokeStyle = "#bbb";
  for (let y = 0; y < canvas.height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(260, y);
    ctx.lineTo(540, y);
    ctx.stroke();
  }

  ctx.fillStyle = "#228B22";
  ctx.fillRect(0, 0, 250, canvas.height);
  ctx.fillRect(550, 0, 250, canvas.height);

  ctx.fillStyle = "#555";
  ctx.fillRect(50, 100, 50, 200);
  ctx.fillRect(700, 150, 50, 180);

  // Title Text
  ctx.fillStyle = "#fff";
  ctx.font = "bold 32px 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("BONA RUN", canvas.width / 2, 50);
  ctx.font = "18px 'Segoe UI', sans-serif";
  ctx.fillText("Created by Vibhu Jauhari", canvas.width / 2, 80);
  ctx.textAlign = "start";
}

function drawPlayer() {
  ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
}

function drawObstacles() {
  obstacles.forEach(obs => {
    ctx.drawImage(trainImg, obs.x, obs.y, obs.width, obs.height);
  });
}

function updateObstacles() {
  obstacles.forEach(obs => obs.y += obs.speed);
  obstacles = obstacles.filter(obs => obs.y < canvas.height);
}

function updatePlayer() {
  player.dy += player.gravity;
  player.y += player.dy;

  if (player.y + player.height >= canvas.height) {
    player.y = canvas.height - player.height;
    player.dy = 0;
    player.grounded = true;
  }
}

function checkCollisions() {
  for (let obs of obstacles) {
    if (
      player.x < obs.x + obs.width &&
      player.x + player.width > obs.x &&
      player.y < obs.y + obs.height &&
      player.y + player.height > obs.y
    ) {
      crashSound.play();
      endGame();
    }
  }
}

function drawScore() {
  ctx.fillStyle = "#fff";
  ctx.font = "24px Arial";
  ctx.fillText("Score: " + score, 20, 40);
}

function endGame() {
  isGameOver = true;
  document.getElementById("gameOverScreen").style.display = "block";
  document.getElementById("finalScore").innerText = score;
}

function restartGame() {
  isGameOver = false;
  score = 0;
  player.x = 375;
  player.y = 350;
  player.dy = 0;
  obstacles = [];
  document.getElementById("gameOverScreen").style.display = "none";
  requestAnimationFrame(gameLoop);
}

function gameLoop() {
  if (isGameOver) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawPlayer();
  drawObstacles();
  updatePlayer();
  updateObstacles();
  checkCollisions();
  drawScore();
  score++;
  requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" && player.x > 250) {
    player.x -= player.speed * 2;
  } else if (e.key === "ArrowRight" && player.x < 500 - player.width) {
    player.x += player.speed * 2;
  } else if ((e.key === "ArrowUp" || e.key === " ") && player.grounded) {
    player.dy = player.jumpStrength;
    player.grounded = false;
    jumpSound.play();
  }
});

// Touch controls
let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let touchEndY = 0;

canvas.addEventListener("touchstart", function (e) {
  touchStartX = e.changedTouches[0].screenX;
  touchStartY = e.changedTouches[0].screenY;
}, false);

canvas.addEventListener("touchend", function (e) {
  touchEndX = e.changedTouches[0].screenX;
  touchEndY = e.changedTouches[0].screenY;
  handleGesture();
}, false);

function handleGesture() {
  const dx = touchEndX - touchStartX;
  const dy = touchEndY - touchStartY;

  if (dx < -30 && Math.abs(dx) > Math.abs(dy)) {
    if (player.x > 250) player.x -= player.speed * 2; // swipe left
  } else if (dx > 30 && Math.abs(dx) > Math.abs(dy)) {
    if (player.x < 500 - player.width) player.x += player.speed * 2; // swipe right
  } else if (dy < -30 && Math.abs(dy) > Math.abs(dx) && player.grounded) {
    player.dy = player.jumpStrength;
    player.grounded = false;
    jumpSound.play(); // swipe up
  }
}

setInterval(() => {
  if (!isGameOver) spawnObstacle();
}, 1600);

let assetsLoaded = 0;
[playerImg, trainImg].forEach(img => {
  img.onload = () => {
    assetsLoaded++;
    if (assetsLoaded === 2) gameLoop();
  };
});
