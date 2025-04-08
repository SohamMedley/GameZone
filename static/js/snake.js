document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('snakeCanvas');
    const ctx = canvas.getContext('2d');
    const startButton = document.getElementById('startButton');
    const scoreDisplay = document.getElementById('score');
    const highScoreDisplay = document.getElementById('highScore');
    const lengthDisplay = document.getElementById('length');
    const gameSpeedSelect = document.getElementById('gameSpeed');
    const gameModeSelect = document.getElementById('gameMode');
    const snakeColorInput = document.getElementById('snakeColor');
    
    // Mobile control buttons
    const upButton = document.getElementById('upButton');
    const downButton = document.getElementById('downButton');
    const leftButton = document.getElementById('leftButton');
    const rightButton = document.getElementById('rightButton');
    
    // Set canvas dimensions
    canvas.width = 600;
    canvas.height = 400;
    
    // Game variables
    let snake = [];
    let food = {};
    let specialFood = null;
    let obstacles = [];
    let portals = [];
    let direction = 'right';
    let nextDirection = 'right';
    let gameSpeed = 150; // milliseconds between moves
    let gameRunning = false;
    let gameLoop;
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    let gridSize = 20; // size of each grid cell
    let specialFoodTimer = 0;
    let gameMode = 'classic';
    let snakeColor = '#7c3aed';
    let snakeGradient = true;
    let particles = [];
    
    // Speed settings
    const speeds = {
        slow: 200,
        medium: 150,
        fast: 100,
        insane: 50
    };
    
    // Initialize high score display
    highScoreDisplay.textContent = highScore;
    
    // Event listeners
    startButton.addEventListener('click', toggleGame);
    
    gameSpeedSelect.addEventListener('change', function() {
        gameSpeed = speeds[this.value];
    });
    
    gameModeSelect.addEventListener('change', function() {
        gameMode = this.value;
        if (gameRunning) {
            resetGame();
        }
    });
    
    snakeColorInput.addEventListener('change', function() {
        snakeColor = this.value;
    });
    
    // Keyboard controls
    document.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (direction !== 'down') nextDirection = 'up';
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (direction !== 'up') nextDirection = 'down';
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (direction !== 'right') nextDirection = 'left';
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (direction !== 'left') nextDirection = 'right';
                break;
            case ' ':
                // Space bar to start/pause
                toggleGame();
                break;
        }
    });
    
    // Mobile controls
    upButton.addEventListener('click', function() {
        if (direction !== 'down') nextDirection = 'up';
    });
    
    downButton.addEventListener('click', function() {
        if (direction !== 'up') nextDirection = 'down';
    });
    
    leftButton.addEventListener('click', function() {
        if (direction !== 'right') nextDirection = 'left';
    });
    
    rightButton.addEventListener('click', function() {
        if (direction !== 'left') nextDirection = 'right';
    });
    
    // Touch controls for swipe
    let touchStartX = 0;
    let touchStartY = 0;
    
    canvas.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        e.preventDefault();
    }, false);
    
    canvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
    }, false);
    
    canvas.addEventListener('touchend', function(e) {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;
        
        // Determine swipe direction
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Horizontal swipe
            if (diffX > 0 && direction !== 'left') {
                nextDirection = 'right';
            } else if (diffX < 0 && direction !== 'right') {
                nextDirection = 'left';
            }
        } else {
            // Vertical swipe
            if (diffY > 0 && direction !== 'up') {
                nextDirection = 'down';
            } else if (diffY < 0 && direction !== 'down') {
                nextDirection = 'up';
            }
        }
        
        e.preventDefault();
    }, false);
    
    // Game functions
    function toggleGame() {
        if (gameRunning) {
            // Pause game
            clearInterval(gameLoop);
            gameRunning = false;
            startButton.textContent = 'Resume Game';
        } else {
            // Start or resume game
            if (snake.length === 0) {
                resetGame();
            }
            
            gameRunning = true;
            startButton.textContent = 'Pause Game';
            gameLoop = setInterval(updateGame, gameSpeed);
        }
    }
    
    function resetGame() {
        // Clear any existing game loop
        clearInterval(gameLoop);
        
        // Reset game state
        snake = [
            {x: 5 * gridSize, y: 10 * gridSize},
            {x: 4 * gridSize, y: 10 * gridSize},
            {x: 3 * gridSize, y: 10 * gridSize}
        ];
        
        direction = 'right';
        nextDirection = 'right';
        score = 0;
        specialFood = null;
        specialFoodTimer = 0;
        obstacles = [];
        portals = [];
        particles = [];
        
        // Update displays
        scoreDisplay.textContent = score;
        lengthDisplay.textContent = snake.length;
        
        // Generate food
        generateFood();
        
        // Generate obstacles for obstacle mode
        if (gameMode === 'obstacles') {
            generateObstacles();
        }
        
        // Generate portals for portal mode
        if (gameMode === 'portal') {
            generatePortals();
        }
        
        // Start game loop
        if (gameRunning) {
            gameLoop = setInterval(updateGame, gameSpeed);
        }
        
        // Initial draw
        draw();
    }
    
    function updateGame() {
        // Update direction
        direction = nextDirection;
        
        // Move snake
        moveSnake();
        
        // Check for collisions
        if (checkCollision()) {
            gameOver();
            return;
        }
        
        // Check if snake eats food
        checkFood();
        
        // Update special food timer
        if (specialFood) {
            specialFoodTimer--;
            if (specialFoodTimer <= 0) {
                specialFood = null;
            }
        } else if (Math.random() < 0.01 && score > 5) {
            // 1% chance to spawn special food if score > 5
            generateSpecialFood();
        }
        
        // Update particles
        updateParticles();
        
        // Draw everything
        draw();
    }
    
    function moveSnake() {
        // Create new head based on direction
        const head = {x: snake[0].x, y: snake[0].y};
        
        switch(direction) {
            case 'up':
                head.y -= gridSize;
                break;
            case 'down':
                head.y += gridSize;
                break;
            case 'left':
                head.x -= gridSize;
                break;
            case 'right':
                head.x += gridSize;
                break;
        }
        
        // Handle wrapping for "no walls" mode
        if (gameMode === 'noWalls' || gameMode === 'portal') {
            if (head.x < 0) head.x = canvas.width - gridSize;
            if (head.x >= canvas.width) head.x = 0;
            if (head.y < 0) head.y = canvas.height - gridSize;
            if (head.y >= canvas.height) head.y = 0;
        }
        
        // Handle portal teleportation
        if (gameMode === 'portal') {
            for (let i = 0; i < portals.length; i++) {
                const portal = portals[i];
                if (head.x === portal.x && head.y === portal.y) {
                    // Find the other portal
                    const otherPortal = portals[(i + 1) % 2];
                    head.x = otherPortal.x;
                    head.y = otherPortal.y;
                    
                    // Move one step in the current direction to avoid getting stuck
                    switch(direction) {
                        case 'up':
                            head.y -= gridSize;
                            break;
                        case 'down':
                            head.y += gridSize;
                            break;
                        case 'left':
                            head.x -= gridSize;
                            break;
                        case 'right':
                            head.x += gridSize;
                            break;
                    }
                    
                    // Create portal particles
                    createPortalParticles(portal.x, portal.y);
                    createPortalParticles(otherPortal.x, otherPortal.y);
                    break;
                }
            }
        }
        
        // Add new head to the beginning of the snake
        snake.unshift(head);
        
        // Remove tail unless the snake ate food
        if (
            (head.x !== food.x || head.y !== food.y) && 
            (!specialFood || head.x !== specialFood.x || head.y !== specialFood.y)
        ) {
            snake.pop();
        } else {
            // Update length display if snake grew
            lengthDisplay.textContent = snake.length;
        }
    }
    
    function checkCollision() {
        const head = snake[0];
        
        // Check for wall collision in classic and obstacles modes
        if (gameMode === 'classic' || gameMode === 'obstacles') {
            if (
                head.x < 0 || 
                head.x >= canvas.width || 
                head.y < 0 || 
                head.y >= canvas.height
            ) {
                return true;
            }
        }
        
        // Check for collision with snake body
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                return true;
            }
        }
        
        // Check for collision with obstacles
        if (gameMode === 'obstacles') {
            for (let obstacle of obstacles) {
                if (head.x === obstacle.x && head.y === obstacle.y) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    function checkFood() {
        const head = snake[0];
        
        // Check for regular food
        if (head.x === food.x && head.y === food.y) {
            // Increase score
            score++;
            scoreDisplay.textContent = score;
            
            // Update high score if needed
            if (score > highScore) {
                highScore = score;
                highScoreDisplay.textContent = highScore;
                localStorage.setItem('snakeHighScore', highScore);
            }
            
            // Generate new food
            generateFood();
            
            // Create food particles
            createFoodParticles(food.x, food.y);
        }
        
        // Check for special food
        if (specialFood && head.x === specialFood.x && head.y === specialFood.y) {
            // Increase score by 5
            score += 5;
            scoreDisplay.textContent = score;
            
            // Update high score if needed
            if (score > highScore) {
                highScore = score;
                highScoreDisplay.textContent = highScore;
                localStorage.setItem('snakeHighScore', highScore);
            }
            
            // Remove special food
            specialFood = null;
            
            // Create special food particles
            createSpecialFoodParticles(head.x, head.y);
            
            // Grow snake by 2 more segments (3 total with the normal growth)
            for (let i = 0; i < 2; i++) {
                const tail = snake[snake.length - 1];
                snake.push({x: tail.x, y: tail.y});
            }
            
            // Update length display
            lengthDisplay.textContent = snake.length;
        }
    }
    
    function generateFood() {
        // Generate food at random position
        let newFood;
        let validPosition = false;
        
        while (!validPosition) {
            newFood = {
                x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
                y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
            };
            
            validPosition = true;
            
            // Check if food is on snake
            for (let segment of snake) {
                if (newFood.x === segment.x && newFood.y === segment.y) {
                    validPosition = false;
                    break;
                }
            }
            
            // Check if food is on obstacle
            if (gameMode === 'obstacles') {
                for (let obstacle of obstacles) {
                    if (newFood.x === obstacle.x && newFood.y === obstacle.y) {
                        validPosition = false;
                        break;
                    }
                }
            }
            
            // Check if food is on portal
            if (gameMode === 'portal') {
                for (let portal of portals) {
                    if (newFood.x === portal.x && newFood.y === portal.y) {
                        validPosition = false;
                        break;
                    }
                }
            }
            
            // Check if food is on special food
            if (specialFood && newFood.x === specialFood.x && newFood.y === specialFood.y) {
                validPosition = false;
            }
        }
        
        food = newFood;
    }
    
    function generateSpecialFood() {
        // Generate special food at random position
        let newSpecialFood;
        let validPosition = false;
        
        while (!validPosition) {
            newSpecialFood = {
                x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
                y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
            };
            
            validPosition = true;
            
            // Check if special food is on snake
            for (let segment of snake) {
                if (newSpecialFood.x === segment.x && newSpecialFood.y === segment.y) {
                    validPosition = false;
                    break;
                }
            }
            
            // Check if special food is on regular food
            if (newSpecialFood.x === food.x && newSpecialFood.y === food.y) {
                validPosition = false;
            }
            
            // Check if special food is on obstacle
            if (gameMode === 'obstacles') {
                for (let obstacle of obstacles) {
                    if (newSpecialFood.x === obstacle.x && newSpecialFood.y === obstacle.y) {
                        validPosition = false;
                        break;
                    }
                }
            }
            
            // Check if special food is on portal
            if (gameMode === 'portal') {
                for (let portal of portals) {
                    if (newSpecialFood.x === portal.x && newSpecialFood.y === portal.y) {
                        validPosition = false;
                        break;
                    }
                }
            }
        }
        
        specialFood = newSpecialFood;
        specialFoodTimer = 100; // Special food disappears after 100 game updates
    }
    
    function generateObstacles() {
        // Generate 10-15 obstacles
        const numObstacles = Math.floor(Math.random() * 6) + 10;
        
        for (let i = 0; i < numObstacles; i++) {
            let obstacle;
            let validPosition = false;
            
            while (!validPosition) {
                obstacle = {
                    x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
                    y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
                };
                
                validPosition = true;
                
                // Check if obstacle is on snake or too close to snake head
                for (let segment of snake) {
                    const distance = Math.sqrt(
                        Math.pow(obstacle.x - segment.x, 2) + 
                        Math.pow(obstacle.y - segment.y, 2)
                    );
                    
                    if (distance < gridSize * 5) {
                        validPosition = false;
                        break;
                    }
                }
                
                // Check if obstacle is on food
                if (obstacle.x === food.x && obstacle.y === food.y) {
                    validPosition = false;
                }
                
                // Check if obstacle is on another obstacle
                for (let existingObstacle of obstacles) {
                    if (obstacle.x === existingObstacle.x && obstacle.y === existingObstacle.y) {
                        validPosition = false;
                        break;
                    }
                }
            }
            
            obstacles.push(obstacle);
        }
    }
    
    function generatePortals() {
        // Generate 2 portals
        for (let i = 0; i < 2; i++) {
            let portal;
            let validPosition = false;
            
            while (!validPosition) {
                portal = {
                    x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
                    y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize,
                    color: i === 0 ? '#3498db' : '#e74c3c' // Blue for portal 1, red for portal 2
                };
                
                validPosition = true;
                
                // Check if portal is on snake
                for (let segment of snake) {
                    if (portal.x === segment.x && portal.y === segment.y) {
                        validPosition = false;
                        break;
                    }
                }
                
                // Check if portal is on food
                if (portal.x === food.x && portal.y === food.y) {
                    validPosition = false;
                }
                
                // Check if portal is on another portal
                for (let existingPortal of portals) {
                    const distance = Math.sqrt(
                        Math.pow(portal.x - existingPortal.x, 2) + 
                        Math.pow(portal.y - existingPortal.y, 2)
                    );
                    
                    if (distance < gridSize * 10) {
                        validPosition = false;
                        break;
                    }
                }
            }
            
            portals.push(portal);
        }
    }
    
    function gameOver() {
        // Stop game loop
        clearInterval(gameLoop);
        gameRunning = false;
        startButton.textContent = 'Restart Game';
        
        // Create explosion particles
        createExplosionParticles(snake[0].x, snake[0].y);
        
        // Draw game over screen
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = 'bold 40px Poppins';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 50);
        
        ctx.font = '20px Poppins';
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2);
        ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 30);
        
        ctx.font = '16px Poppins';
        ctx.fillText('Press "Restart Game" to play again', canvas.width / 2, canvas.height / 2 + 70);
    }
    
    function draw() {
        // Clear canvas
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid lines (subtle)
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        
        // Draw obstacles
        if (gameMode === 'obstacles') {
            for (let obstacle of obstacles) {
                ctx.fillStyle = '#ef4444';
                ctx.fillRect(obstacle.x, obstacle.y, gridSize, gridSize);
                
                // Add texture to obstacles
                ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.fillRect(obstacle.x + 3, obstacle.y + 3, gridSize - 6, gridSize - 6);
            }
        }
        
        // Draw portals
        if (gameMode === 'portal') {
            for (let portal of portals) {
                // Draw portal glow
                const gradient = ctx.createRadialGradient(
                    portal.x + gridSize / 2, portal.y + gridSize / 2, 0,
                    portal.x + gridSize / 2, portal.y + gridSize / 2, gridSize
                );
                gradient.addColorStop(0, portal.color);
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                
                ctx.beginPath();
                ctx.arc(portal.x + gridSize / 2, portal.y + gridSize / 2, gridSize, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();
                
                // Draw portal
                ctx.beginPath();
                ctx.arc(portal.x + gridSize / 2, portal.y + gridSize / 2, gridSize / 2, 0, Math.PI * 2);
                ctx.fillStyle = portal.color;
                ctx.fill();
                
                // Draw portal center
                ctx.beginPath();
                ctx.arc(portal.x + gridSize / 2, portal.y + gridSize / 2, gridSize / 4, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();
            }
        }
        
        // Draw food
        ctx.beginPath();
        ctx.arc(food.x + gridSize / 2, food.y + gridSize / 2, gridSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();
        
        // Add details to food (apple)
        ctx.beginPath();
        ctx.arc(food.x + gridSize / 2, food.y + gridSize / 4, gridSize / 10, 0, Math.PI * 2);
        ctx.fillStyle = '#422006';
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(food.x + gridSize / 2, food.y + gridSize / 4);
        ctx.lineTo(food.x + gridSize / 2, food.y);
        ctx.strokeStyle = '#422006';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw special food if it exists
        if (specialFood) {
            // Pulsating effect
            const pulseSize = Math.sin(Date.now() / 200) * 2 + 8;
            
            // Draw star shape
            drawStar(
                specialFood.x + gridSize / 2, 
                specialFood.y + gridSize / 2, 
                5, // 5 points
                gridSize / 2 + pulseSize, // outer radius
                gridSize / 4 // inner radius
            );
        }
        
        // Draw snake
        for (let i = 0; i < snake.length; i++) {
            const segment = snake[i];
            
            // Create gradient for snake body
            let segmentColor;
            if (snakeGradient) {
                // Calculate color based on position in snake
                const hue = i * (360 / snake.length);
                segmentColor = `hsl(${hue}, 70%, 60%)`;
            } else {
                // Use single color with slight variation for depth
                const brightness = 100 - (i / snake.length) * 20;
                segmentColor = i === 0 ? snakeColor : adjustBrightness(snakeColor, brightness);
            }
            
            // Draw rounded segment
            ctx.beginPath();
            ctx.roundRect(segment.x, segment.y, gridSize, gridSize, 5);
            ctx.fillStyle = segmentColor;
            ctx.fill();
            
            // Add eyes to head
            if (i === 0) {
                // Determine eye position based on direction
                let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
                
                switch(direction) {
                    case 'up':
                        leftEyeX = segment.x + gridSize / 4;
                        leftEyeY = segment.y + gridSize / 4;
                        rightEyeX = segment.x + gridSize * 3 / 4;
                        rightEyeY = segment.y + gridSize / 4;
                        break;
                    case 'down':
                        leftEyeX = segment.x + gridSize / 4;
                        leftEyeY = segment.y + gridSize * 3 / 4;
                        rightEyeX = segment.x + gridSize * 3 / 4;
                        rightEyeY = segment.y + gridSize * 3 / 4;
                        break;
                    case 'left':
                        leftEyeX = segment.x + gridSize / 4;
                        leftEyeY = segment.y + gridSize / 4;
                        rightEyeX = segment.x + gridSize / 4;
                        rightEyeY = segment.y + gridSize * 3 / 4;
                        break;
                    case 'right':
                        leftEyeX = segment.x + gridSize * 3 / 4;
                        leftEyeY = segment.y + gridSize / 4;
                        rightEyeX = segment.x + gridSize * 3 / 4;
                        rightEyeY = segment.y + gridSize * 3 / 4;
                        break;
                }
                
                // Draw eyes
                ctx.beginPath();
                ctx.arc(leftEyeX, leftEyeY, gridSize / 8, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(rightEyeX, rightEyeY, gridSize / 8, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();
                
                // Draw pupils
                ctx.beginPath();
                ctx.arc(leftEyeX, leftEyeY, gridSize / 16, 0, Math.PI * 2);
                ctx.fillStyle = '#000000';
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(rightEyeX, rightEyeY, gridSize / 16, 0, Math.PI * 2);
                ctx.fillStyle = '#000000';
                ctx.fill();
            }
        }
        
        // Draw particles
        for (let particle of particles) {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = particle.alpha;
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }
    
    // Helper function to draw a star shape
    function drawStar(cx, cy, spikes, outerRadius, innerRadius) {
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
        ctx.fillStyle = '#ec4899';
        ctx.fill();
    }
    
    // Helper function to adjust color brightness
    function adjustBrightness(hex, percent) {
        // Convert hex to RGB
        let r = parseInt(hex.substring(1, 3), 16);
        let g = parseInt(hex.substring(3, 5), 16);
        let b = parseInt(hex.substring(5, 7), 16);
        
        // Adjust brightness
        r = Math.floor(r * (percent / 100));
        g = Math.floor(g * (percent / 100));
        b = Math.floor(b * (percent / 100));
        
        // Ensure values are in valid range
        r = Math.min(255, Math.max(0, r));
        g = Math.min(255, Math.max(0, g));
        b = Math.min(255, Math.max(0, b));
        
        // Convert back to hex
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    // Particle effects
    function createFoodParticles(x, y) {
        for (let i = 0; i < 10; i++) {
            particles.push({
                x: x + gridSize / 2,
                y: y + gridSize / 2,
                size: Math.random() * 3 + 1,
                color: '#f59e0b',
                speedX: (Math.random() - 0.5) * 3,
                speedY: (Math.random() - 0.5) * 3,
                alpha: 1,
                decay: 0.02 + Math.random() * 0.03
            });
        }
    }
    
    function createSpecialFoodParticles(x, y) {
        for (let i = 0; i < 20; i++) {
            particles.push({
                x: x + gridSize / 2,
                y: y + gridSize / 2,
                size: Math.random() * 4 + 2,
                color: '#ec4899',
                speedX: (Math.random() - 0.5) * 4,
                speedY: (Math.random() - 0.5) * 4,
                alpha: 1,
                decay: 0.01 + Math.random() * 0.02
            });
        }
    }
    
    function createExplosionParticles(x, y) {
        for (let i = 0; i < 30; i++) {
            particles.push({
                x: x + gridSize / 2,
                y: y + gridSize / 2,
                size: Math.random() * 5 + 2,
                color: '#ef4444',
                speedX: (Math.random() - 0.5) * 6,
                speedY: (Math.random() - 0.5) * 6,
                alpha: 1,
                decay: 0.01 + Math.random() * 0.02
            });
        }
    }
    
    function createPortalParticles(x, y) {
        const portalColor = portals.find(p => p.x === x && p.y === y)?.color || '#3498db';
        
        for (let i = 0; i < 15; i++) {
            particles.push({
                x: x + gridSize / 2,
                y: y + gridSize / 2,
                size: Math.random() * 4 + 1,
                color: portalColor,
                speedX: (Math.random() - 0.5) * 5,
                speedY: (Math.random() - 0.5) * 5,
                alpha: 1,
                decay: 0.02 + Math.random() * 0.03
            });
        }
    }
    
    function updateParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            
            // Update position
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Update alpha
            particle.alpha -= particle.decay;
            
            // Remove if faded out
            if (particle.alpha <= 0) {
                particles.splice(i, 1);
            }
        }
    }
    
    // Initialize the game
    resetGame();
});