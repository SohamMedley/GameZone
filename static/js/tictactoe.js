document.addEventListener('DOMContentLoaded', function() {
    const cells = document.querySelectorAll('.cell');
    const status = document.getElementById('status');
    const resetButton = document.getElementById('resetButton');
    const opponentSelect = document.getElementById('opponent');
    const playerSymbolSelect = document.getElementById('playerSymbol');
    const scoreX = document.getElementById('scoreX');
    const scoreO = document.getElementById('scoreO');
    const scoreTie = document.getElementById('scoreTie');
    
    let board = ['', '', '', '', '', '', '', '', ''];
    let currentPlayer = 'X';
    let gameActive = true;
    let scores = {
        X: 0,
        O: 0,
        tie: 0
    };
    
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    
    // Initialize the game
    initGame();
    
    function initGame() {
        cells.forEach(cell => {
            cell.addEventListener('click', handleCellClick);
            cell.textContent = '';
            cell.classList.remove('x', 'o', 'winner');
        });
        
        resetButton.addEventListener('click', resetGame);
        opponentSelect.addEventListener('change', resetGame);
        playerSymbolSelect.addEventListener('change', resetGame);
        
        board = ['', '', '', '', '', '', '', '', ''];
        currentPlayer = 'X';
        gameActive = true;
        updateStatus();
        
        // If AI goes first
        if (opponentSelect.value !== 'human' && playerSymbolSelect.value === 'O') {
            makeAIMove();
        }
    }
    
    function handleCellClick(event) {
        const cell = event.target;
        const index = parseInt(cell.getAttribute('data-index'));
        
        if (board[index] !== '' || !gameActive) return;
        
        updateCell(cell, index);
        checkGameResult();
        
        if (gameActive && opponentSelect.value !== 'human') {
            makeAIMove();
        }
    }
    
    function updateCell(cell, index) {
        board[index] = currentPlayer;
        cell.textContent = currentPlayer;
        cell.classList.add(currentPlayer.toLowerCase());
    }
    
    function changePlayer() {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateStatus();
    }
    
    function updateStatus() {
        status.textContent = `${currentPlayer}'s turn`;
    }
    
    function checkGameResult() {
        let roundWon = false;
        let winningPattern = null;
        
        // Check for win
        for (let i = 0; i < winPatterns.length; i++) {
            const [a, b, c] = winPatterns[i];
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                roundWon = true;
                winningPattern = winPatterns[i];
                break;
            }
        }
        
        if (roundWon) {
            highlightWinningCells(winningPattern);
            status.textContent = `${currentPlayer} wins!`;
            gameActive = false;
            updateScore(currentPlayer);
            return;
        }
        
        // Check for tie
        if (!board.includes('')) {
            status.textContent = 'Game ended in a tie!';
            gameActive = false;
            updateScore('tie');
            return;
        }
        
        // Continue game
        changePlayer();
    }
    
    function highlightWinningCells(pattern) {
        pattern.forEach(index => {
            cells[index].classList.add('winner');
        });
    }
    
    function updateScore(winner) {
        scores[winner]++;
        
        if (winner === 'X') {
            scoreX.textContent = scores.X;
        } else if (winner === 'O') {
            scoreO.textContent = scores.O;
        } else {
            scoreTie.textContent = scores.tie;
        }
    }
    
    function resetGame() {
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o', 'winner');
        });
        
        board = ['', '', '', '', '', '', '', '', ''];
        
        // Set starting player based on selection
        if (playerSymbolSelect.value === 'X') {
            currentPlayer = 'X';
        } else {
            currentPlayer = 'O';
        }
        
        gameActive = true;
        updateStatus();
        
        // If AI goes first
        if (opponentSelect.value !== 'human' && playerSymbolSelect.value === 'O') {
            makeAIMove();
        }
    }
    
    function makeAIMove() {
        if (!gameActive) return;
        
        setTimeout(() => {
            const difficulty = opponentSelect.value;
            let move;
            
            switch (difficulty) {
                case 'easy':
                    move = getRandomMove();
                    break;
                case 'medium':
                    move = Math.random() < 0.5 ? getSmartMove() : getRandomMove();
                    break;
                case 'hard':
                    move = getSmartMove();
                    break;
                default:
                    return;
            }
            
            if (move !== null) {
                updateCell(cells[move], move);
                checkGameResult();
            }
        }, 500);
    }
    
    function getRandomMove() {
        const availableMoves = [];
        
        board.forEach((cell, index) => {
            if (cell === '') {
                availableMoves.push(index);
            }
        });
        
        if (availableMoves.length === 0) return null;
        
        const randomIndex = Math.floor(Math.random() * availableMoves.length);
        return availableMoves[randomIndex];
    }
    
    function getSmartMove() {
        // Try to win
        for (let i = 0; i < winPatterns.length; i++) {
            const [a, b, c] = winPatterns[i];
            if (board[a] === currentPlayer && board[b] === currentPlayer && board[c] === '') {
                return c;
            }
            if (board[a] === currentPlayer && board[c] === currentPlayer && board[b] === '') {
                return b;
            }
            if (board[b] === currentPlayer && board[c] === currentPlayer && board[a] === '') {
                return a;
            }
        }
        
        // Block opponent
        const opponent = currentPlayer === 'X' ? 'O' : 'X';
        for (let i = 0; i < winPatterns.length; i++) {
            const [a, b, c] = winPatterns[i];
            if (board[a] === opponent && board[b] === opponent && board[c] === '') {
                return c;
            }
            if (board[a] === opponent && board[c] === opponent && board[b] === '') {
                return b;
            }
            if (board[b] === opponent && board[c] === opponent && board[a] === '') {
                return a;
            }
        }
        
        // Take center
        if (board[4] === '') {
            return 4;
        }
        
        // Take corners
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(corner => board[corner] === '');
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
        
        // Take any available move
        return getRandomMove();
    }
});