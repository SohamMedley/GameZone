document.addEventListener('DOMContentLoaded', function() {
    const memoryBoard = document.getElementById('memory-board');
    const startButton = document.getElementById('startButton');
    const difficultySelect = document.getElementById('difficulty');
    const cardThemeSelect = document.getElementById('cardTheme');
    const timeDisplay = document.getElementById('time');
    const movesDisplay = document.getElementById('moves');
    const scoreDisplay = document.getElementById('score');
    
    // Game variables
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let moves = 0;
    let score = 0;
    let gameStarted = false;
    let gameTimer;
    let seconds = 0;
    let canFlip = true;
    
    // Card themes
    const cardThemes = {
        animals: [
            'fa-cat', 'fa-dog', 'fa-horse', 'fa-fish', 'fa-dragon', 'fa-hippo',
            'fa-spider', 'fa-kiwi-bird', 'fa-frog', 'fa-otter', 'fa-dove', 'fa-crow',
            'fa-cow', 'fa-mosquito', 'fa-shrimp'
        ],
        food: [
            'fa-apple-whole', 'fa-burger', 'fa-pizza-slice', 'fa-ice-cream', 'fa-egg',
            'fa-cookie', 'fa-bacon', 'fa-cheese', 'fa-carrot', 'fa-pepper-hot', 'fa-drumstick-bite',
            'fa-cake-candles', 'fa-mug-hot', 'fa-martini-glass-citrus', 'fa-wine-glass'
        ],
        sports: [
            'fa-baseball', 'fa-basketball', 'fa-football', 'fa-volleyball', 'fa-golf-ball-tee',
            'fa-table-tennis-paddle-ball', 'fa-dumbbell', 'fa-person-swimming', 'fa-person-biking',
            'fa-person-skiing', 'fa-person-snowboarding', 'fa-hockey-puck', 'fa-medal', 'fa-trophy', 'fa-stopwatch'
        ],
        tech: [
            'fa-laptop', 'fa-mobile-screen', 'fa-desktop', 'fa-keyboard', 'fa-gamepad',
            'fa-headphones', 'fa-camera', 'fa-microchip', 'fa-memory', 'fa-server',
            'fa-router', 'fa-battery-full', 'fa-print', 'fa-hard-drive', 'fa-sim-card'
        ]
    };
    
    // Difficulty settings
    const difficulties = {
        easy: { rows: 3, cols: 4 },
        medium: { rows: 4, cols: 4 },
        hard: { rows: 4, cols: 6 },
        expert: { rows: 5, cols: 6 }
    };
    
    // Initialize the game
    startButton.addEventListener('click', startGame);
    difficultySelect.addEventListener('change', updateBoardSize);
    cardThemeSelect.addEventListener('change', updateCardTheme);
    
    // Update board size preview when difficulty changes
    function updateBoardSize() {
        const difficulty = difficultySelect.value;
        const { rows, cols } = difficulties[difficulty];
        
        // Update board CSS variables
        document.documentElement.style.setProperty('--memory-cols', cols);
        
        // Clear the board
        memoryBoard.innerHTML = '';
        
        // Create placeholder cards
        for (let i = 0; i < rows * cols; i++) {
            const card = document.createElement('div');
            card.className = 'memory-card placeholder';
            memoryBoard.appendChild(card);
        }
    }
    
    // Update card theme preview
    function updateCardTheme() {
        // This function just changes the theme for the next game
        // The actual card icons are set when the game starts
    }
    
    // Start a new game
    function startGame() {
        // Reset game state
        flippedCards = [];
        matchedPairs = 0;
        moves = 0;
        score = 0;
        seconds = 0;
        canFlip = true;
        
        // Update displays
        movesDisplay.textContent = moves;
        scoreDisplay.textContent = score;
        timeDisplay.textContent = '00:00';
        
        // Clear any existing timer
        if (gameTimer) {
            clearInterval(gameTimer);
        }
        
        // Get current settings
        const difficulty = difficultySelect.value;
        const theme = cardThemeSelect.value;
        const { rows, cols } = difficulties[difficulty];
        
        // Set the number of pairs
        const totalPairs = Math.floor(rows * cols / 2);
        
        // Create card pairs
        createCards(totalPairs, theme);
        
        // Shuffle cards
        shuffleCards();
        
        // Render cards
        renderCards(rows, cols);
        
        // Start the timer
        gameStarted = true;
        gameTimer = setInterval(updateTimer, 1000);
        
        // Show all cards briefly
        showAllCards();
    }
    
    // Create card pairs
    function createCards(pairs, theme) {
        cards = [];
        
        // Get random icons from the selected theme
        const icons = [...cardThemes[theme]];
        shuffleArray(icons);
        
        // Create pairs
        for (let i = 0; i < pairs; i++) {
            const icon = icons[i % icons.length];
            
            // Create two cards with the same icon (a pair)
            cards.push({
                id: i * 2,
                icon: icon,
                isFlipped: false,
                isMatched: false
            });
            
            cards.push({
                id: i * 2 + 1,
                icon: icon,
                isFlipped: false,
                isMatched: false
            });
        }
    }
    
    // Shuffle cards
    function shuffleCards() {
        shuffleArray(cards);
    }
    
    // Render cards on the board
    function renderCards(rows, cols) {
        // Update board CSS variables
        document.documentElement.style.setProperty('--memory-cols', cols);
        
        // Clear the board
        memoryBoard.innerHTML = '';
        
        // Create card elements
        cards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'memory-card';
            cardElement.dataset.id = card.id;
            
            // Create card front (icon)
            const cardFront = document.createElement('div');
            cardFront.className = 'memory-card-front';
            cardFront.innerHTML = `<i class="fas ${card.icon}"></i>`;
            
            // Create card back
            const cardBack = document.createElement('div');
            cardBack.className = 'memory-card-back';
            cardBack.innerHTML = `<i class="fas fa-question"></i>`;
            
            // Add front and back to card
            cardElement.appendChild(cardFront);
            cardElement.appendChild(cardBack);
            
            // Add click event
            cardElement.addEventListener('click', () => flipCard(card.id));
            
            // Add to board
            memoryBoard.appendChild(cardElement);
        });
    }
    
    // Show all cards briefly at the start
    function showAllCards() {
        // Disable flipping during preview
        canFlip = false;
        
        // Flip all cards
        cards.forEach(card => {
            card.isFlipped = true;
            updateCardElement(card.id);
        });
        
        // Hide cards after delay
        setTimeout(() => {
            cards.forEach(card => {
                card.isFlipped = false;
                updateCardElement(card.id);
            });
            
            // Enable flipping
            canFlip = true;
        }, 2000);
    }
    
    // Flip a card
    function flipCard(id) {
        // Check if card can be flipped
        if (!canFlip || !gameStarted) return;
        
        // Get the card
        const card = cards.find(c => c.id === id);
        
        // Check if card is already flipped or matched
        if (card.isFlipped || card.isMatched) return;
        
        // Check if two cards are already flipped
        if (flippedCards.length === 2) return;
        
        // Flip the card
        card.isFlipped = true;
        updateCardElement(id);
        
        // Add to flipped cards
        flippedCards.push(card);
        
        // Check for match if two cards are flipped
        if (flippedCards.length === 2) {
            // Increment moves
            moves++;
            movesDisplay.textContent = moves;
            
            // Check for match
            checkForMatch();
        }
    }
    
    // Check if the two flipped cards match
    function checkForMatch() {
        const [card1, card2] = flippedCards;
        
        // Disable flipping during check
        canFlip = false;
        
        if (card1.icon === card2.icon) {
            // Match found
            setTimeout(() => {
                // Mark cards as matched
                card1.isMatched = true;
                card2.isMatched = true;
                
                // Update card elements
                updateCardElement(card1.id, true);
                updateCardElement(card2.id, true);
                
                // Increment matched pairs
                matchedPairs++;
                
                // Update score
                score += 10 + Math.max(0, 20 - Math.floor(seconds / 5));
                scoreDisplay.textContent = score;
                
                // Check if game is complete
                if (matchedPairs === cards.length / 2) {
                    gameComplete();
                }
                
                // Reset flipped cards
                flippedCards = [];
                
                // Enable flipping
                canFlip = true;
            }, 500);
        } else {
            // No match
            setTimeout(() => {
                // Flip cards back
                card1.isFlipped = false;
                card2.isFlipped = false;
                
                // Update card elements
                updateCardElement(card1.id);
                updateCardElement(card2.id);
                
                // Reset flipped cards
                flippedCards = [];
                
                // Enable flipping
                canFlip = true;
            }, 1000);
        }
    }
    
    // Update the card element to match its state
    function updateCardElement(id, isMatch = false) {
        const cardElement = document.querySelector(`.memory-card[data-id="${id}"]`);
        const card = cards.find(c => c.id === id);
        
        if (card.isFlipped) {
            cardElement.classList.add('flipped');
        } else {
            cardElement.classList.remove('flipped');
        }
        
        if (card.isMatched) {
            cardElement.classList.add('matched');
            
            // Add match animation
            if (isMatch) {
                cardElement.classList.add('match-animation');
                setTimeout(() => {
                    cardElement.classList.remove('match-animation');
                }, 1000);
            }
        }
    }
    
    // Game complete
    function gameComplete() {
        // Stop the timer
        clearInterval(gameTimer);
        gameStarted = false;
        
        // Calculate final score based on time and moves
        const timeBonus = Math.max(0, 1000 - seconds * 2);
        const movesBonus = Math.max(0, 500 - moves * 10);
        const finalScore = score + timeBonus + movesBonus;
        
        // Update score display
        score = finalScore;
        scoreDisplay.textContent = score;
        
        // Show completion message
        setTimeout(() => {
            const difficulty = difficultySelect.value;
            const formattedTime = formatTime(seconds);
            
            // Create overlay for completion message
            const overlay = document.createElement('div');
            overlay.className = 'game-complete-overlay';
            
            // Create completion message
            const message = document.createElement('div');
            message.className = 'game-complete-message';
            message.innerHTML = `
                <h2>Congratulations!</h2>
                <p>You completed the ${difficulty} difficulty in ${formattedTime}!</p>
                <p>Moves: ${moves}</p>
                <p>Score: ${score}</p>
                <button id="playAgainButton" class="btn">Play Again</button>
            `;
            
            // Add to overlay
            overlay.appendChild(message);
            
            // Add to board
            memoryBoard.appendChild(overlay);
            
            // Add play again button event
            document.getElementById('playAgainButton').addEventListener('click', () => {
                memoryBoard.removeChild(overlay);
                startGame();
            });
            
            // Add confetti effect
            createConfetti();
        }, 500);
    }
    
    // Update the timer
    function updateTimer() {
        seconds++;
        timeDisplay.textContent = formatTime(seconds);
    }
    
    // Format time as MM:SS
    function formatTime(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Create confetti effect
    function createConfetti() {
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            
            // Random position, color, and animation delay
            const left = Math.random() * 100;
            const width = Math.random() * 10 + 5;
            const height = Math.random() * 10 + 5;
            const color = `hsl(${Math.random() * 360}, 100%, 70%)`;
            const delay = Math.random() * 3;
            
            confetti.style.left = `${left}%`;
            confetti.style.width = `${width}px`;
            confetti.style.height = `${height}px`;
            confetti.style.backgroundColor = color;
            confetti.style.animationDelay = `${delay}s`;
            
            document.body.appendChild(confetti);
            
            // Remove confetti after animation
            setTimeout(() => {
                document.body.removeChild(confetti);
            }, 5000);
        }
    }
    
    // Utility function to shuffle an array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // Initialize board with placeholders
    updateBoardSize();
});