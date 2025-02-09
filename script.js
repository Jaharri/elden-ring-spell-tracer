// Core game setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

document.body.style.margin = "0";
document.body.style.overflow = "hidden";

document.body.appendChild(canvas);

// Load custom font
const font = new FontFace('EldenRingFont', 'url(./fonts/EldenRingFont.woff2)');
font.load().then(function(loadedFont) {
  document.fonts.add(loadedFont);
  ctx.font = "48px EldenRingFont";
}).catch(function(error) {
  console.error("Font loading failed:", error);
});

// Game variables
let playerHealth = 100;
let playerMana = 100;
let enemyHealth = 100;
let isDrawing = false;
let drawnPath = [];
let enemies = [];
let flasks = 3;

// Spell definitions
const spells = {
  "basic_circle": { damage: 10, manaCost: 15 },
  "lightning_bolt": { damage: 25, manaCost: 30 },
  "healing_touch": { heal: 20, manaCost: 20 },
  "fireball": { damage: 30, manaCost: 35 },
  "glintstone_shard": { damage: 15, manaCost: 10 },
  "carian_piercer": { damage: 40, manaCost: 50 }
};

// Enemy class with rendering
class Enemy {
  constructor(type, health, attackPower, attackSpeed, specialEffect, x, y) {
    this.type = type;
    this.health = health;
    this.attackPower = attackPower;
    this.attackSpeed = attackSpeed;
    this.attackTimer = 0;
    this.specialEffect = specialEffect;
    this.x = x;
    this.y = y;
  }
  attack() {
    if (this.attackTimer <= 0) {
      playerHealth -= this.attackPower;
      this.attackTimer = this.attackSpeed;
      if (this.specialEffect) {
        this.specialEffect();
      }
      updateUI();
    }
  }
  update() {
    this.attackTimer--;
  }
  draw() {
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, 50, 50);
  }
}

// Special enemy effects
function applyRot() {
  playerHealth -= 2; // Deals periodic damage
}

function applyFrost() {
  playerMana -= 5; // Reduces mana regeneration temporarily
}

// Add initial enemies
enemies.push(new Enemy("Lesser Minion", 50, 5, 60, null, 500, 200));
enemies.push(new Enemy("Elite Knight", 100, 15, 90, applyFrost, 700, 200));
enemies.push(new Enemy("Abyss Beast", 150, 20, 120, applyRot, 900, 200));
enemies.push(new Enemy("Elden Beast", 300, 30, 80, applyFrost, 1100, 200));

// Player input handling
canvas.addEventListener("mousedown", () => { isDrawing = true; drawnPath = []; });
canvas.addEventListener("mousemove", (e) => {
  if (!isDrawing) return;
  drawnPath.push({ x: e.clientX, y: e.clientY });
});
canvas.addEventListener("mouseup", () => {
  isDrawing = false;
  processSpell(drawnPath);
});

// Spell recognition (placeholder logic)
function processSpell(path) {
  if (path.length < 10) return; // Ignore small gestures
  
  let spell = recognizePattern(path);
  if (spell && playerMana >= spells[spell].manaCost) {
    castSpell(spell);
  }
}

// Placeholder function for recognizing patterns
function recognizePattern(path) {
  if (path.length > 70) return "carian_piercer";
  if (path.length > 50) return "lightning_bolt";
  if (path.length > 30) return "fireball";
  if (path.length > 20) return "glintstone_shard";
  return "basic_circle";
}

// Casting spells
function castSpell(spell) {
  playerMana -= spells[spell].manaCost;
  if (spells[spell].damage) {
    enemies[0].health -= spells[spell].damage;
    if (enemies[0].health <= 0) {
      enemies.shift(); // Remove defeated enemy
    }
  }
  if (spells[spell].heal) {
    playerHealth = Math.min(100, playerHealth + spells[spell].heal);
  }
  updateUI();
}

// Use flask for instant mana recovery
function useFlask() {
  if (flasks > 0) {
    playerMana = Math.min(100, playerMana + 50);
    flasks--;
    updateUI();
  }
}

// UI Updates
function updateUI() {
  console.log(`Health: ${playerHealth}, Mana: ${playerMana}, Flasks: ${flasks}, Enemy HP: ${enemies.length > 0 ? enemies[0].health : "None"}`);
}

// Game loop with rendering
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw player
  ctx.fillStyle = "blue";
  ctx.fillRect(50, canvas.height / 2 - 25, 50, 50);
  
  // Draw enemies
  enemies.forEach(enemy => {
    enemy.update();
    enemy.draw();
  });
  
  if (playerHealth <= 0) {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "red";
    ctx.font = "48px EldenRingFont";
    ctx.fillText("You Died", canvas.width / 2 - 100, canvas.height / 2);
    return;
  }
  requestAnimationFrame(gameLoop);
}
gameLoop();
