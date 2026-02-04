// ===================================
// SUDOKU GAME - COMPLETE IMPLEMENTATION
// ===================================

class SudokuGame {
    constructor() {
        this.grid = Array(9).fill(null).map(() => Array(9).fill(0));
        this.solution = Array(9).fill(null).map(() => Array(9).fill(0));
        this.initialGrid = Array(9).fill(null).map(() => Array(9).fill(0));
        this.timerInterval = null;
        this.seconds = 0;
        this.timerStarted = false;
        
        this.init();
    }

    // ===================================
    // INITIALIZATION
    // ===================================
    init() {
        this.renderGrid();
        this.generatePuzzle();
        this.attachEventListeners();
    }

    // ===================================
    // GRID RENDERING
    // ===================================
    renderGrid() {
        const gridElement = document.getElementById('sudoku-grid');
        gridElement.innerHTML = '';

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const input = document.createElement('input');
                input.type = 'text';
                input.maxLength = 1;
                input.dataset.row = row;
                input.dataset.col = col;
                
                // Add event listeners
                input.addEventListener('input', (e) => this.handleInput(e));
                input.addEventListener('keydown', (e) => this.handleKeydown(e));
                input.addEventListener('focus', () => this.startTimer());
                
                gridElement.appendChild(input);
            }
        }
    }

    // ===================================
    // PUZZLE GENERATION
    // ===================================
    generatePuzzle() {
        // Reset grids
        this.grid = Array(9).fill(null).map(() => Array(9).fill(0));
        this.solution = Array(9).fill(null).map(() => Array(9).fill(0));
        
        // Fill diagonal 3x3 boxes (independent)
        this.fillDiagonalBoxes();
        
        // Fill remaining cells
        this.fillRemaining(0, 3);
        
        // Copy solution
        this.solution = this.grid.map(row => [...row]);
        
        // Remove cells to create puzzle (difficulty: medium - remove 40-45 cells)
        this.removeCells(42);
        
        // Store initial state
        this.initialGrid = this.grid.map(row => [...row]);
        
        // Update UI
        this.updateGridDisplay();
    }

    fillDiagonalBoxes() {
        for (let box = 0; box < 9; box += 3) {
            this.fillBox(box, box);
        }
    }

    fillBox(row, col) {
        const numbers = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        let idx = 0;
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                this.grid[row + i][col + j] = numbers[idx++];
            }
        }
    }

    fillRemaining(row, col) {
        // Move to next row if we've reached the end of current row
        if (col >= 9 && row < 8) {
            row++;
            col = 0;
        }
        
        // Puzzle filled
        if (row >= 9 && col >= 9) {
            return true;
        }
        
        // Skip if in diagonal box (already filled)
        if (row < 3) {
            if (col < 3) col = 3;
        } else if (row < 6) {
            if (col === Math.floor(row / 3) * 3) col += 3;
        } else {
            if (col === 6) {
                row++;
                col = 0;
                if (row >= 9) return true;
            }
        }
        
        // Try numbers 1-9
        for (let num = 1; num <= 9; num++) {
            if (this.isSafe(row, col, num)) {
                this.grid[row][col] = num;
                
                if (this.fillRemaining(row, col + 1)) {
                    return true;
                }
                
                this.grid[row][col] = 0;
            }
        }
        
        return false;
    }

    removeCells(count) {
        while (count > 0) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            
            if (this.grid[row][col] !== 0) {
                this.grid[row][col] = 0;
                count--;
            }
        }
    }

    // ===================================
    // VALIDATION
    // ===================================
    isSafe(row, col, num) {
        return (
            this.isRowSafe(row, num) &&
            this.isColSafe(col, num) &&
            this.isBoxSafe(row - (row % 3), col - (col % 3), num)
        );
    }

    isRowSafe(row, num) {
        for (let col = 0; col < 9; col++) {
            if (this.grid[row][col] === num) {
                return false;
            }
        }
        return true;
    }

    isColSafe(col, num) {
        for (let row = 0; row < 9; row++) {
            if (this.grid[row][col] === num) {
                return false;
            }
        }
        return true;
    }

    isBoxSafe(startRow, startCol, num) {
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                if (this.grid[row + startRow][col + startCol] === num) {
                    return false;
                }
            }
        }
        return true;
    }

    // ===================================
    // USER INPUT HANDLING
    // ===================================
    handleInput(e) {
        const input = e.target;
        const value = input.value;
        
        // Only allow numbers 1-9
        if (!/^[1-9]$/.test(value)) {
            input.value = '';
            return;
        }
        
        const row = parseInt(input.dataset.row);
        const col = parseInt(input.dataset.col);
        
        // Update grid
        this.grid[row][col] = parseInt(value);
        
        // Clear error state
        input.classList.remove('error');
        
        // Check if puzzle is complete
        if (this.isGridFilled()) {
            this.checkSolution();
        }
    }

    handleKeydown(e) {
        const input = e.target;
        
        // Allow: backspace, delete, tab, escape, enter
        if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
            // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
            (e.keyCode === 65 && e.ctrlKey === true) ||
            (e.keyCode === 67 && e.ctrlKey === true) ||
            (e.keyCode === 86 && e.ctrlKey === true) ||
            (e.keyCode === 88 && e.ctrlKey === true) ||
            // Allow: home, end, left, right, up, down
            (e.keyCode >= 35 && e.keyCode <= 40)) {
            return;
        }
        
        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 49 || e.keyCode > 57)) && (e.keyCode < 97 || e.keyCode > 105)) {
            e.preventDefault();
        }
        
        // Arrow key navigation
        if (e.keyCode >= 37 && e.keyCode <= 40) {
            e.preventDefault();
            this.navigateGrid(input, e.keyCode);
        }
    }

    navigateGrid(currentInput, keyCode) {
        const row = parseInt(currentInput.dataset.row);
        const col = parseInt(currentInput.dataset.col);
        let newRow = row;
        let newCol = col;
        
        switch(keyCode) {
            case 37: // Left
                newCol = col > 0 ? col - 1 : col;
                break;
            case 38: // Up
                newRow = row > 0 ? row - 1 : row;
                break;
            case 39: // Right
                newCol = col < 8 ? col + 1 : col;
                break;
            case 40: // Down
                newRow = row < 8 ? row + 1 : row;
                break;
        }
        
        const inputs = document.querySelectorAll('#sudoku-grid input');
        const targetInput = inputs[newRow * 9 + newCol];
        if (targetInput && !targetInput.disabled) {
            targetInput.focus();
        }
    }

    // ===================================
    // GRID DISPLAY UPDATE
    // ===================================
    updateGridDisplay() {
        const inputs = document.querySelectorAll('#sudoku-grid input');
        
        inputs.forEach((input, index) => {
            const row = Math.floor(index / 9);
            const col = index % 9;
            const value = this.grid[row][col];
            
            if (value !== 0) {
                input.value = value;
                input.disabled = true;
            } else {
                input.value = '';
                input.disabled = false;
            }
            
            input.classList.remove('error');
        });
    }

    // ===================================
    // SOLUTION CHECKING
    // ===================================
    checkSolution() {
        let isValid = true;
        const inputs = document.querySelectorAll('#sudoku-grid input');
        
        // Clear all error states
        inputs.forEach(input => input.classList.remove('error'));
        
        // Check each cell
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const value = this.grid[row][col];
                
                if (value === 0) {
                    isValid = false;
                    continue;
                }
                
                // Temporarily remove value to check validity
                this.grid[row][col] = 0;
                
                if (!this.isSafe(row, col, value)) {
                    isValid = false;
                    const input = inputs[row * 9 + col];
                    input.classList.add('error');
                }
                
                // Restore value
                this.grid[row][col] = value;
            }
        }
        
        if (isValid && this.isGridFilled()) {
            this.showMessage('🎉 Congratulations! You solved the puzzle!', 'success');
            this.stopTimer();
        } else if (!isValid) {
            this.showMessage('❌ Some cells have errors. Please check highlighted cells.', 'error');
        } else {
            this.showMessage('⚠️ Puzzle is not complete yet. Keep going!', 'error');
        }
    }

    isGridFilled() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.grid[row][col] === 0) {
                    return false;
                }
            }
        }
        return true;
    }

    // ===================================
    // TIMER
    // ===================================
    startTimer() {
        if (!this.timerStarted) {
            this.timerStarted = true;
            this.timerInterval = setInterval(() => {
                this.seconds++;
                this.updateTimerDisplay();
            }, 1000);
        }
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    resetTimer() {
        this.stopTimer();
        this.seconds = 0;
        this.timerStarted = false;
        this.updateTimerDisplay();
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.seconds / 60);
        const secs = this.seconds % 60;
        const display = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        document.getElementById('timer').textContent = display;
    }

    // ===================================
    // GAME CONTROLS
    // ===================================
    resetGame() {
        // Restore initial puzzle state
        this.grid = this.initialGrid.map(row => [...row]);
        this.updateGridDisplay();
        this.resetTimer();
        this.hideMessage();
    }

    newGame() {
        this.resetTimer();
        this.generatePuzzle();
        this.hideMessage();
    }

    // ===================================
    // MESSAGE DISPLAY
    // ===================================
    showMessage(text, type) {
        const messageElement = document.getElementById('message');
        messageElement.textContent = text;
        messageElement.className = `message ${type} show`;
    }

    hideMessage() {
        const messageElement = document.getElementById('message');
        messageElement.className = 'message';
    }

    // ===================================
    // EVENT LISTENERS
    // ===================================
    attachEventListeners() {
        document.getElementById('check-btn').addEventListener('click', () => {
            this.checkSolution();
        });

        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetGame();
        });

        document.getElementById('new-game-btn').addEventListener('click', () => {
            this.newGame();
        });
    }

    // ===================================
    // UTILITY FUNCTIONS
    // ===================================
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

// ===================================
// INITIALIZE GAME
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    new SudokuGame();
});
