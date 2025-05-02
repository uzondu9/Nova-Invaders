class UIManager {
    constructor(game) {
      this.game = game;

      // --- Bullet Bar Elements ---
      this.bulletBoxes    = document.querySelectorAll('.bab');
      this.selectedBullet = 'b1';
      this.highlightSelectedBullet();
      this.addBulletBoxListeners();

      // robot selection UI
      this.robotButtons = document.querySelectorAll('.robot-btn');                    
      this.selectedRobot = null;
      this.addRobotButtonListeners();
  
      this.screens = {
        stats:  document.getElementById('screen-STATS'),
        level:  document.getElementById('screen-LEVEL_START'),
        robot:  document.getElementById('screen-ROBOT_SELECT'),
        paused: document.getElementById('screen-PAUSED'),
        win:    document.getElementById('screen-WIN'),
        lose:   document.getElementById('screen-LOSE'),
        game:   document.getElementById('game')
      };
    }

    addBulletBoxListeners() {
        this.bulletBoxes.forEach(box => {
          box.addEventListener('click', () => {
            this.selectedBullet = box.id;
            this.highlightSelectedBullet();
            this.game.switchBullet(this.selectedBullet);
          });
        });
      }
    
    highlightSelectedBullet() {
        this.bulletBoxes.forEach(box => {
        box.style.border = (box.id === this.selectedBullet)
            ? '2px solid yellow'
            : '2px solid transparent';
        });
    }
      

    addRobotButtonListeners() {
    this.robotButtons.forEach(btn => {
        btn.addEventListener('click', () => {                                           // use addEventListener rather than onclick :contentReference[oaicite:4]{index=4}
        // 1) record selection
        this.selectedRobot = btn.dataset.color;                                       // read data-color via dataset :contentReference[oaicite:5]{index=5}
        // 2) visually highlight
        this.robotButtons.forEach(b => b.classList.remove('selected'));               // remove from all
        btn.classList.add('selected');                                                // highlight clicked
        // 3) inform Robot instance
        this.game.robot.setColor(this.selectedRobot);
        });
    });
    }

    hideAll() {
        Object.values(this.screens).forEach(el => el.classList.add('screen'));  
        Object.values(this.screens).forEach(el => el.classList.remove('ui-screen'));  
    }
    
    show(name) {
        this.hideAll();
        this.screens[name].classList.remove('screen');
        this.screens[name].classList.add('ui-screen');
        this.screens['game'].classList.remove('ui-screen');
        this.updateAll();
    }
  
    updateAll() {
      // top-bar stats
      document.querySelector('#top_bar #header p span').textContent     = this.game.level;
      document.querySelector('#destroyedEnemies .bar').textContent = this.game.enemiesDestroyed;
      document.querySelector('#totalEnemies .bar').textContent     = this.game.totalEnemies;
  
      // stats screen
      document.getElementById('ui-level').textContent        = this.game.level;
      document.getElementById('ui-games').textContent        = this.game.games;
      document.getElementById('ui-wins').textContent         = this.game.wins;
      document.getElementById('ui-loses').textContent        = this.game.loses;
      document.getElementById('ui-accuracy').textContent     = this.game.accuracy.toFixed(1);
  
      // level-start screen
      document.getElementById('ui-level-start').textContent    = this.game.level;
      document.getElementById('ui-total-start').textContent    = this.game.totalEnemies;
      document.getElementById('ui-accuracy-start').textContent = this.game.accuracy.toFixed(1);
  
      // win/lose screens
      document.getElementById('ui-new-level').textContent     = this.game.level;
      document.getElementById('ui-destroyed-end').textContent  = this.game.enemiesDestroyed;
      document.getElementById('ui-total-end').textContent      = this.game.totalEnemies;
   
    // bullet dynamic values
    this.bulletBoxes.forEach(box => {
        const type = box.id;               
        const pool = this.game.pools[type];  
        const max   = this.game.bulletCounts[type];

        // count how many bullets are currently free (available)
        const available = pool.filter(b => b.free).length;     

        // find the <span> we added for the count
        const countSpan = document.getElementById(`${type}-count`);
        if (countSpan) {
            countSpan.textContent = `${available}/${max}`;      
        }
     });
   
    }
}
  
class LevelManager {
    constructor() {
        this.level = 1;
        this.totalEnemies = 10;
    }

    nextLevel() {
        this.level++;

        if (this.level % 10 === 0) {
            // Special rule for multiples of 10
            this.totalEnemies = this.level * 5;
        } else {
            // Otherwise add 1-5 randomly
            const randomIncrease = Math.floor(Math.random() * 5) + 1;
            this.totalEnemies += randomIncrease;
        }
    }

    reset() {
        this.level = 1;
        this.totalEnemies = 10;
    }
}

class Tower {
    constructor(game, soundManager) {
        this.game = game;
        this.soundManager = soundManager;
        this.x = this.game.width * 0.5;
        this.y = this.game.height * 0.5;
        this.radius = 50;
        this.image = document.getElementById('tower');
        this.health = 100;
    }

    draw(context) {
        context.drawImage(this.image, this.x - 90, this.y - 80, 180, 180);
        // Tower Health UI
        context.fillStyle = 'black';
        context.fillRect(10, 10, 104, 14);
        context.fillStyle = 'limegreen';
        context.fillRect(12, 12, this.health, 10);
        context.strokeStyle = 'black';
        context.strokeRect(10, 10, 104, 14);

        if (this.game.debug) {
            context.beginPath();
            context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            context.stroke();
        }
    }

    takeDamage(amount) {
        this.health -= amount;

        if (this.health > 0) {
            this.soundManager.playTowerHit();
        } else {
            this.soundManager.playTowerDie();
        }
    }
}

class Robot {
    constructor(game, soundManager) {
        this.game = game;
        this.soundManager = soundManager;
        this.x = 0;
        this.y = 0;
        this.radius = 20;
        this.shootRadius = this.game.tower.radius;
        this.image = document.getElementById('shooter-3');
        this.angle = 0;
        this.aim = [0, 0, 0, 0];
        this.bullet = 'b1';
    }

    setColor(color){
        if(color == 'red'){
            this.image = document.getElementById('shooter-1');
        }
        if(color == 'blue'){
            this.image = document.getElementById('shooter-2');
        }
        if(color == 'green'){
            this.image = document.getElementById('shooter-3');
        }
        if(color == 'yellow'){
            this.image = document.getElementById('shooter-4');
        }

    }

    draw(context) {
        context.save();
        context.translate(this.game.tower.x, this.game.tower.y);
        context.rotate(this.angle + Math.PI / 2);
        context.drawImage(this.image, -65, -55, 130, 130);
        context.restore();

        const tip = this.getBarrelTipPosition();
        context.beginPath();
        context.arc(tip.x, tip.y, 5, 0, Math.PI * 2);
        context.fillStyle = 'red';
        context.fill();
    }

    update() {
        this.aim = this.game.target(this.game.mouse, this.game.tower);
        this.angle = Math.atan2(this.aim[3], this.aim[2]);
        this.x = this.game.tower.x + this.shootRadius;
        this.y = this.game.tower.y + this.shootRadius;
    }

    getBarrelTipPosition() {
        const offset = -60;
        const tipX = this.game.tower.x + Math.cos(this.angle) * offset;
        const tipY = this.game.tower.y + Math.sin(this.angle) * offset;
        return { x: tipX, y: tipY };
    }

    shoot() {
        const bullet = this.game.getBullet();
        if (bullet) {
            const { x, y } = this.getBarrelTipPosition();
            const dx = this.aim[0];
            const dy = this.aim[1];
            bullet.start(x, y, dx, dy);
            this.soundManager.playShootSound(this.bullet);
            this.game.logBulletCount?.();
        }
    }
}

class Bullet {
    constructor(game, robot, type = 'b1') {
        this.game = game;
        this.robot = robot;
        this.free = true;
        this.type = type;
        this.setBulletAttributes(type);
    }

    setBulletAttributes(type) {
        const bulletImages = {
            b1: new Image(),
            b2: new Image(),
            b3: new Image(),
            b4: new Image()
        };

        bulletImages.b1.src = 'sprites/10.png';
        bulletImages.b2.src = 'sprites/14.png';
        bulletImages.b3.src = 'sprites/33.png';
        bulletImages.b4.src = 'sprites/61.png';

        const bulletTypes = {
            b1: { radius: 35, color: 'orange', refillRate: 0, image: bulletImages.b1, damage: 25 },
            b2: { radius: 25, color: 'purple', refillRate: 333, image: bulletImages.b2 ,damage: 50},
            b3: { radius: 30, color: 'red', refillRate: 500, image: bulletImages.b3 ,damage: 75},
            b4: { radius: 30, color: 'blue', refillRate: 1000, image: bulletImages.b4, damage: 100},
        };

        const { radius, color, refillRate, image, damage } = bulletTypes[type];
        this.radius = radius;
        this.color = color;
        this.refillRate = refillRate;
        this.image = image;
        this.damage = damage;
    }

    start(x, y, dx, dy) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.speedX = dx * 5;
        this.speedY = dy * 5;
        this.free = false;
    }

    update() {
        if (!this.free) {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.type === 'b1' && (this.x < 0 || this.x > this.game.width || this.y < 0 || this.y > this.game.height)) {
                this.reset();
            }
        }
    }

    draw(context) {
        if (!this.free) {
            context.save();
            const size = this.radius * 2;
            context.translate(this.x, this.y);
            const angle = Math.atan2(this.dy, this.dx);
            context.rotate(angle);
            if (this.image) {
                context.drawImage(this.image, -this.radius, -this.radius, size, size);
            } else {
                context.fillStyle = this.color;
                context.beginPath();
                context.arc(0, 0, this.radius, 0, Math.PI * 2);
                context.fill();
            }
            context.restore();
        }
    }

    reset() {
        this.free = true;
    }
}

class Enemy {
    constructor(game, soundManager) {
        this.game = game;
        this.soundManager = soundManager;
        this.free = true;

        // Sprite settings (defaults, will be overridden in setAttributes)
        this.image = null;
        this.spriteWidth = 512;
        this.spriteHeight = 512;
        this.frameX = 0;
        this.frameY = 0;
        this.maxFrame = 3;
        this.frameTimer = 0;
        this.frameInterval = 10; // How fast animation changes (smaller = faster)
    }

    setAttributes(type) {
        const baseSpeed = 0.25;
        const types = {
            'e1': { 
                speed: baseSpeed * 1, health: 100, size: 2, power: 20, color: 'green',
                imageSrc: 'sprites/e1.png', spriteWidth: 1024 / 2, spriteHeight: 512, maxFrame: 1, frameInterval: 15
            },
            'e2': { 
                speed: baseSpeed * 2, health: 125, size: 2, power: 25, color: 'yellow',
                imageSrc: 'sprites/e2.png', spriteWidth: 5120 / 10, spriteHeight: 512, maxFrame: 9, frameInterval: 8
            },
            'e3': { 
                speed: baseSpeed * 1, health: 250, size: 1.75, power: 50, color: 'red',
                imageSrc: 'sprites/e3.png', spriteWidth: 3072 / 6, spriteHeight: 512, maxFrame: 5, frameInterval: 12
            },
            'e4': { 
                speed: baseSpeed * 1, health: 175, size: 2, power: 20, color: 'purple',
                imageSrc: 'sprites/e4.png', spriteWidth: 2048 / 4, spriteHeight: 512, maxFrame: 3, frameInterval: 10
            },
            'e5': { 
                speed: baseSpeed * 0.75, health: 1000, size: 1.75, power: 75, color: 'black',
                imageSrc: 'sprites/e5.png', spriteWidth: 3288 / 6, spriteHeight: 548, maxFrame: 5, frameInterval: 15
            },
        };

        const attributes = types[type];
        if (!attributes) {
            console.error(`Unknown enemy type: ${type}`);
            return;
        }

        this.type = type;
        this.speed = attributes.speed;
        this.health = this.maxHealth = attributes.health;
        this.sizeMultiplier = attributes.size;
        this.power = attributes.power;
        this.color = attributes.color;
        this.radius = 40 * this.sizeMultiplier;

        // Sprite-specific settings
        this.spriteWidth = attributes.spriteWidth;
        this.spriteHeight = attributes.spriteHeight;
        this.maxFrame = attributes.maxFrame;
        this.frameInterval = attributes.frameInterval;

        this.image = new Image();
        this.image.src = attributes.imageSrc;

        // Shooting enemy (only e4 for now)
        this.shoots = (type === 'e4');
        this.shotCooldown = 500;
        this.shotTimer = 0;
    }

    start(x, y, targetX, targetY, type) {
        this.setAttributes(type);
        this.x = x;
        this.y = y;
        this.free = false;

        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.hypot(dx, dy);

        this.speedX = (dx / distance) * this.speed;
        this.speedY = (dy / distance) * this.speed;
    }

    update() {
        if (this.free) return;
        
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.health <= 0) {
            this.reset();
        }

        if (this.shoots) {
            this.shotTimer++;
            if (this.shotTimer >= this.shotCooldown) {
                this.shotTimer = 0;
                this.fireAtTower();
            }
        }
    }

    takeDamage(amount) {
        if (!this.game) return;
        this.health -= amount;

        if (this.health > 0) {
            this.soundManager.playEnemyHit(this.type)
        } else {
            this.soundManager.playEnemyDeath(this.type)
            this.reset();
        }
    }

    fireAtTower() {
        if (!this.game) return;
        
        const bullet = this.game.getEnemyBullet(); // Pull from pool
        if (bullet) {
            bullet.shoot(this.x, this.y, this.game.tower.x, this.game.tower.y);
            this.soundManager.playE4Shoot()
        }
    }

    draw(context) {
        if (this.free) return;
    
        context.save();
        context.translate(this.x, this.y);
    
        // Calculate angle towards tower
        const dx = this.game.tower.x - this.x;
        const dy = this.game.tower.y - this.y;
        const angle = Math.atan2(dy, dx);
    
        context.rotate(angle + Math.PI / 2); // Add 90 degrees because sprite faces up by default
    
        if (this.image && this.image.complete) {
            context.drawImage(
                this.image,
                this.frameX * this.spriteWidth,
                this.frameY * this.spriteHeight,
                this.spriteWidth,
                this.spriteHeight,
                -this.radius,
                -this.radius,
                this.radius * 2,
                this.radius * 2
            );
        } else {
            // fallback circle if image not loaded
            context.beginPath();
            context.arc(0, 0, this.radius, 0, Math.PI * 2);
            context.fillStyle = this.color;
            context.fill();
            context.strokeStyle = 'black';
            context.stroke();
        }
    
        // Draw health bar (no rotation)
        context.restore();
        context.save();
        context.translate(this.x, this.y);
        context.fillStyle = 'red';
        context.fillRect(-this.radius, -this.radius - 10, this.radius * 2, 5);
        context.fillStyle = 'lime';
        const healthRatio = this.health / this.maxHealth;
        context.fillRect(-this.radius, -this.radius - 10, this.radius * 2 * healthRatio, 5);
        context.restore();
    
        this.animateFrames();
    }
    

    animateFrames() {
        this.frameTimer++;
        if (this.frameTimer >= this.frameInterval) {
            this.frameTimer = 0;
            this.frameX++;
            if (this.frameX > this.maxFrame) this.frameX = 0;
        }
    }

    reset() {
        this.free = true;
    }
}

class EnemyBullet {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.radius = 8;
        this.speed = 3;
        this.free = true;
        this.image = document.getElementById('eBullet');
        this.damage = 5;
    }

    shoot(sx, sy, tx, ty) {
        this.x = sx;
        this.y = sy;
        const dx = tx - sx;
        const dy = ty - sy;
        const angle = Math.atan2(dy, dx);
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        this.free = false;
    }

    update() {
        if (this.free) return;
        this.x += this.vx;
        this.y += this.vy;

        // If offscreen
        if (
            this.x < 0 || this.x > canvas.width ||
            this.y < 0 || this.y > canvas.height
        ) {
            this.free = true;
        }
    }

    draw(ctx) {
        if (this.free) return;
        const size = this.radius * 2;
        // context.drawImage(this.image, this.radius, this.radius, size, size);
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    reset() {
        this.free = true;
    }
}

class HitEffect {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.radius = 0;
        this.maxRadius = 15;
        this.alpha = 1;
        this.active = false;
    }

    trigger(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.alpha = 1;
        this.active = true;
    }

    update() {
        if (!this.active) return;
        this.radius += 2;
        this.alpha -= 0.1;
        if (this.alpha <= 0) {
            this.active = false;
        }
    }

    draw(ctx) {
        if (!this.active) return;
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'yellow';
        ctx.fill();
        ctx.restore();
    }
}

class Explosion {
    constructor(x, y, type = 'enemy') {
        this.x = x;
        this.y = y;
        this.type = type; // 'enemy', 'e5', or 'tower'

        // Different sprites based on explosion type
        if (type === 'enemy') {
            this.image = document.getElementById('eExplo');
            this.spriteWidth = 192 / 6;
            this.spriteHeight = 192;
            this.maxFrames = 32;
        } else if (type === 'e5') {
            this.image = document.getElementById('e5Explo');
            this.spriteWidth = 1152 / 16;
            this.spriteHeight = 1152;
            this.maxFrames = 72;
        } else if (type === 'tower') {
            this.image = document.getElementById('towerExplo');
            this.spriteWidth = 352 / 8;
            this.spriteHeight = 352;
            this.maxFrames = 32;
        }

        this.frame = 0;
        this.frameTimer = 0;
        this.frameInterval = 50; // Time between frames in ms
        this.markedForDeletion = false;
        this.size = 300; // You can adjust this size to match
    }

    update(deltaTime) {
        this.frameTimer += deltaTime;
        if (this.frameTimer > this.frameInterval) {
            this.frame++;
            this.frameTimer = 0;
            if (this.frame >= this.maxFrames) {
                this.markedForDeletion = true;
            }
        }
    }

    draw(context) {
        context.drawImage(
            this.image,
            this.frame * this.spriteWidth, 0,
            this.spriteWidth, this.spriteHeight,
            this.x - this.size * 0.75,
            this.y - this.size * 0.75,
            this.size, this.size
        );
        
    }
}

class SoundManager {
    constructor() {
        this.sounds = {
            b1: new Audio('sounds/b1.mp3'),
            b2: new Audio('sounds/b2.mp3'),
            b3: new Audio('sounds/b3.mp3'),
            b4: new Audio('sounds/b4.wav'),
            eHit: new Audio('sounds/e-hit.wav'),
            eDie: new Audio('sounds/e-die.mp3'),
            e5Die: new Audio('sounds/e5-die.mp3'),
            e4Shot: new Audio('sounds/e4-shot.wav'),
            towerHit: new Audio('sounds/tower-hit.wav'),
            towerDie: new Audio('sounds/tower-die.mp3'),
        };
        this.backgroundMusic = new Audio('sounds/m1.mp3');
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = 0.5; // softer background volume

        // Game background music
        this.backgroundMusic2 = new Audio('sounds/m2.mp3');
        this.backgroundMusic2.loop = true;
        this.backgroundMusic2.volume = 0.5; 

        // Win
        this.win = new Audio('sounds/win.mp3');
        this.win.loop = false;
        this.win.volume = 1; 

        // Lose
        this.lose = new Audio('sounds/lose.mp3');
        this.lose.loop = false;
        this.lose.volume = 1; 

    }

    playBackgroundMusic() {
        this.backgroundMusic.play();
    }

    stopBackgroundMusic() {
        this.backgroundMusic.pause();
        this.backgroundMusic.currentTime = 0;
    }

    playBackgroundMusic2() {
        this.backgroundMusic2.play();
    }

    stopBackgroundMusic2() {
        this.backgroundMusic2.pause();
        this.backgroundMusic2.currentTime = 0;
    }

    playWin(){
        this.win.play();
    }

    stopWin(){
        this.win.pause();
        this.win.currentTime = 0;
    }

    playLose(){
        this.lose.play();
    }

    stopLose(){
        this.lose.pause();
        this.lose.currentTime = 0;
    }

    playShootSound(bulletType) {
        if (this.sounds[bulletType]) {
            this.sounds[bulletType].currentTime = 0;
            this.sounds[bulletType].play();
        }
    }

    playEnemyHit(){
        this.sounds.eHit.currentTime = 0;
        this.sounds.eHit.play();
    }

    playEnemyDeath(enemyType) {
        if (enemyType === 'e5' && this.sounds.e5Die) {
            this.sounds.e5Die.currentTime = 0;
            this.sounds.e5Die.play();
        } else if (this.sounds.eDie) {
            this.sounds.eDie.currentTime = 1;
            this.sounds.eDie.play();
            this.sounds.eDie.volume = 1;
        }
    }

    playE4Shoot() {
        this.sounds.e4Shot.currentTime = 0;
        this.sounds.e4Shot.play();
    }

    playTowerHit() {
        this.sounds.towerHit.currentTime = 0;
        this.sounds.towerHit.play();
    }

    playTowerDie() {
        this.sounds.towerDie.currentTime = 0;
        this.sounds.towerDie.play();
    }
}

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = canvas.width;
        this.height = canvas.height;
        this.debug = true;
        this.mouse = { x: 0, y: 0 };
        this.soundManager = new SoundManager();
        this.tower = new Tower(this, this.soundManager);
        this.robot = new Robot(this, this.soundManager);

        this.pools = { b1: [], b2: [], b3: [], b4: [] };
        this.bulletCounts = { b1: 36, b2: 24, b3: 16, b4: 8 };

        document.addEventListener('click', () => {
            this.soundManager.playBackgroundMusic();
        }, { once: true });

        // Stats
        this.level = 1;
        this.totalEnemies = 10; // Starting enemies for level 1
        this.spawnedEnemies = 0;
        this.enemiesDestroyed = 0;
        this.games = 0;
        this.wins = 0;
        this.loses = 0;
        this.accuracy = 0;

        const saved = localStorage.getItem('novaInvadersStats');
        if (saved) {
            try {
                const s = JSON.parse(saved);
                this.level    =  s.level  || 1;
                this.totalEnemies = s.totalEnemies || 10; 
                this.games    = s.games    || 0;
                this.wins     = s.wins     || 0;
                this.loses    = s.loses    || 0;
                this.accuracy = s.accuracy || 0;
            } catch {}
        }
        this.paused = true;

        this.ui = new UIManager(this);
        const ui = this.ui;

        this.refillIntervals = {};
        this.setupRefill('b2');
        this.setupRefill('b3');
        this.setupRefill('b4');

        ui.show('stats');
        // Stats → Level
        document.getElementById('btn-start')
            .addEventListener('click', () => {
                this.paused = true;   
                ui.show('level')
            });   

            // Level → Robot
        document.getElementById('btn-play')
        .addEventListener('click', () => {
            this.paused = true; 
            ui.show('robot');
        });

        // Robot → Play
        document.getElementById('btn-choose-robot')
            .addEventListener('click', () => {
                this.paused = false; 
                const color = this.ui.selectedRobot;
                if (!color) {
                    alert('Please select a robot color first!');
                    return;
                }
                ui.show('game');
                this.soundManager.stopBackgroundMusic();
                this.soundManager.playBackgroundMusic2();
            });

        // Pause → Pop-up
        document.getElementById('pause')
            .addEventListener('click', () => {
                this.paused = true;   
                ui.show('paused');
                this.soundManager.playBackgroundMusic();
                this.soundManager.stopBackgroundMusic2();
            });

        document.getElementById('btn-resume')
            .addEventListener('click', () => {
                this.paused = false; 
                ui.show('game');
                this.soundManager.stopBackgroundMusic();
                this.soundManager.playBackgroundMusic2();
            });

        document.getElementById('btn-quit')
            .addEventListener('click', () => {
                this.reset();
                ui.show('stats');
                this.soundManager.playBackgroundMusic();
                this.soundManager.stopBackgroundMusic2();
            });

        // Win popup
        document.getElementById('btn-next-level')
            .addEventListener('click', () => {
                this.reset(); 
                ui.show('level');
                this.soundManager.playBackgroundMusic();
            });

        // Lose popup
        document.getElementById('btn-replay')
            .addEventListener('click', () => {
                this.reset(); 
                this.resetBar();
                ui.show('stats');
                this.soundManager.playBackgroundMusic();
            });

        this.levelManager = new LevelManager();
    
        this.initBulletPools();

        this.enemyPool = [];
        this.initEnemyPool();
        this.enemyBullets = Array.from({ length: 30 }, () => new EnemyBullet());

        this.tower.health = 100;
        this.hitEffects = Array.from({ length: 20 }, () => new HitEffect());
        this.explosions = [];

        this.lastTime = 0;

        document.getElementById('game_area').addEventListener('mousemove', e => {
            this.mouse.x = e.offsetX;
            this.mouse.y = e.offsetY;
        });

        document.getElementById('game_area').addEventListener('mousedown', () => {
            this.robot.shoot();
        });

        window.addEventListener('keyup', e => {  
            if (e.key === 'd') this.debug = !this.debug;                             
            if (['1','2','3','4'].includes(e.key)) {
              const type = 'b' + e.key;
              this.switchBullet(type);
              this.ui.selectedBullet = type;
              this.ui.highlightSelectedBullet();                               
            }
          });
          
         // Spawning enemies
         this.spawnIntervalId = 
         setInterval(() => 
        { this.spawnEnemies(); }, 
         2000);
    }

    reset() {
        // 1. Pause simulation
        this.paused = true;
    
        // 2. Clear spawn timer for bullets and enemies
        clearInterval(this.spawnIntervalId);
        this.clearRefillIntervals();
    
        // 3. Reset tower
        this.tower.health     = 100;

        // 4. Clear and re-create pools
        Object.values(this.pools).forEach(pool =>
          pool.forEach(obj => obj.reset?.() )
        );
        this.enemyPool.forEach(e => e.reset());
    
        // 5. Clear effects & explosions
        this.hitEffects.forEach(e => e.reset?.());
        this.explosions.length = 0;
    
        // 6. Clear canvas
        const ctx = this.canvas.getContext('2d');
        if (ctx.reset) ctx.reset();        
        else ctx.clearRect(0, 0, this.width, this.height);
    
        // 7. Re-init spawn interval for next round
        this.spawnIntervalId = setInterval(() => this.spawnEnemies(), 2000);
    
        // 8. Refresh UI to show Stats screen
        this.ui.selectedBullet = 'b1'; 
        this.robot.bullet = 'b1';  
        this.ui.updateAll();
        this.ui.highlightSelectedBullet();
        
        // restart all refill intervals
        ['b2','b3','b4'].forEach(t => this.setupRefill(t));
    }

    resetBar(){
         // 1. Reset stats & counters
         this.spawnedEnemies   = 0;
         this.enemiesDestroyed = 0;
    }

    initBulletPools() {
        for (const type in this.pools) {
            const count = this.bulletCounts[type];
            for (let i = 0; i < count; i++) {
                this.pools[type].push(new Bullet(this, this.robot, type));
            }
        }
    }

    getBullet() {
        const pool = this.pools[this.robot.bullet];
        return pool.find(b => b.free);
    }

    setupRefill(type) {
        const pool = this.pools[type];
        const max = this.bulletCounts[type];
        if (!pool?.length) return;
    
        const rate = pool[0].refillRate;
    
        // Clear existing interval if any
        if (this.refillIntervals?.[type]) {
            clearInterval(this.refillIntervals[type]);
        }
    
        // Only set up refill if the bullet type is not currently selected
        if (this.robot.bullet !== type) {
            this.refillIntervals[type] = setInterval(() => {
                const freeCount = pool.filter(b => b.free).length;
                const inUse = pool.length - freeCount;
    
                if (inUse > 0 && freeCount < max) {
                    const bullet = pool.find(b => !b.free);
                    bullet.reset();
                }
            }, rate);
        }
    }

    switchBullet(type) {
        if (this.robot.bullet === type) return;
        const prev = this.robot.bullet;
        this.robot.bullet = type;
    
        // restart refill for the bullet we just deselected
        this.setupRefill(prev);                                     // MDN setInterval :contentReference[oaicite:14]{index=14}
    }
    
    clearRefillIntervals() {
        for (const type in this.refillIntervals) {
            clearInterval(this.refillIntervals[type]);
        }
        this.refillIntervals = {};
    }

    initEnemyPool() {
        for (let i = 0; i < this.totalEnemies; i++) {
            this.enemyPool.push(new Enemy(this, this.soundManager));
        }
    }

    getEnemy() {
        return this.enemyPool.find(e => e.free);
    }

    pickSpawnPoint(canvasWidth, canvasHeight, margin = 50) {
        const w = canvasWidth;
        const h = canvasHeight;
        const perimeter = 2 * (w + h);
      
        // random distance along the perimeter
        const d = Math.random() * perimeter;                       
      
        let x, y;
        if (d < w) {
          // top edge (0 ≤ x < w)
          x = d;
          y = -margin;
        } else if (d < w + h) {
          // right edge (0 ≤ y < h)
          x = w + margin;
          y = d - w;
        } else if (d < w + h + w) {
          // bottom edge (0 ≤ x < w)
          x = (d - w - h);
          y = h + margin;
        } else {
          // left edge (0 ≤ y < h)
          x = -margin;
          y = (d - 2 * w - h);
        }
      
        return { x, y };
    }
      
    spawnEnemy(type = 'e1') {
        const enemy = this.getEnemy();
        if (enemy) {
            const { x, y } = this.pickSpawnPoint(this.width, this.height, 50);  // 50px margin
            enemy.start(x, y, this.tower.x, this.tower.y, type)    
        }
    }

    spawnEnemies() {
        if (this.paused) return; 
        // Only spawn more enemies if we haven't reached the total for the level
        if (this.spawnedEnemies < this.totalEnemies) {
            const random = Math.random();
            if (random < 0.05) {
                this.spawnEnemy('e5'); // Boss
            } else {
                const regularTypes = ['e1', 'e2', 'e3', 'e4'];
                const randomType = regularTypes[Math.floor(Math.random() * regularTypes.length)];
                this.spawnEnemy(randomType);
            }
            this.spawnedEnemies++;
        }
    } 

    getEnemyBullet() {
        return this.enemyBullets.find(b => b.free);
    }

    checkCollision(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.hypot(dx, dy);
        const sumOfRadii = a.radius + b.radius;
    
        // Determine if the collision is between an enemy and the tower
        const isEnemyTowerCollision = 
            (a instanceof Enemy && b instanceof Tower) || 
            (a instanceof Tower && b instanceof Enemy);
    
        // Apply adjusted threshold only for enemy-tower collisions
        if (isEnemyTowerCollision) {
            return distance < sumOfRadii - 45;
        }
    
        // Use standard threshold for all other collisions
        return distance < sumOfRadii;
    }    
    
    target(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.hypot(dx, dy);
        const aimX = dx / distance * -1;
        const aimY = dy / distance * -1;
        return [aimX, aimY, dx, dy];
    }

    // Stats methods
    calculateAccuracy() {
        if (this.games > 0) {
            this.accuracy = (this.wins / this.games) * 100;
        } else {
            this.accuracy = 0;
        }
    }    

    updateStats(won) {
        this.games++;
        if (won) {
            this.wins++;
        } else {
            this.loses++;
        }
    }

    recordResult(won) {
        this.updateStats(won);       
        this.calculateAccuracy();     
        this.ui.updateAll(); 
        
        const toSave = {
            level:    this.level,
            totalEnemies: this.totalEnemies,
            enemiesDestroyed: this.enemiesDestroyed,
            games:    this.games,
            wins:     this.wins,
            loses:    this.loses,
            accuracy: this.accuracy
        };
        localStorage.setItem('novaInvadersStats', JSON.stringify(toSave));
    }

    // Level and enemy logic
    levelUp() {
        this.level++;
        this.enemiesDestroyed = 0;
        this.spawnedEnemies  = 0;
      
        // calculate new totalEnemies
        if (this.level % 10 === 0) {
          this.totalEnemies = this.level * 5;
        } else {
          this.totalEnemies += Math.floor(Math.random() * 5) + 1;
        }
      
        // --- Resize & reset enemyPool ---
        const newSize = this.totalEnemies;
        // If pool is too small, add more
        while (this.enemyPool.length < newSize) {
          this.enemyPool.push(new Enemy(this, this.soundManager));
        }
        // If pool is too large, truncate extra
        this.enemyPool.length = newSize;
        // Mark all as free so they can be spawned again
        this.enemyPool.forEach(e => e.reset());
      
        this.ui.updateAll();
    }

    frame(context, deltaTime) {
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.tower.draw(context);
        this.robot.update();
        this.robot.draw(context);

        Object.values(this.pools).flat().forEach(bullet => {
            bullet.update();
            bullet.draw(context);
        });

        this.enemyPool.forEach(enemy => {
            enemy.update();
            enemy.draw(context);
        });

        this.enemyBullets.forEach(bullet => {
            bullet.update();
            bullet.draw(context);
        });
        

        // Bullet vs Enemy
        for (const type in this.pools) {
            this.pools[type].forEach(bullet => {
                if (!bullet.free) {
                    this.enemyPool.forEach(enemy => {
                        if (!enemy.free && this.checkCollision(bullet, enemy)) {
                            enemy.takeDamage(bullet.damage);
                            bullet.reset();

                            const fx = this.hitEffects.find(e => !e.active);
                            if (fx) fx.trigger(enemy.x, enemy.y);

                            if (enemy.health <= 0) {
                                enemy.reset();
                                this.enemiesDestroyed++;
                                setTimeout(() => {
                                    if (this.enemiesDestroyed >= this.totalEnemies) {
                                        // Win condition
                                        this.ui.show('win');
                                        this.soundManager.stopBackgroundMusic();
                                        this.soundManager.stopBackgroundMusic2();
                                    
                                        this.soundManager.win.play();
                                        this.levelUp();
                                        this.recordResult(true);
                                    }
                                }, 2000);
                                
                                this.ui.updateAll();
                                this.explosions.push(new Explosion(enemy.x, enemy.y, 'enemy'));
                                if(enemy.type === 'e5'){
                                    this.explosions.push(new Explosion(enemy.x, enemy.y, 'e5'));
                                }
                            }
                        }
                    });
                }
            });
        }

        // Enemy Bullet vs Tower
        this.enemyBullets.forEach(bullet => {
            if (!bullet.free && this.checkCollision(bullet, this.tower)) {
                this.tower.takeDamage(bullet.damage);
                bullet.reset();
            }
        });

        // Enemy vs Tower
        this.enemyPool.forEach(enemy => {
            if (!enemy.free && this.checkCollision(enemy, this.tower)) {
                this.tower.takeDamage(enemy.power);

                this.enemiesDestroyed++;
                enemy.reset();

                setTimeout(() => {
                    if (this.tower.health <= 0) {
                        this.recordResult(false);
                        this.ui.updateAll(); 
                        this.ui.show('lose');
                        this.soundManager.stopBackgroundMusic();
                        this.soundManager.stopBackgroundMusic2();
                        this.soundManager.lose.play();
                        this.reset();
                        this.enemiesDestroyed = this.enemiesDestroyed;
                    }
                    if(this.enemiesDestroyed >= this.totalEnemies){
                        this.ui.show('win');
                        this.soundManager.stopBackgroundMusic();
                        this.soundManager.stopBackgroundMusic2();

                        this.soundManager.win.play();
                        this.levelUp();
                        this.recordResult(true);
                    }    
                }, 500);
               
            }
        });

        // Player Bullet vs Enemy Bullet
        for (const type in this.pools) {
            this.pools[type].forEach(playerBullet => {
                if (playerBullet.free) return;
                this.enemyBullets.forEach(enemyBullet => {
                    if (enemyBullet.free) return;
                    if (this.checkCollision(playerBullet, enemyBullet)) {
                        playerBullet.reset();
                        enemyBullet.reset();

                        const fx = this.hitEffects.find(e => !e.active);
                        if (fx) fx.trigger(enemyBullet.x, enemyBullet.y);
                    }
                });
            });
        }

        this.hitEffects.forEach(effect => {
            effect.update();
            effect.draw(context);
        });

        this.explosions.forEach(explosion => explosion.update(deltaTime));
        this.explosions = this.explosions.filter(explosion => !explosion.markedForDeletion);
        this.explosions.forEach(explosion => explosion.draw(context));
    }
}

window.addEventListener('resize', () => {
    const gameArea = document.getElementById('game_area');
    const canvas = document.getElementById('canvas');
    canvas.width = gameArea.clientWidth;
    canvas.height = gameArea.clientHeight;
});

window.addEventListener('load', () => {
    const gameArea = document.getElementById('game_area');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = gameArea.clientWidth;
    canvas.height = gameArea.clientHeight;

    const game = new Game(canvas);

    let lastTime = 0;
    
    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;

        if (!game.paused){
            game.ui.updateAll();
            game.frame(ctx, deltaTime);
        }

        requestAnimationFrame(animate);
    }

    animate(0);
});





