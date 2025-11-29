/**
 * CYBER DEFENDER 2077 - Game Logic (v2.0)
 * Features: Smoother difficulty curve & Weapon Power-ups
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const STATES = {
    OPENING: 'SYSTEM BOOT',
    READY: 'STANDBY',
    PLAYING: 'ENGAGED',
    PAUSED: 'FROZEN',
    GAMEOVER: 'CRITICAL FAILURE'
};

let currentState = STATES.OPENING;
let score = 0;
let lives = 3;
let speedFactor = 1.0;
let lastTime = 0;
let meteorTimer = 0;
let powerUpTimer = 0; // 升級道具計時器

let openingTimer = 0;
let glitchOffset = 0; 

const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    Space: false
};

// --- CLASSES ---

// 1. 背景星星
class Star {
    constructor() {
        this.reset();
        this.y = Math.random() * HEIGHT;
    }
    reset() {
        this.x = Math.random() * WIDTH;
        this.y = 0;
        this.size = Math.random() * 1.5 + 0.5;
        this.baseSpeed = (Math.random() * 50 + 20); 
        this.color = Math.random() > 0.8 ? '#00f3ff' : '#ffffff'; 
    }
    update(dt) {
        let currentSpeed = this.baseSpeed * (currentState === STATES.PLAYING ? speedFactor * 2 : 0.5);
        this.y += currentSpeed * dt; 
        if (this.y > HEIGHT) this.reset();
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 0;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

// 2. 船艦 (包含武器等級邏輯)
class Spaceship {
    constructor() {
        this.width = 50;
        this.height = 60;
        this.x = WIDTH / 2;
        this.y = HEIGHT - 80;
        this.speed = 350; 
        this.color = '#e0e0e0';
        this.glow = '#00f3ff';
        
        // 武器系統
        this.weaponLevel = 1; // 初始等級
        this.maxWeaponLevel = 3; // 最高等級 (1:單發, 2:三發, 3:五發)
        this.lastShotTime = 0;
        this.fireRate = 0.2; // 射擊間隔
    }

    upgradeWeapon() {
        if (this.weaponLevel < this.maxWeaponLevel) {
            this.weaponLevel++;
            // 顯示升級文字特效
            createFloatingText(this.x, this.y - 40, "WEAPON UPGRADE!", "#00ff00");
        } else {
            // 滿級加分
            score += 500;
            createFloatingText(this.x, this.y - 40, "MAX POWER +500", "#ffee00");
        }
    }

    reset() {
        this.x = WIDTH / 2;
        this.y = HEIGHT - 80;
        this.weaponLevel = 1;
    }

    update(dt) {
        if (currentState !== STATES.PLAYING) return;
        if (keys.ArrowLeft) this.x -= this.speed * dt;
        if (keys.ArrowRight) this.x += this.speed * dt;
        
        if (this.x < 30) this.x = 30;
        if (this.x > WIDTH - 30) this.x = WIDTH - 30;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);

        // 引擎噴射
        if (currentState === STATES.PLAYING) {
            const flicker = Math.random() * 15 + 10;
            ctx.fillStyle = '#00f3ff';
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#00f3ff';
            
            // 根據等級改變火焰顏色 (視覺回饋)
            if (this.weaponLevel === 3) ctx.fillStyle = '#ff00ff'; 
            else if (this.weaponLevel === 2) ctx.fillStyle = '#ffee00';

            ctx.beginPath();
            ctx.moveTo(-15, 20);
            ctx.lineTo(-5, 20);
            ctx.lineTo(-10, 20 + flicker);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(5, 20);
            ctx.lineTo(15, 20);
            ctx.lineTo(10, 20 + flicker);
            ctx.fill();
        }

        ctx.shadowBlur = 10;
        ctx.shadowColor = this.glow;

        // 機身
        ctx.fillStyle = '#222';
        ctx.strokeStyle = this.weaponLevel === 3 ? '#ff00ff' : '#00f3ff'; // 滿級變紫色邊框
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(0, -this.height/2); 
        ctx.lineTo(10, -10);
        ctx.lineTo(25, 10);
        ctx.lineTo(25, 25); 
        ctx.lineTo(10, 20);
        ctx.lineTo(0, 25);
        ctx.lineTo(-10, 20);
        ctx.lineTo(-25, 25); 
        ctx.lineTo(-25, 10);
        ctx.lineTo(-10, -10);
        ctx.closePath();
        
        ctx.fill();
        ctx.stroke();

        // 駕駛艙
        ctx.fillStyle = '#ff00ff';
        ctx.shadowColor = '#ff00ff';
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(5, 5);
        ctx.lineTo(0, 10);
        ctx.lineTo(-5, 5);
        ctx.fill();

        ctx.restore();
    }
}

// 3. 子彈 (支援角度射擊)
class Bullet {
    constructor(x, y, angle = 0) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 15;
        this.speed = 600;
        this.angle = angle; // 射擊角度 (弧度)
        this.markedForDeletion = false;
        
        // 計算水平和垂直速度分量
        this.vx = Math.sin(angle) * this.speed;
        this.vy = -Math.cos(angle) * this.speed;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        
        // 邊界檢查
        if (this.y < -50 || this.x < -50 || this.x > WIDTH + 50) {
            this.markedForDeletion = true;
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle); // 讓子彈跟隨軌跡旋轉
        
        ctx.fillStyle = '#ffee00';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffee00';
        ctx.fillRect(-2, -7, this.width, this.height);
        
        ctx.restore();
    }
}

// 4. 升級彈藥箱 (PowerUp)
class PowerUp {
    constructor() {
        this.width = 30;
        this.height = 30;
        this.x = Math.random() * (WIDTH - 60) + 30;
        this.y = -40;
        this.speed = 150; // 掉落速度較慢
        this.markedForDeletion = false;
        this.oscillation = 0; // 左右搖晃
    }

    update(dt) {
        this.y += this.speed * dt * speedFactor;
        this.oscillation += dt * 5;
        this.x += Math.sin(this.oscillation) * 0.5; // 微微搖晃

        if (this.y > HEIGHT + 50) this.markedForDeletion = true;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // 畫一個發光的箱子
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00ff00'; // 綠色光芒
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
        
        // 旋轉效果
        ctx.rotate(Math.sin(this.oscillation) * 0.2);
        
        ctx.fillRect(-15, -15, 30, 30);
        ctx.strokeRect(-15, -15, 30, 30);
        
        // 內部文字 "UP"
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 0;
        ctx.font = "bold 12px Orbitron";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("UP", 0, 0);

        ctx.restore();
    }
}

// 5. 浮動文字特效 (吃到道具時顯示)
class FloatingText {
    constructor(x, y, text, color) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.life = 1.0;
        this.vy = -50; // 向上飄
    }
    update(dt) {
        this.y += this.vy * dt;
        this.life -= dt;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.font = "bold 20px Orbitron";
        ctx.textAlign = "center";
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

// 6. 隕石
class Meteor {
    constructor() {
        this.radius = Math.random() * 20 + 15;
        this.x = Math.random() * (WIDTH - this.radius * 2) + this.radius;
        this.y = -this.radius;
        this.baseSpeed = (Math.random() * 100 + 50); 
        this.markedForDeletion = false;
        
        this.type = Math.random() > 0.5 ? 0 : 1; 
        this.rotation = 0;
        this.rotSpeed = Math.random() * 2 - 1;
        this.color = this.type === 0 ? '#ff0055' : '#aa00ff';
    }

    update(dt) {
        let currentSpeed = this.baseSpeed * speedFactor;
        this.y += currentSpeed * dt;
        this.rotation += this.rotSpeed * dt;

        if (this.y > HEIGHT + this.radius) {
            this.markedForDeletion = true;
            loseLife();
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';

        if (this.type === 0) {
            ctx.strokeRect(-this.radius, -this.radius, this.radius*2, this.radius*2);
            ctx.fillRect(-this.radius, -this.radius, this.radius*2, this.radius*2);
            ctx.beginPath();
            ctx.moveTo(-this.radius, -this.radius);
            ctx.lineTo(this.radius, this.radius);
            ctx.stroke();
        } else {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                ctx.lineTo(Math.cos(angle) * this.radius, Math.sin(angle) * this.radius);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0,0, this.radius * 0.5, 0, Math.PI*2);
            ctx.stroke();
        }
        ctx.restore();
    }
}

// 7. 粒子
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 300;
        this.vy = (Math.random() - 0.5) * 300;
        this.life = 1.0;
        this.color = color;
        this.size = Math.random() * 3 + 1;
        this.markedForDeletion = false;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life -= dt * 2.5;
        if (this.life <= 0) this.markedForDeletion = true;
    }

    draw() {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
    }
}

// --- MAIN SETUP ---

const stars = Array.from({ length: 60 }, () => new Star());
let player = new Spaceship();
let bullets = [];
let meteors = [];
let particles = [];
let powerUps = [];
let floatTexts = [];

function init() {
    window.addEventListener('keydown', e => {
        if(e.code in keys) keys[e.code] = true;
        
        // 射擊邏輯 (Space)
        if (e.code === 'Space' && currentState === STATES.PLAYING) {
            fireBullet();
        }
    });
    
    window.addEventListener('keyup', e => {
        if(e.code in keys) keys[e.code] = false;
    });

    document.getElementById('btn-start').addEventListener('click', () => {
        if (currentState === STATES.READY || currentState === STATES.GAMEOVER) {
            startGame();
        } else if (currentState === STATES.PAUSED) {
            currentState = STATES.PLAYING;
            updateUI();
        }
    });

    document.getElementById('btn-pause').addEventListener('click', () => {
        if (currentState === STATES.PLAYING || currentState === STATES.PAUSED) {
            currentState = (currentState === STATES.PLAYING) ? STATES.PAUSED : STATES.PLAYING;
            updateUI();
        }
    });

    document.getElementById('btn-reset').addEventListener('click', resetGame);

    document.getElementById('btn-faster').addEventListener('click', (e) => {
        speedFactor = parseFloat((speedFactor + 0.1).toFixed(1));
        updateUI();
        e.target.blur();
    });

    document.getElementById('btn-slower').addEventListener('click', (e) => {
        if(speedFactor > 0.2) {
            speedFactor = parseFloat((speedFactor - 0.1).toFixed(1));
            updateUI();
        }
        e.target.blur();
    });

    requestAnimationFrame(gameLoop);
}

// 射擊函數：根據等級發射不同數量的子彈
function fireBullet() {
    const x = player.x;
    const y = player.y - player.height/2;

    // Level 1: 單發
    bullets.push(new Bullet(x, y, 0));

    // Level 2: 增加 3 發散射 (+10度, -10度)
    if (player.weaponLevel >= 2) {
        bullets.push(new Bullet(x, y, 0.15));  // 右前
        bullets.push(new Bullet(x, y, -0.15)); // 左前
    }

    // Level 3: 增加 5 發散射 (+25度, -25度)
    if (player.weaponLevel >= 3) {
        bullets.push(new Bullet(x, y, 0.3));  // 更右
        bullets.push(new Bullet(x, y, -0.3)); // 更左
    }
}

function resetGame() {
    currentState = STATES.READY;
    score = 0;
    lives = 3;
    speedFactor = 1.0;
    player.reset();
    bullets = [];
    meteors = [];
    particles = [];
    powerUps = [];
    floatTexts = [];
    meteorTimer = 0;
    powerUpTimer = 0;
    updateUI();
}

function startGame() {
    resetGame();
    currentState = STATES.PLAYING;
    updateUI();
}

function createFloatingText(x, y, text, color) {
    floatTexts.push(new FloatingText(x, y, text, color));
}

function loseLife() {
    lives--;
    updateUI();
    glitchOffset = 10; 
    setTimeout(() => glitchOffset = 0, 100);
    createExplosion(player.x, player.y, '#ff0000', 15);
    
    // 受傷時武器降級? 這裡先設定不降級，讓玩家比較爽
    // if (player.weaponLevel > 1) player.weaponLevel--;

    if (lives <= 0) {
        currentState = STATES.GAMEOVER;
        updateUI();
    }
}

function createExplosion(x, y, color, count) {
    for(let i=0; i<count; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function updateUI() {
    document.getElementById('state-display').innerText = currentState;
    document.getElementById('score-display').innerText = score;
    const health = Math.max(0, Math.round((lives / 3) * 100));
    document.getElementById('lives-display').innerText = health + '%';
    document.getElementById('lives-display').style.color = health < 40 ? '#ff0000' : '#00f3ff';
    document.getElementById('speed-display').innerText = speedFactor;
}

function gameLoop(timestamp) {
    let dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    if (dt > 0.1) dt = 0.1;

    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    
    // 繪製背景網格
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for(let i=0; i<WIDTH; i+=40) { ctx.moveTo(i, 0); ctx.lineTo(i, HEIGHT); }
    let gridOffset = (timestamp * 0.1 * speedFactor) % 40;
    for(let i=0; i<HEIGHT; i+=40) { 
        let y = i + gridOffset;
        if(y < HEIGHT) { ctx.moveTo(0, y); ctx.lineTo(WIDTH, y); }
    }
    ctx.stroke();

    ctx.save();
    if(glitchOffset > 0) {
        ctx.translate((Math.random() - 0.5) * glitchOffset, (Math.random() - 0.5) * glitchOffset);
    }

    stars.forEach(star => { star.update(dt); star.draw(); });

    switch (currentState) {
        case STATES.OPENING:
            updateOpening(dt);
            drawOpening();
            break;
        case STATES.READY:
            drawReady();
            break;
        case STATES.PLAYING:
            updatePlaying(dt);
            drawPlaying();
            break;
        case STATES.PAUSED:
            drawPlaying();
            drawPaused();
            break;
        case STATES.GAMEOVER:
            drawPlaying();
            drawGameOver();
            break;
    }

    ctx.restore();
    requestAnimationFrame(gameLoop);
}

function updateOpening(dt) {
    openingTimer += dt;
    if (openingTimer > 3) {
        currentState = STATES.READY;
        updateUI();
    }
}

function drawOpening() {
    ctx.textAlign = "center";
    ctx.fillStyle = "#00f3ff";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#00f3ff";
    let scale = 1 + Math.sin(openingTimer * 3) * 0.1;
    ctx.font = "bold 50px Orbitron";
    ctx.save();
    ctx.translate(WIDTH/2, HEIGHT/2);
    ctx.scale(scale, scale);
    ctx.fillText("CYBER DEFENDER", 0, 0);
    ctx.font = "20px Orbitron";
    ctx.fillStyle = "#ff00ff";
    ctx.shadowColor = "#ff00ff";
    ctx.fillText("INITIALIZING SYSTEM...", 0, 40);
    ctx.restore();
}

function drawReady() {
    player.draw();
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "white";
    ctx.font = "30px Orbitron";
    if (Math.floor(Date.now() / 500) % 2 === 0) {
        ctx.fillText("PRESS [START]", WIDTH/2, HEIGHT/2);
    }
    ctx.font = "14px Orbitron";
    ctx.fillStyle = "#00f3ff";
    ctx.shadowBlur = 0;
    ctx.fillText("ARROWS TO MOVE // SPACE TO FIRE", WIDTH/2, HEIGHT/2 + 40);
}

function drawPaused() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "rgba(0, 243, 255, 0.2)";
    for(let i=0; i<HEIGHT; i+=4) { ctx.fillRect(0, i, WIDTH, 1); }
    ctx.fillStyle = "#ffee00";
    ctx.font = "40px Orbitron";
    ctx.textAlign = "center";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#ffee00";
    ctx.fillText("SYSTEM FROZEN", WIDTH/2, HEIGHT/2);
}

function drawGameOver() {
    ctx.fillStyle = "rgba(20, 0, 0, 0.8)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "#ff0000";
    ctx.font = "bold 60px Orbitron";
    ctx.textAlign = "center";
    ctx.shadowBlur = 20;
    ctx.shadowColor = "red";
    ctx.fillText("FATAL ERROR", WIDTH/2, HEIGHT/2 - 20);
    ctx.fillStyle = "white";
    ctx.font = "30px Orbitron";
    ctx.shadowBlur = 0;
    ctx.fillText("DATA SECURED: " + score, WIDTH/2, HEIGHT/2 + 50);
}

function updatePlaying(dt) {
    // 1. 調整後的隕石生成邏輯 (更平滑的難度曲線)
    meteorTimer += dt;
    // 原本公式太激進。修改為：基礎 1.5秒，每 3000 分減少 1 秒，最快 0.4 秒
    let difficulty = score / 3000; 
    let spawnRate = Math.max(0.4, 1.5 - difficulty); 
    
    if (meteorTimer > spawnRate) {
        meteors.push(new Meteor());
        meteorTimer = 0;
    }

    // 2. 升級箱生成 (每 15 秒 50% 機率，或更頻繁)
    powerUpTimer += dt;
    if (powerUpTimer > 10) { // 每 10 秒嘗試生成一次
        if (Math.random() > 0.3) { // 70% 機率生成
            powerUps.push(new PowerUp());
        }
        powerUpTimer = 0;
    }

    player.update(dt);

    // Update Entities
    bullets.forEach(b => b.update(dt));
    bullets = bullets.filter(b => !b.markedForDeletion);

    meteors.forEach(m => m.update(dt));
    powerUps.forEach(p => p.update(dt));
    floatTexts.forEach(t => t.update(dt));
    
    // --- 碰撞偵測 ---

    // A. 玩家吃到升級箱
    powerUps.forEach(p => {
        if (!p.markedForDeletion) {
             let dx = player.x - p.x;
             let dy = player.y - p.y;
             let dist = Math.sqrt(dx*dx + dy*dy);
             if (dist < 40) { // 碰撞範圍
                 p.markedForDeletion = true;
                 player.upgradeWeapon(); // 升級武器
             }
        }
    });

    // B. 隕石碰撞
    meteors.forEach(meteor => {
        // 子彈 vs 隕石
        bullets.forEach(bullet => {
            let collision = 
                bullet.x < meteor.x + meteor.radius &&
                bullet.x + bullet.width > meteor.x - meteor.radius &&
                bullet.y < meteor.y + meteor.radius &&
                bullet.y + bullet.height > meteor.y - meteor.radius;

            if (!bullet.markedForDeletion && !meteor.markedForDeletion && collision) {
                meteor.markedForDeletion = true;
                bullet.markedForDeletion = true;
                score += 100;
                createExplosion(meteor.x, meteor.y, meteor.color, 12);
                updateUI();
            }
        });

        // 船 vs 隕石
        if (!meteor.markedForDeletion) {
             let dx = player.x - meteor.x;
             let dy = player.y - meteor.y;
             let dist = Math.sqrt(dx*dx + dy*dy);
             
             if (dist < (meteor.radius + 20)) {
                meteor.markedForDeletion = true;
                loseLife();
             }
        }
    });

    meteors = meteors.filter(m => !m.markedForDeletion);
    powerUps = powerUps.filter(p => !p.markedForDeletion);
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => !p.markedForDeletion);
    floatTexts = floatTexts.filter(t => t.life > 0);
}

function drawPlaying() {
    bullets.forEach(b => b.draw());
    powerUps.forEach(p => p.draw()); // 畫出升級箱
    player.draw();
    meteors.forEach(m => m.draw());
    particles.forEach(p => p.draw());
    floatTexts.forEach(t => t.draw()); // 畫出浮動文字
}

init();