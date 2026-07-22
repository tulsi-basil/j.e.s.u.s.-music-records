// Run Jesus Run game
document.addEventListener('DOMContentLoaded', function() {
    const jesus = document.getElementById('jesus');
    const chasers = document.querySelectorAll('.jewish-person');
    const gameAudio = document.getElementById('gameAudio');
    const timerDisplay = document.getElementById('timer');
    const highScoreDisplay = document.getElementById('highScore');
    
    if (!jesus) return;
    
    // Dynamic mobile detection - re-evaluated on each restart
    function getIsMobile() {
        return window.innerWidth <= 768;
    }

    // Dynamic chaser speed - re-evaluated on each restart
    function getChaserSpeed() {
        return window.innerWidth <= 768 ? 0.75 : 1;
    }
    
    let jesusX = window.innerWidth / 2;
    let jesusY = window.innerHeight / 2;
    const moveSpeed = 3;
    let gameOver = false;
    let audioStarted = false;
    
    // Timer variables
    let startTime = null;
    let timerInterval = null;
    let currentTime = 0;
    let highScore = parseFloat(localStorage.getItem('runJesusHighScore')) || 0;
    // Sanity check - if stored value is unreasonably large, reset it
    if (highScore > 99999) highScore = 0;
    
    // Display initial high score
    highScoreDisplay.textContent = formatTime(highScore);
    
    // Format time as M:SS
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    // Start the timer
    function startTimer() {
        console.log('startTimer called, startTime is:', startTime);
        if (!startTime) {
            startTime = Date.now();
            console.log('Timer started at:', startTime);
            timerInterval = setInterval(updateTimer, 100);
        }
    }
    
    // Update timer display
    function updateTimer() {
        if (gameOver) return;
        currentTime = (Date.now() - startTime) / 1000;
        console.log('Updating timer:', currentTime, 'Display element:', timerDisplay);
        timerDisplay.textContent = formatTime(currentTime);
    }
        
    // Stop timer and check for high score
    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
            
            // Check if new high score
            if (currentTime > highScore) {
                highScore = currentTime;
                localStorage.setItem('runJesusHighScore', highScore);
                highScoreDisplay.textContent = formatTime(highScore);
            }
        }
    }
    
    // Initialize chasers at random positions with wander direction
    const chaserPositions = [];
    const minDistance = 200; // Minimum distance from Jesus in pixels

    chasers.forEach((chaser, index) => {
        let x, y, distance;
        
        // Keep generating random positions until we find one far enough from Jesus
        do {
            x = Math.random() * window.innerWidth;
            y = Math.random() * window.innerHeight;
            distance = Math.sqrt(Math.pow(jesusX - x, 2) + Math.pow(jesusY - y, 2));
        } while (distance < minDistance);
        
        chaserPositions.push({ 
            x, 
            y,
            wanderAngle: Math.random() * Math.PI * 2,
            wanderSpeed: getIsMobile() ? 0.02 : 0.05
        });
        chaser.style.left = x + 'px';
        chaser.style.top = y + 'px';
    });
    
    const keys = {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false
    };
    
    jesus.style.left = jesusX + 'px';
    jesus.style.top = jesusY + 'px';
    
    document.addEventListener('keydown', function(e) {
        console.log('Key pressed:', e.key);
        
        // Hide instructions on first keypress
        const instructions = document.getElementById('desktop-instructions');
        if (instructions && !instructions.classList.contains('hidden')) {
            instructions.classList.add('hidden');
        }
        
        // Start audio on first keypress
        if (!audioStarted && gameAudio) {
            gameAudio.play().catch(err => console.log('Audio play failed:', err));
            audioStarted = true;
        }
        
        // Start timer on first movement
        if (!startTime && keys.hasOwnProperty(e.key)) {
            console.log('About to start timer');
            startTimer();
        }
        
        if(keys.hasOwnProperty(e.key)) {
            e.preventDefault();
            keys[e.key] = true;
        }
    });
    
    document.addEventListener('keyup', function(e) {
        if(keys.hasOwnProperty(e.key)) {
            keys[e.key] = false;
        }
    });
    
    // Check collision between Jesus and a chaser
    function checkCollision(chaserPos) {
        const dx = Math.abs(jesusX - chaserPos.x);
        const dy = Math.abs(jesusY - chaserPos.y);
        
        // Oval collision - different thresholds for horizontal vs vertical
        const horizontalThreshold = 25; // Width
        const verticalThreshold = 45;   // Height
        
        // Ellipse collision formula
        return (dx * dx) / (horizontalThreshold * horizontalThreshold) + 
               (dy * dy) / (verticalThreshold * verticalThreshold) < 1;
    }

    // Create falling crosses
    function createCrossRain() {
        const isMobile = getIsMobile();
        gameOver = true;
        stopTimer();
        
        const crosses = [];
        const numCrosses = isMobile ? 100 : 200;
        // Scale cross speed with window size to avoid too-fast crosses on small screens
        const crossSpeed = isMobile ? Math.min(8, window.innerWidth / 60) : 2;
        
        for(let i = 0; i < numCrosses; i++) {
            const cross = document.createElement('img');
            cross.src = 'cross.png';
            cross.className = 'falling-cross';
            cross.style.position = 'fixed';
            cross.style.width = isMobile ? '50px' : '100px';
            cross.style.height = 'auto';
            cross.style.left = (Math.random() * (window.innerWidth + 200)) - 100 + 'px';
            cross.style.top = '-200px';
            cross.style.zIndex = '1000';
            cross.style.imageRendering = 'pixelated';
            document.body.appendChild(cross);
            
            crosses.push({
                element: cross,
                x: parseFloat(cross.style.left),
                y: -200,
                speed: crossSpeed + Math.random() * (isMobile ? 4 : 4)
            });
        }
        
        function animateCrosses() {
            let allFallen = true;
            
            crosses.forEach(cross => {
                cross.y += cross.speed;
                cross.element.style.top = cross.y + 'px';
                
                if(cross.y < window.innerHeight) {
                    allFallen = false;
                }
            });
            
            if(!allFallen) {
                requestAnimationFrame(animateCrosses);
            } else {
                setTimeout(() => {
                    crosses.forEach(cross => cross.element.remove());
                    resetGame();
                }, 500);
            }
        }
        
        animateCrosses();
    }
    
    // Reset the game
    function resetGame() {
        const isMobile = getIsMobile();
        gameOver = false;
        startTime = null;
        currentTime = 0;
        timerDisplay.textContent = '0:00';
        
        jesusX = window.innerWidth / 2;
        jesusY = window.innerHeight / 2;
        jesus.style.left = jesusX + 'px';
        jesus.style.top = jesusY + 'px';
        
        const minDistance = 200;
        
        chasers.forEach((chaser, index) => {
            let x, y, distance;
            
            do {
                x = Math.random() * window.innerWidth;
                y = Math.random() * window.innerHeight;
                distance = Math.sqrt(Math.pow(jesusX - x, 2) + Math.pow(jesusY - y, 2));
            } while (distance < minDistance);
            
            chaserPositions[index] = { 
                x, 
                y,
                wanderAngle: Math.random() * Math.PI * 2,
                wanderSpeed: isMobile ? 0.02 : 0.05
            };
            chaser.style.left = x + 'px';
            chaser.style.top = y + 'px';
        });
    
        updatePosition();
    }
    
    // Game loop
    function updatePosition() {
        if(gameOver) return;
        
        // Move Jesus based on key presses
        if(keys.ArrowUp) {
            jesusY -= moveSpeed;
        }
        if(keys.ArrowDown) {
            jesusY += moveSpeed;
        }
        if(keys.ArrowLeft) {
            jesusX -= moveSpeed;
        }
        if(keys.ArrowRight) {
            jesusX += moveSpeed;
        }
        
        // Keep Jesus within viewport bounds
        jesusX = Math.max(0, Math.min(jesusX, window.innerWidth - 50));
        jesusY = Math.max(0, Math.min(jesusY, window.innerHeight - 80));
        
        // Update Jesus position
        jesus.style.left = jesusX + 'px';
        jesus.style.top = jesusY + 'px';
        
        // Move chasers toward Jesus with smooth wandering
        chasers.forEach((chaser, index) => {
            const pos = chaserPositions[index];
            
            // Calculate direction to Jesus
            const dx = jesusX - pos.x;
            const dy = jesusY - pos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Move toward Jesus if not already touching
            if(distance > 5) {
                // Gradually change wander angle for smooth movement
                pos.wanderAngle += (Math.random() - 0.5) * pos.wanderSpeed;
                
                // Calculate wander offset using smooth angle
                const wanderStrength = getIsMobile() ? 0.2 : 0.5;
                const wanderX = Math.cos(pos.wanderAngle) * wanderStrength;
                const wanderY = Math.sin(pos.wanderAngle) * wanderStrength;
                
                // Combine chasing direction with smooth wandering
                pos.x += (dx / distance) * getChaserSpeed() + wanderX;
                pos.y += (dy / distance) * getChaserSpeed() + wanderY;
                
                // Keep chasers within viewport bounds
                pos.x = Math.max(0, Math.min(pos.x, window.innerWidth - 50));
                pos.y = Math.max(0, Math.min(pos.y, window.innerHeight - 80));
                
                // Update chaser position
                chaser.style.left = pos.x + 'px';
                chaser.style.top = pos.y + 'px';
            }
            
            // Check for collision
            if(checkCollision(pos)) {
                createCrossRain();
                return;
            }
        });
        
        requestAnimationFrame(updatePosition);
    }
    
    // Start the game loop
    updatePosition();
    
    // Mobile touch controls
    document.querySelectorAll('.arrow-btn').forEach(btn => {
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const key = btn.dataset.key;
            
            // Start audio on first touch
            if (!audioStarted && gameAudio) {
                gameAudio.play().catch(err => console.log('Audio play failed:', err));
                audioStarted = true;
            }
            
            // Start timer on first movement
            if (!startTime) {
                startTimer();
            }
            
            // Simulate keydown event
            const event = new KeyboardEvent('keydown', {
                key: key,
                code: key,
                bubbles: true
            });
            document.dispatchEvent(event);
        });
        
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            const key = btn.dataset.key;
            
            // Simulate keyup event
            const event = new KeyboardEvent('keyup', {
                key: key,
                code: key,
                bubbles: true
            });
            document.dispatchEvent(event);
        });
    });
});