import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

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
    manaBar.style.hei
