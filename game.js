import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';

// Game logic here


let scene, camera, renderer;
let drawing = false;
let mousePath = [];
let lineMaterial, lineGeometry, line;
let mana = 100, maxMana = 100, manaRegenRate = 0.5;
let manaFlasks = 3;
let enemies = [];
let playerHealth = 100, maxHealth = 100;
let spellCooldowns = {};

const predefinedShapes = {
    "circle": { spell: "Glinstone Arc", complexity: 3, damage: 20, cooldown: 2000 },
    "triangle": { spell: "Carian Piercer", complexity: 4, damage: 30, cooldown: 3000 },
    "zigzag": { spell: "Lightning Spear", complexity: 5, damage: 40, cooldown: 4000 }
};

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    camera.position.z = 5;

    const light = new THREE.AmbientLight(0xffffff, 1);
    scene.add(light);

    lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    lineGeometry = new THREE.BufferGeometry();
    line = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(line);

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('keydown', onKeyDown);

    createUI();
    spawnEnemy();
    animate();
}

function identifyShape(path) {
    if (path.length < 5) return "unknown";
    const firstPoint = path[0];
    const lastPoint = path[path.length - 1];
    const distance = Math.hypot(lastPoint.x - firstPoint.x, lastPoint.y - firstPoint.y);

    if (distance < 0.1) return "circle";
    if (path.length < 10) return "triangle";
    if (path.length > 15) return "zigzag";
    return "unknown";
}

function recognizeSpell(path) {
    let spellShape = identifyShape(path);
    if (spellShape in predefinedShapes) {
        let spellData = predefinedShapes[spellShape];
        let manaCost = spellData.complexity * 10;
        let currentTime = Date.now();

        if (mana < manaCost) {
            console.log("Not enough mana!");
            return;
        }
        
        if (spellCooldowns[spellShape] && currentTime < spellCooldowns[spellShape]) {
            console.log("Spell on cooldown!");
            return;
        }
        
        spellCooldowns[spellShape] = currentTime + spellData.cooldown;
        mana -= manaCost;
        updateUI();
        console.log(`Spell Cast: ${spellData.spell}! Mana Cost: ${manaCost}`);
        damageEnemy(spellData.damage);
    } else {
        console.log("Invalid spell shape!");
    }
}

function spawnEnemy() {
    let enemy = {
        health: 100,
        position: new THREE.Vector3(0, 0, -5),
        speed: 0.02,
        attacking: false,
        mesh: new THREE.Mesh(
            new THREE.SphereGeometry(0.8, 16, 16),
            new THREE.MeshStandardMaterial({ color: 0x550000, roughness: 0.7 })
        )
    };
    enemy.mesh.position.copy(enemy.position);
    scene.add(enemy.mesh);
    enemies.push(enemy);
}

function createUI() {
    let manaBar = document.createElement('div');
    manaBar.id = 'manaBar';
    manaBar.style.position = 'absolute';
    manaBar.style.bottom = '20px';
    manaBar.style.left = '20px';
    manaBar.style.width = '200px';
    manaBar.style.height = '20px';
    manaBar.style.backgroundColor = 'rgba(0,0,0,0.5)';
    manaBar.style.border = '2px solid blue';
    document.body.appendChild(manaBar);

    let manaFill = document.createElement('div');
    manaFill.id = 'manaFill';
    manaFill.style.height = '100%';
    manaFill.style.width = `${(mana / maxMana) * 100}%`;
    manaFill.style.backgroundColor = 'blue';
    manaBar.appendChild(manaFill);
}

function updateUI() {
    document.getElementById('manaFill').style.width = `${(mana / maxMana) * 100}%`;
}

function onMouseDown(event) {
    drawing = true;
    mousePath = [];
}

function onMouseMove(event) {
    if (!drawing) return;
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = -(event.clientY / window.innerHeight) * 2 + 1;
    mousePath.push(new THREE.Vector3(x, y, 0));
    updateLine();
}

function onMouseUp(event) {
    drawing = false;
    recognizeSpell(mousePath);
    mousePath = [];
    updateLine();
}

function updateLine() {
    lineGeometry.setFromPoints(mousePath);
}

function damageEnemy(amount) {
    if (enemies.length > 0) {
        enemies[0].health -= amount;
        console.log(`Enemy health: ${enemies[0].health}`);
        if (enemies[0].health <= 0) {
            scene.remove(enemies[0].mesh);
            enemies.shift();
            console.log("Enemy defeated!");
            spawnEnemy();
        }
    }
}

function moveEnemies() {
    enemies.forEach(enemy => {
        enemy.position.z += enemy.speed;
        enemy.mesh.position.copy(enemy.position);
        if (enemy.position.z >= camera.position.z) {
            playerHealth -= 10;
            enemy.mesh.material.color.set(0xff0000);
            setTimeout(() => enemy.mesh.material.color.set(0x550000), 500);
            console.log("Enemy attacked! Player health:", playerHealth);
            if (playerHealth <= 0) {
                console.log("Game Over");
                resetGame();
            }
            enemy.position.z = -5;
        }
    });
}

function animate() {
    requestAnimationFrame(animate);
    mana = Math.min(maxMana, mana + manaRegenRate);
    moveEnemies();
    updateUI();
    renderer.render(scene, camera);
}

init();
