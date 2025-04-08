document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const startButton = document.getElementById('startButton');
    const scoreDisplay = document.getElementById('score');
    const livesDisplay = document.getElementById('lives');
    const levelDisplay = document.getElementById('level');
    const ballColorPicker = document.getElementById('ballColor');
    const backgroundTheme = document.getElementById('backgroundTheme');
    const gameMode = document.getElementById('gameMode');
    
    // Set canvas dimensions
    canvas.width = 800;
    canvas.height = 500;
    
    // Game variables
    let gameRunning = false;
    let score = 0;
    let lives = 3;
    let level = 1;
    let animationId;
    let obstacles = [];
    let collectibles = [];
    let powerUps = [];
    let obstacleSpeed = 3;
    let spawnRate = 100;
    let frameCount = 0;
    let isPowerUpActive = false;
    let activePowerUpType = null;
    let powerUpTimer = 0;
    let particles = [];
    
    // Ball properties
    const ball = {
        x: canvas.width / 4,
        y: canvas.height / 2,
        radius: 20,
        color: '#7c3aed',
        velocityX: 0,
        velocityY: 0,
        gravity: 0.5,
        friction: 0.98,
        jump: -12,
        isShielded: false,
        isMagnet: false
    };
    
    // Background themes
    const themes = {
        default: {
            background: '#f8fafc',
            obstacles: '#1e293b',
            collectibles: '#f59e0b',
            powerUps: {
                shield: '#06b6d4',
                magnet: '#ec4899',
                slowTime: '#10b981',
                extraLife: '#ef4444'
            }
        },
        space: {
            background: '#0f172a',
            obstacles: '#6c5ce7',
            collectibles: '#00cec9',
            powerUps: {
                shield: '#06b6d4',
                magnet: '#ec4899',
                slowTime: '#10b981',
                extraLife: '#ef4444'
            }
        },
        underwater: {
            background: '#0ea5e9',
            obstacles: '#0369a1',
            collectibles: '#22d3ee',
            powerUps: {
                shield: '#06b6d4',
                magnet: '#ec4899',
                slowTime: '#10b981',
                extraLife: '#ef4444'
            }
        },
        forest: {
            background: '#10b981',
            obstacles: '#047857',
            collectibles: '#fbbf24',
            powerUps: {
                shield: '#06b6d4',
                magnet: '#ec4899',
                slowTime: '#10b981',
                extraLife: '#ef4444'
            }
        },
        lava: {
            background: '#b91c1c',
            obstacles: '#7f1d1d',
            collectibles: '#fbbf24',
            powerUps: {
                shield: '#06b6d4',
                magnet: '#ec4899',
                slowTime: '#10b981',
                extraLife: '#ef4444'
            }
        }
    };
    
    // Game modes
    const modes = {
        classic: {
            obstacleSpeed: 3,
            spawnRate: 100,
            gravity: 0.5
        },
        extreme: {
            obstacleSpeed: 5,
            spawnRate: 70,
            gravity: 0.7
        },
        zen: {
            obstacleSpeed: 2,
            spawnRate: 120,
            gravity: 0.3
        }
    };
    
    // Current theme and mode
    let currentTheme = themes.default;
    let currentMode = modes.classic;
    
    // Event listeners
    startButton.addEventListener('click', toggleGame);
    ballColorPicker.addEventListener('change', function() {
        ball.color = this.value;
    });
    
    backgroundTheme.addEventListener('change', function() {
        currentTheme = themes[this.value];
    });
    
    gameMode.addEventListener('change', function() {
        currentMode = modes[this.value];
        resetGameSettings();
    });
    
    // Keyboard controls
    const keys = {};
    
    window.addEventListener('keydown', function(e) {
        keys[e.key] = true;
    });
    
    window.addEventListener('keyup', function(e) {
        keys[e.key] = false;
    });
    
    // Game functions
    function toggleGame() {
        if (gameRunning) {
            gameRunning = false;
            cancelAnimationFrame(animationId);
            startButton.textContent = 'Start Game';
        } else {
            gameRunning = true;
            resetGame();
            startButton.textContent = 'Pause Game';
            gameLoop();
        }
    }
    
    function resetGameSettings() {
        obstacleSpeed = currentMode.obstacleSpeed;
        spawnRate = currentMode.spawnRate;
        ball.gravity = currentMode.gravity;
    }
    
    function resetGame() {
        score = 0;
        lives = 3;
        level = 1;
        scoreDisplay.textContent = score;
        livesDisplay.textContent = lives;
        levelDisplay.textContent = level;
        obstacles = [];
        collectibles = [];
        powerUps = [];
        particles = [];
        ball.x = canvas.width / 4;
        ball.y = canvas.height / 2;
        ball.velocityX = 0;
        ball.velocityY = 0;
        ball.isShielded = false;
        ball.isMagnet = false;
        isPowerUpActive = false;
        activePowerUpType = null;
        powerUpTimer = 0;
        resetGameSettings();
        frameCount = 0;
    }
    
    function gameLoop() {
        if (!gameRunning) return;
        
        // Clear canvas
        ctx.fillStyle = currentTheme.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Update particles
        updateParticles();
        
        // Update ball
        updateBall();
        
        // Spawn obstacles, collectibles, and power-ups
        if (frameCount % spawnRate === 0) {
            spawnObstacle();
            
            // Spawn collectible with 80% chance
            if (Math.random() < 0.8) {
                spawnCollectible();
            }
            
            // Spawn power-up with 15% chance
            if (Math.random() < 0.15) {
                spawnPowerUp();
            }
        }
        
        // Update and draw obstacles
        updateObstacles();
        
        // Update and draw collectibles
        updateCollectibles();
        
        // Update and draw power-ups
        updatePowerUps();
        
        // Draw ball
        drawBall();
        
        // Check collisions
        checkCollisions();
        
        // Update power-up timer
        if (isPowerUpActive) {
            powerUpTimer--;
            
            if (powerUpTimer <= 0) {
                deactivatePowerUp();
            }
            
            // Draw power-up indicator
            drawPowerUpIndicator();
        }
        
        // Increase difficulty
        if (frameCount % 1000 === 0) {
            increaseLevel();
        }
        
        frameCount++;
        animationId = requestAnimationFrame(gameLoop);
    }
    
    function updateBall() {
        // Handle keyboard input
        if ((keys['ArrowUp'] || keys['w'] || keys[' ']) && ball.y >= canvas.height - ball.radius - 10) {
            ball.velocityY = ball.jump;
            createJumpParticles();
        }
        
        if (keys['ArrowLeft'] || keys['a']) {
            ball.velocityX -= 0.5;
        }
        
        if (keys['ArrowRight'] || keys['d']) {
            ball.velocityX += 0.5;
        }
        
        // Apply gravity
        ball.velocityY += ball.gravity;
        
        // Apply friction
        ball.velocityX *= ball.friction;
        
        // Update position
        ball.x += ball.velocityX;
        ball.y += ball.velocityY;
        
        // Boundary checks
        if (ball.x - ball.radius < 0) {
            ball.x = ball.radius;
            ball.velocityX = 0;
        }
        
        if (ball.x + ball.radius > canvas.width) {
            ball.x = canvas.width - ball.radius;
            ball.velocityX = 0;
        }
        
        if (ball.y - ball.radius < 0) {
            ball.y = ball.radius;
            ball.velocityY = 0;
        }
        
        if (ball.y + ball.radius > canvas.height) {
            ball.y = canvas.height - ball.radius;
            ball.velocityY = 0;
        }
        
        // Create trail particles
        if (frameCount % 3 === 0) {
            createTrailParticle();
        }
    }
    
    function drawBall() {
        // Draw shield if active
        if (ball.isShielded) {
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius + 10, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(6, 182, 212, 0.3)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.closePath();
        }
        
        // Draw magnet indicator if active
        if (ball.isMagnet) {
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius + 15, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(236, 72, 153, 0.8)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.closePath();
        }
        
        // Draw ball
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();
        ctx.closePath();
        
        // Draw face on ball
        const eyeRadius = ball.radius / 5;
        const mouthWidth = ball.radius / 2;
        
        // Left eye
        ctx.beginPath();
        ctx.arc(ball.x - ball.radius / 3, ball.y - ball.radius / 4, eyeRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.closePath();
        
        // Right eye
        ctx.beginPath();
        ctx.arc(ball.x + ball.radius / 3, ball.y - ball.radius / 4, eyeRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.closePath();
        
        // Pupils
        ctx.beginPath();
        ctx.arc(ball.x - ball.radius / 3, ball.y - ball.radius / 4, eyeRadius / 2, 0, Math.PI * 2);
        ctx.fillStyle = 'black';
        ctx.fill();
        ctx.closePath();
        
        ctx.beginPath();
        ctx.arc(ball.x + ball.radius / 3, ball.y - ball.radius / 4, eyeRadius / 2, 0, Math.PI * 2);
        ctx.fillStyle = 'black';
        ctx.fill();
        ctx.closePath();
        
        // Mouth - smile if power-up active, otherwise normal
        ctx.beginPath();
        if (isPowerUpActive) {
            ctx.arc(ball.x, ball.y + ball.radius / 4, mouthWidth, 0, Math.PI);
        } else {
            ctx.arc(ball.x, ball.y + ball.radius / 4, mouthWidth / 1.5, 0, Math.PI);
        }
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
    }
    
    function spawnObstacle() {
        const height = Math.random() * (canvas.height / 3) + 50;
        const gap = Math.random() * 100 + 150 - (level * 5); // Gap gets smaller as level increases
        
        // Add some variation to obstacles
        const obstacleWidth = Math.random() * 20 + 40;
        
        obstacles.push({
            x: canvas.width,
            y: 0,
            width: obstacleWidth,
            height: height,
            color: currentTheme.obstacles,
            passed: false,
            hasSpikes: Math.random() > 0.7 // 30% chance of having spikes
        });
        
        obstacles.push({
            x: canvas.width,
            y: height + gap,
            width: obstacleWidth,
            height: canvas.height - height - gap,
            color: currentTheme.obstacles,
            passed: false,
            hasSpikes: Math.random() > 0.7 // 30% chance of having spikes
        });
    }
    
    function updateObstacles() {
        for (let i = 0; i < obstacles.length; i++) {
            const obstacle = obstacles[i];
            
            // Move obstacle
            obstacle.x -= obstacleSpeed;
            
            // Draw obstacle
            ctx.fillStyle = obstacle.color;
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            // Draw spikes if obstacle has them
            if (obstacle.hasSpikes) {
                drawSpikes(obstacle);
            }
            
            // Check if obstacle is off screen
            if (obstacle.x + obstacle.width < 0) {
                obstacles.splice(i, 1);
                i--;
                continue;
            }
            
            // Check if ball has passed obstacle
            if (!obstacle.passed && obstacle.x + obstacle.width < ball.x - ball.radius) {
                obstacle.passed = true;
                score++;
                scoreDisplay.textContent = score;
                createScoreParticles(ball.x, ball.y - 30);
            }
        }
    }
    
    function drawSpikes(obstacle) {
        const spikeHeight = 10;
        const spikeWidth = 5;
        const numSpikes = Math.floor(obstacle.height / 20);
        
        ctx.fillStyle = '#ef4444'; // Red spikes
        
        if (obstacle.y === 0) {
            // Spikes on bottom of top obstacle
            for (let i = 0; i < numSpikes; i++) {
                const spikeX = obstacle.x + obstacle.width / 2 - spikeWidth / 2;
                const spikeY = obstacle.height - (i * 20) - spikeHeight;
                
                if (spikeY > 0 && spikeY < obstacle.height) {
                    ctx.beginPath();
                    ctx.moveTo(spikeX, spikeY + spikeHeight);
                    ctx.lineTo(spikeX + spikeWidth / 2, spikeY);
                    ctx.lineTo(spikeX + spikeWidth, spikeY + spikeHeight);
                    ctx.closePath();
                    ctx.fill();
                }
            }
        } else {
            // Spikes on top of bottom obstacle
            for (let i = 0; i < numSpikes; i++) {
                const spikeX = obstacle.x + obstacle.width / 2 - spikeWidth / 2;
                const spikeY = obstacle.y + (i * 20);
                
                if (spikeY > obstacle.y && spikeY < obstacle.y + obstacle.height) {
                    ctx.beginPath();
                    ctx.moveTo(spikeX, spikeY);
                    ctx.lineTo(spikeX + spikeWidth / 2, spikeY - spikeHeight);
                    ctx.lineTo(spikeX + spikeWidth, spikeY);
                    ctx.closePath();
                    ctx.fill();
                }
            }
        }
    }
    
    function spawnCollectible() {
        collectibles.push({
            x: canvas.width,
            y: Math.random() * (canvas.height - 40) + 20,
            radius: 10,
            color: currentTheme.collectibles,
            collected: false,
            value: Math.random() > 0.8 ? 5 : 1, // 20% chance of being worth 5 points
            rotation: 0
        });
    }
    
    function updateCollectibles() {
        for (let i = 0; i < collectibles.length; i++) {
            const collectible = collectibles[i];
            
            // Move collectible
            collectible.x -= obstacleSpeed;
            
            // Update rotation
            collectible.rotation += 0.05;
            
            // Draw collectible
            ctx.save();
            ctx.translate(collectible.x, collectible.y);
            ctx.rotate(collectible.rotation);
            
            // Star shape for high-value collectibles, circle for regular
            if (collectible.value > 1) {
                drawStar(0, 0, 5, collectible.radius, collectible.radius / 2, collectible.color);
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, collectible.radius, 0, Math.PI * 2);
                ctx.fillStyle = collectible.color;
                ctx.fill();
                ctx.closePath();
            }
            
            ctx.restore();
            
            // Check if collectible is off screen
            if (collectible.x + collectible.radius < 0) {
                collectibles.splice(i, 1);
                i--;
            }
            
            // Check for magnet effect
            if (ball.isMagnet && !collectible.collected) {
                const dx = ball.x - collectible.x;
                const dy = ball.y - collectible.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) { // Magnet range
                    collectible.x += dx * 0.05;
                    collectible.y += dy * 0.05;
                }
            }
        }
    }
    
    function drawStar(cx, cy, spikes, outerRadius, innerRadius, color) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;
        
        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;
            
            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
    }
    
    function spawnPowerUp() {
        const types = ['shield', 'magnet', 'slowTime', 'extraLife'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        powerUps.push({
            x: canvas.width,
            y: Math.random() * (canvas.height - 40) + 20,
            radius: 15,
            color: currentTheme.powerUps[type],
            type: type,
            collected: false,
            pulse: 0,
            pulseDirection: 1
        });
    }
    
    function updatePowerUps() {
        for (let i = 0; i < powerUps.length; i++) {
            const powerUp = powerUps[i];
            
            // Move power-up
            powerUp.x -= obstacleSpeed;
            
            // Update pulse effect
            powerUp.pulse += 0.05 * powerUp.pulseDirection;
            if (powerUp.pulse >= 1) powerUp.pulseDirection = -1;
            if (powerUp.pulse <= 0) powerUp.pulseDirection = 1;
            
            // Draw power-up
            ctx.beginPath();
            ctx.arc(powerUp.x, powerUp.y, powerUp.radius + (powerUp.pulse * 3), 0, Math.PI * 2);
            ctx.fillStyle = powerUp.color;
            ctx.globalAlpha = 0.3;
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.closePath();
            
            ctx.beginPath();
            ctx.arc(powerUp.x, powerUp.y, powerUp.radius, 0, Math.PI * 2);
            ctx.fillStyle = powerUp.color;
            ctx.fill();
            ctx.closePath();
            
            // Draw power-up icon
            drawPowerUpIcon(powerUp);
            
            // Check if power-up is off screen
            if (powerUp.x + powerUp.radius < 0) {
                powerUps.splice(i, 1);
                i--;
            }
        }
    }
    
    function drawPowerUpIcon(powerUp) {
        ctx.fillStyle = 'white';
        
        switch (powerUp.type) {
            case 'shield':
                // Shield icon
                ctx.beginPath();
                ctx.arc(powerUp.x, powerUp.y, powerUp.radius * 0.6, 0, Math.PI * 2);
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.closePath();
                break;
                
            case 'magnet':
                // Magnet icon
                ctx.beginPath();
                ctx.moveTo(powerUp.x - powerUp.radius * 0.4, powerUp.y - powerUp.radius * 0.3);
                ctx.lineTo(powerUp.x - powerUp.radius * 0.4, powerUp.y + powerUp.radius * 0.3);
                ctx.lineTo(powerUp.x, powerUp.y + powerUp.radius * 0.3);
                ctx.lineTo(powerUp.x, powerUp.y);
                ctx.lineTo(powerUp.x + powerUp.radius * 0.4, powerUp.y);
                ctx.lineTo(powerUp.x + powerUp.radius * 0.4, powerUp.y - powerUp.radius * 0.3);
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.closePath();
                break;
                
            case 'slowTime':
                // Clock icon
                ctx.beginPath();
                ctx.arc(powerUp.x, powerUp.y, powerUp.radius * 0.6, 0, Math.PI * 2);
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.closePath();
                
                // Clock hands
                ctx.beginPath();
                ctx.moveTo(powerUp.x, powerUp.y);
                ctx.lineTo(powerUp.x, powerUp.y - powerUp.radius * 0.4);
                ctx.moveTo(powerUp.x, powerUp.y);
                ctx.lineTo(powerUp.x + powerUp.radius * 0.3, powerUp.y);
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.closePath();
                break;
                
            case 'extraLife':
                // Heart icon
                ctx.beginPath();
                ctx.moveTo(powerUp.x, powerUp.y + powerUp.radius * 0.3);
                ctx.bezierCurveTo(
                    powerUp.x, powerUp.y, 
                    powerUp.x - powerUp.radius * 0.5, powerUp.y, 
                    powerUp.x - powerUp.radius * 0.5, powerUp.y - powerUp.radius * 0.3
                );
                ctx.bezierCurveTo(
                    powerUp.x - powerUp.radius * 0.5, powerUp.y - powerUp.radius * 0.6, 
                    powerUp.x, powerUp.y - powerUp.radius * 0.6, 
                    powerUp.x, powerUp.y - powerUp.radius * 0.3
                );
                ctx.bezierCurveTo(
                    powerUp.x, powerUp.y - powerUp.radius * 0.6, 
                    powerUp.x + powerUp.radius * 0.5, powerUp.y - powerUp.radius * 0.6, 
                    powerUp.x + powerUp.radius * 0.5, powerUp.y - powerUp.radius * 0.3
                );
                ctx.bezierCurveTo(
                    powerUp.x + powerUp.radius * 0.5, powerUp.y, 
                    powerUp.x, powerUp.y, 
                    powerUp.x, powerUp.y + powerUp.radius * 0.3
                );
                ctx.fillStyle = 'white';
                ctx.fill();
                ctx.closePath();
                break;
        }
    }
    
    function activatePowerUp(type) {
        isPowerUpActive = true;
        activePowerUpType = type;
        powerUpTimer = 600; // 10 seconds at 60fps
        
        switch (type) {
            case 'shield':
                ball.isShielded = true;
                break;
                
            case 'magnet':
                ball.isMagnet = true;
                break;
                
            case 'slowTime':
                // Store original speed and spawn rate
                obstacleSpeed /= 2;
                break;
                
            case 'extraLife':
                lives++;
                livesDisplay.textContent = lives;
                isPowerUpActive = false; // Extra life is instant
                activePowerUpType = null;
                break;
        }
        
        // Create power-up activation particles
        createPowerUpParticles(ball.x, ball.y, type);
    }
    
    function deactivatePowerUp() {
        isPowerUpActive = false;
        
        switch (activePowerUpType) {
            case 'shield':
                ball.isShielded = false;
                break;
                
            case 'magnet':
                ball.isMagnet = false;
                break;
                
            case 'slowTime':
                // Restore original speed
                obstacleSpeed = currentMode.obstacleSpeed + (level - 1) * 0.2;
                break;
        }
        
        activePowerUpType = null;
    }
    
    function drawPowerUpIndicator() {
        // Draw power-up timer at the top of the screen
        const timerWidth = 200;
        const timerHeight = 10;
        const timerX = (canvas.width - timerWidth) / 2;
        const timerY = 20;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(timerX, timerY, timerWidth, timerHeight);
        
        // Timer fill
        let fillColor;
        switch (activePowerUpType) {
            case 'shield':
                fillColor = currentTheme.powerUps.shield;
                break;
            case 'magnet':
                fillColor = currentTheme.powerUps.magnet;
                break;
            case 'slowTime':
                fillColor = currentTheme.powerUps.slowTime;
                break;
            default:
                fillColor = '#ffffff';
        }
        
        const fillWidth = (powerUpTimer / 600) * timerWidth;
        ctx.fillStyle = fillColor;
        ctx.fillRect(timerX, timerY, fillWidth, timerHeight);
        
        // Power-up name
        ctx.fillStyle = 'white';
        ctx.font = '14px Poppins';
        ctx.textAlign = 'center';
        
        let powerUpName;
        switch (activePowerUpType) {
            case 'shield':
                powerUpName = 'Shield';
                break;
            case 'magnet':
                powerUpName = 'Magnet';
                break;
            case 'slowTime':
                powerUpName = 'Slow Time';
                break;
            default:
                powerUpName = 'Power-Up';
        }
        
        ctx.fillText(powerUpName, canvas.width / 2, timerY + timerHeight + 15);
    }
    
    function checkCollisions() {
        // Check collision with obstacles
        for (let i = 0; i < obstacles.length; i++) {
            const obstacle = obstacles[i];
            
            // Check if ball collides with obstacle
            if (
                ball.x + ball.radius > obstacle.x &&
                ball.x - ball.radius < obstacle.x + obstacle.width &&
                ball.y + ball.radius > obstacle.y &&
                ball.y - ball.radius < obstacle.y + obstacle.height
            ) {
                // If ball has shield, destroy the obstacle instead
                if (ball.isShielded) {
                    createExplosionParticles(obstacle.x, obstacle.y + obstacle.height / 2);
                    obstacles.splice(i, 1);
                    i--;
                    continue;
                }
                
                loseLife();
                return;
            }
        }
        
        // Check collision with collectibles
        for (let i = 0; i < collectibles.length; i++) {
            const collectible = collectibles[i];
            
            const dx = ball.x - collectible.x;
            const dy = ball.y - collectible.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < ball.radius + collectible.radius) {
                collectibles.splice(i, 1);
                i--;
                
                // Add points based on collectible value
                score += collectible.value;
                scoreDisplay.textContent = score;
                
                // Create particles
                createCollectParticles(collectible.x, collectible.y, collectible.color);
            }
        }
        
        // Check collision with power-ups
        for (let i = 0; i < powerUps.length; i++) {
            const powerUp = powerUps[i];
            
            const dx = ball.x - powerUp.x;
            const dy = ball.y - powerUp.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < ball.radius + powerUp.radius) {
                activatePowerUp(powerUp.type);
                powerUps.splice(i, 1);
                i--;
            }
        }
    }
    
    function loseLife() {
        lives--;
        livesDisplay.textContent = lives;
        
        if (lives <= 0) {
            gameOver();
            return;
        }
        
        // Reset ball position but keep the game running
        ball.x = canvas.width / 4;
        ball.y = canvas.height / 2;
        ball.velocityX = 0;
        ball.velocityY = 0;
        
        // Create explosion particles
        createExplosionParticles(ball.x, ball.y);
        
        // Temporary invincibility
        ball.isShielded = true;
        setTimeout(() => {
            ball.isShielded = false;
        }, 2000);
    }
    
    function increaseLevel() {
        level++;
        levelDisplay.textContent = level;
        
        // Increase difficulty
        obstacleSpeed += 0.2;
        if (spawnRate > 40) spawnRate -= 5;
        
        // Create level up particles
        createLevelUpParticles();
    }
    
    function gameOver() {
        gameRunning = false;
        cancelAnimationFrame(animationId);
        startButton.textContent = 'Restart Game';
        
        // Display game over message
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = 'bold 48px Poppins';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 50);
        
        ctx.font = '24px Poppins';
        ctx.fillText(`Score: ${score} | Level: ${level}`, canvas.width / 2, canvas.height / 2);
        
        ctx.font = '18px Poppins';
        ctx.fillText('Click "Restart Game" to play again', canvas.width / 2, canvas.height / 2 + 50);
    }
    
    // Particle effects
    function createTrailParticle() {
        particles.push({
            x: ball.x,
            y: ball.y,
            radius: Math.random() * 5 + 2,
            color: ball.color,
            alpha: 1,
            velocityX: (Math.random() - 0.5) * 2,
            velocityY: (Math.random() - 0.5) * 2,
            type: 'trail',
            life: 30
        });
    }
    
    function createJumpParticles() {
        for (let i = 0; i < 10; i++) {
            particles.push({
                x: ball.x + (Math.random() - 0.5) * ball.radius * 2,
                y: ball.y + ball.radius,
                radius: Math.random() * 3 + 1,
                color: '#ffffff',
                alpha: 1,
                velocityX: (Math.random() - 0.5) * 3,
                velocityY: Math.random() * 2 + 1,
                type: 'jump',
                life: 20
            });
        }
    }
    
    function createCollectParticles(x, y, color) {
        for (let i = 0; i < 15; i++) {
            particles.push({
                x: x,
                y: y,
                radius: Math.random() * 4 + 2,
                color: color,
                alpha: 1,
                velocityX: (Math.random() - 0.5) * 5,
                velocityY: (Math.random() - 0.5) * 5,
                type: 'collect',
                life: 40
            });
        }
    }
    
    function createExplosionParticles(x, y) {
        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 2;
            
            particles.push({
                x: x,
                y: y,
                radius: Math.random() * 5 + 3,
                color: '#ff4757',
                alpha: 1,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed,
                type: 'explosion',
                life: 60
            });
        }
    }
    
    function createPowerUpParticles(x, y, type) {
        let color;
        switch (type) {
            case 'shield':
                color = currentTheme.powerUps.shield;
                break;
            case 'magnet':
                color = currentTheme.powerUps.magnet;
                break;
            case 'slowTime':
                color = currentTheme.powerUps.slowTime;
                break;
            case 'extraLife':
                color = currentTheme.powerUps.extraLife;
                break;
            default:
                color = '#ffffff';
        }
        
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 1;
            
            particles.push({
                x: x,
                y: y,
                radius: Math.random() * 5 + 2,
                color: color,
                alpha: 1,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed,
                type: 'powerUp',
                life: 50
            });
        }
    }
    
    function createScoreParticles(x, y) {
        particles.push({
            x: x,
            y: y,
            text: '+1',
            color: '#ffffff',
            alpha: 1,
            velocityY: -1,
            type: 'score',
            life: 40
        });
    }
    
    function createLevelUpParticles() {
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            
            particles.push({
                x: x,
                y: y,
                radius: Math.random() * 5 + 2,
                color: `hsl(${Math.random() * 360}, 100%, 70%)`,
                alpha: 1,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed,
                type: 'levelUp',
                life: 80
            });
        }
    }
    
    function updateParticles() {
        for (let i = 0; i < particles.length; i++) {
            const particle = particles[i];
            
            // Update position
            particle.x += particle.velocityX;
            particle.y += particle.velocityY;
            
            // Update alpha
            particle.alpha = particle.life / (particle.type === 'trail' ? 30 : 40);
            
            // Draw particle
            if (particle.type === 'score') {
                ctx.font = '16px Poppins';
                ctx.fillStyle = `rgba(255, 255, 255, ${particle.alpha})`;
                ctx.textAlign = 'center';
                ctx.fillText(particle.text, particle.x, particle.y);
            } else {
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fillStyle = particle.color.includes('rgba') ? 
                    particle.color.replace(/[\d\.]+\)$/g, `${particle.alpha})`) : 
                    `rgba(${hexToRgb(particle.color)}, ${particle.alpha})`;
                ctx.fill();
                ctx.closePath();
            }
            
            // Decrease life
            particle.life--;
            
            // Remove dead particles
            if (particle.life <= 0) {
                particles.splice(i, 1);
                i--;
            }
        }
    }
    
    // Helper function to convert hex to rgb
    function hexToRgb(hex) {
        // Remove # if present
        hex = hex.replace('#', '');
        
        // Convert 3-digit hex to 6-digits
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        
        // Extract r, g, b values
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        return `${r}, ${g}, ${b}`;
    }
    
    // Initial draw
    ctx.fillStyle = currentTheme.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawBall();
});