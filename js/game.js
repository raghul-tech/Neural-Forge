class NeuralForge {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.currentLoop = 1;
        this.maxLoops = 14;
        this.score = 0;
        this.targetScore = 1000;
        this.resources = 100;
        this.intelligence = 0;
        this.selectedMachine = null;
        this.gameActive = true;
    
        this.gameResult = null;
        this.gameResultData = null;

        this.worldWidth = 35;
        this.worldHeight = 25;
        this.cellSize = 45;
        
        this.camera = { x: 0, y: 0 };
        this.isPanning = false;
        this.panStart = { x: 0, y: 0 };
        this.cameraStart = { x: 0, y: 0 };
        
        this.visibleCols = Math.ceil(this.canvas.width / this.cellSize);
        this.visibleRows = Math.ceil(this.canvas.height / this.cellSize);
        
        this.neuralNet = new NeuralNetwork();
        this.machines = [];
        this.loopHistory = [];
        
        this.machineCosts = {
            sensor: 15, processor: 25, memory: 30,
            actuator: 20, connector: 10, mutator: 40
        };
        
        this.machineNames = {
            sensor: '📡 SENSOR', processor: '🧠 PROCESSOR',
            memory: '💾 MEMORY', actuator: '🦾 ACTUATOR',
            connector: '🔗 CONNECTOR', mutator: '🧬 MUTATOR'
        };
        
        this.canvas.width = 700;
        this.canvas.height = 500;
        
        this.visibleCols = Math.ceil(this.canvas.width / this.cellSize);
        this.visibleRows = Math.ceil(this.canvas.height / this.cellSize);
        
        this.centerCamera();
        this.setupEvents();
        this.setupResultModals();
        
        this.loadGame();
        this.checkSavedGameResult(); 
        
        this.animate();
        
        this.addLog('⚙️ Welcome to Neural Forge! Click HELP to learn how to play', '#ffcc00');
        this.addLog('🎯 Goal: Reach 1000 score within 15 loops', '#00ffcc');
        this.addLog('🖱️ Drag anywhere on grid to move camera', '#888');
    }
    
    checkSavedGameResult() {
        const savedResult = localStorage.getItem('neural_forge_result');
        const savedResultData = localStorage.getItem('neural_forge_result_data');
        
        if (savedResult && savedResultData) {
            this.gameResult = savedResult;
            this.gameResultData = JSON.parse(savedResultData);
            this.gameActive = false;
            if (this.gameResult === 'win' ) {
                this.showWinPopupFromSave();
            } else if (this.gameResult === 'lose') {
                this.showLosePopupFromSave();
            }
        }
    }
    
    showWinPopupFromSave() {
        if (this.gameResultData) {
            document.getElementById('winScore').textContent = this.gameResultData.score;
            document.getElementById('winIntelligence').textContent = this.gameResultData.intelligence;
            document.getElementById('winLoops').textContent = this.gameResultData.loopsUsed;
            document.getElementById('winMachines').textContent = this.gameResultData.machinesCount;
        }
        document.getElementById('winModal').style.display = 'flex';
        this.startConfetti();
        if (typeof soundManager !== 'undefined') {
            soundManager.playWinSound();
        }
    }
    
    showLosePopupFromSave() {
        if (this.gameResultData) {
            document.getElementById('loseScore').textContent = this.gameResultData.score;
            document.getElementById('loseIntelligence').textContent = this.gameResultData.intelligence;
            document.getElementById('loseShortBy').textContent = this.gameResultData.shortBy;
            document.getElementById('loseMachines').textContent = this.gameResultData.machinesCount;
        }
        document.getElementById('loseModal').style.display = 'flex';
        if (typeof soundManager !== 'undefined') {
            soundManager.playLoseSound();
        }
    }
    
    saveGameResult(result, data) {
        this.gameResult = result;
        this.gameResultData = data;
        localStorage.setItem('neural_forge_result', result);
        localStorage.setItem('neural_forge_result_data', JSON.stringify(data));
    }

    clearGameResult() {
        this.gameResult = null;
        this.gameResultData = null;
        localStorage.removeItem('neural_forge_result');
        localStorage.removeItem('neural_forge_result_data');
    }
    
    setupResultModals() {
        document.getElementById('winPlayAgainBtn').onclick = () => {
            document.getElementById('winModal').style.display = 'none';
            this.stopConfetti();
            this.clearGameResult();
            this.resetGame();
        };
        document.getElementById('winCloseBtn').onclick = () => {
            document.getElementById('winModal').style.display = 'none';
            this.stopConfetti();
            this.addLog('Press PLAY AGAIN to start a new game', '#ffcc00');
        };
        document.getElementById('losePlayAgainBtn').onclick = () => {
            document.getElementById('loseModal').style.display = 'none';
            this.clearGameResult();
            this.resetGame();
        };
        
        document.getElementById('loseCloseBtn').onclick = () => {
            document.getElementById('loseModal').style.display = 'none';
            this.addLog('Press TRY AGAIN to start a new game', '#ffcc00');
        };
        
        document.getElementById('winModal').onclick = (e) => {
            if (e.target === document.getElementById('winModal')) {
                this.addLog('Press PLAY AGAIN to start a new game', '#ffcc00');
            }
        };
        
        document.getElementById('loseModal').onclick = (e) => {
            if (e.target === document.getElementById('loseModal')) {
                this.addLog('Press TRY AGAIN to start a new game', '#ffcc00');
            }
        };
    }
    
    centerCamera() {
        const maxCameraX = Math.max(0, this.worldWidth * this.cellSize - this.canvas.width);
        const maxCameraY = Math.max(0, this.worldHeight * this.cellSize - this.canvas.height);
        this.camera.x = maxCameraX / 2;
        this.camera.y = maxCameraY / 2;
        this.clampCamera();
    }
    
    clampCamera() {
        const minX = 0;
        const maxX = Math.max(0, this.worldWidth * this.cellSize - this.canvas.width);
        const minY = 0;
        const maxY = Math.max(0, this.worldHeight * this.cellSize - this.canvas.height);
        this.camera.x = Math.min(maxX, Math.max(minX, this.camera.x));
        this.camera.y = Math.min(maxY, Math.max(minY, this.camera.y));
    }
    
    setupEvents() {
        this.canvas.addEventListener('mousedown', (e) => {
            //if (!this.gameActive) return;
            this.isPanning = true;
            this.panStart = { x: e.clientX, y: e.clientY };
            this.cameraStart = { x: this.camera.x, y: this.camera.y };
            this.canvas.style.cursor = 'grabbing';
        });
        
        window.addEventListener('mousemove', (e) => {
            //if (this.isPanning && this.gameActive) {
            if(this.isPanning){
                const dx = e.clientX - this.panStart.x;
                const dy = e.clientY - this.panStart.y;
                this.camera.x = this.cameraStart.x - dx;
                this.camera.y = this.cameraStart.y - dy;
                this.clampCamera();
                this.draw();
            }
        });
        
        window.addEventListener('mouseup', () => {
            this.isPanning = false;
            this.canvas.style.cursor = 'grab';
        });
        
        this.canvas.addEventListener('click', (e) => {
            if (!this.gameActive) return;
            if (this.isPanning) return;
            const pos = this.getGridPosition(e);
            if (pos) this.placeMachine(pos.x, pos.y);
        });
        
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (!this.gameActive) return;
            if (this.isPanning) return;
            const pos = this.getGridPosition(e);
            if (pos) this.removeMachine(pos.x, pos.y);
        });
        
        this.canvas.style.cursor = 'grab';
        
        document.querySelectorAll('.machine-card').forEach(card => {
            card.addEventListener('click', () => {
                this.checkSavedGameResult();
                if (!this.gameActive) return;
                const type = card.dataset.type;
                this.selectMachine(type, card);
            });
        });
        
        document.getElementById('evolveBtn').addEventListener('click', () => {
            this.checkSavedGameResult();
            if (!this.gameActive) return;
            this.evolveLoop();
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        
        document.getElementById('autoBtn').addEventListener('click', () => {
            this.checkSavedGameResult();
            if (!this.gameActive) return;
            this.autoBuild();
        });
        
        const helpModal = document.getElementById('helpModal');
        const helpBtn = document.getElementById('helpBtn');
        const closeSpan = document.querySelector('.close');
        
        helpBtn.onclick = () => helpModal.style.display = 'block';
        closeSpan.onclick = () => helpModal.style.display = 'none';
        window.onclick = (event) => {
            if (event.target == helpModal) helpModal.style.display = 'none';
        };
    }
    
    getGridPosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        const mouseCanvasX = (event.clientX - rect.left) * scaleX;
        const mouseCanvasY = (event.clientY - rect.top) * scaleY;
        
        const worldX = mouseCanvasX + this.camera.x;
        const worldY = mouseCanvasY + this.camera.y;
        
        const gridX = Math.floor(worldX / this.cellSize);
        const gridY = Math.floor(worldY / this.cellSize);
        
        if (gridX >= 0 && gridX < this.worldWidth && gridY >= 0 && gridY < this.worldHeight) {
            return { x: gridX, y: gridY };
        }
        return null;
    }
    
    selectMachine(type, cardElement) {
        this.selectedMachine = type;
        
        document.querySelectorAll('.machine-card').forEach(card => {
            card.classList.remove('selected');
        });
        cardElement.classList.add('selected');
        document.getElementById('selectedMachine').textContent = this.machineNames[type];
        
        if (typeof soundManager !== 'undefined') soundManager.playPlaceSound();
    }
    
    placeMachine(x, y) {
        if (!this.selectedMachine) {
            this.addLog('⚠️ Select a machine first! Click on any machine below', '#ffcc00');
            return;
        }
        
        const existing = this.machines.find(m => m.x === x && m.y === y);
        if (existing) {
            this.addLog('❌ Space already occupied!', '#ff3366');
            if (typeof soundManager !== 'undefined') soundManager.playErrorSound();
            return;
        }
        
        const cost = this.machineCosts[this.selectedMachine];
        if (this.resources < cost) {
            this.addLog(`❌ Need ${cost} resources! You have ${Math.floor(this.resources)}`, '#ff3366');
            if (typeof soundManager !== 'undefined') soundManager.playErrorSound();
            return;
        }
        
        const neuron = this.neuralNet.addNeuron(this.selectedMachine, x, y);
        const machine = { id: neuron.id, type: this.selectedMachine, x, y, neuronRef: neuron };
        this.machines.push(machine);
        this.autoConnect(machine);
        
        this.resources -= cost;
        this.updateUI();
        this.draw();
        
        this.addLog(`✅ Placed ${this.machineNames[this.selectedMachine]} at (${x},${y})`, '#00ffcc');
        if (typeof soundManager !== 'undefined') soundManager.playPlaceSound();
    }
    
    autoConnect(machine) {
        const nearby = this.machines.filter(m => 
            m.id !== machine.id && 
            Math.abs(m.x - machine.x) + Math.abs(m.y - machine.y) <= 2
        );
        
        nearby.forEach(near => {
            const exists = this.neuralNet.connections.some(c => 
                (c.from === near.id && c.to === machine.id) ||
                (c.from === machine.id && c.to === near.id)
            );
            if (!exists) {
                this.neuralNet.addConnection(near.id, machine.id);
                this.addLog(`🔗 Connected ${machine.type} to ${near.type}`, '#888');
            }
        });
    }
    
    removeMachine(x, y) {
        const index = this.machines.findIndex(m => m.x === x && m.y === y);
        if (index !== -1) {
            const machine = this.machines[index];
            this.neuralNet.neurons = this.neuralNet.neurons.filter(n => n.id !== machine.id);
            this.neuralNet.connections = this.neuralNet.connections.filter(c => 
                c.from !== machine.id && c.to !== machine.id
            );
            
            const refund = Math.floor(this.machineCosts[machine.type] / 2);
            this.resources += refund;
            this.machines.splice(index, 1);
            this.updateUI();
            this.draw();
            this.addLog(`🗑️ Removed ${this.machineNames[machine.type]} (refund ${refund} 🔩)`, '#ffcc00');
            if (typeof soundManager !== 'undefined') soundManager.playPlaceSound();
        }
    }
    
    evolveLoop() {
        if (this.currentLoop > this.maxLoops) {
            this.addLog('📢 Game complete! Press RESET to play again', '#ffcc00');
            this.gameActive = false;
            return;
        }
        
        if (!this.gameActive) return;
        
        const input = [this.resources / 100, this.machines.length / 20, this.currentLoop / this.maxLoops];
        const output = this.neuralNet.forwardPropagate(input);
        
        const previousScore = this.score;
        const production = Math.floor(output * 50 + this.machines.length * 2);
        this.score += production;
        this.resources += production;
        
        const reward = (this.score - previousScore) / 100;
        this.neuralNet.train(reward);
        this.intelligence = Math.min(100, this.intelligence + (this.neuralNet.fitness / 10));
        
        this.loopHistory.push({
            loop: this.currentLoop, score: this.score,
            machines: this.machines.length, intelligence: this.intelligence
        });
        
        this.addLog(`🔄 LOOP ${this.currentLoop} COMPLETE! +${production} score, +${production} resources`, '#00ffcc');
        this.currentLoop++;
        this.resources += 50;
        
        this.updateUI();
        this.draw();
        if (typeof soundManager !== 'undefined') soundManager.playLoopSound();
        
        if (this.score >= this.targetScore) {
            this.winGame();
        } else if (this.currentLoop > this.maxLoops) {
            this.endGame();
        }
        
        this.saveGame();
    }
    
    winGame() {
        this.gameActive = false;
        
        const winData = {
            score: Math.floor(this.score),
            intelligence: Math.floor(this.intelligence),
            loopsUsed: this.currentLoop - 1,
            machinesCount: this.machines.length
        };
        
        this.saveGameResult('win', winData);
        
        document.getElementById('winScore').textContent = winData.score;
        document.getElementById('winIntelligence').textContent = winData.intelligence;
        document.getElementById('winLoops').textContent = winData.loopsUsed;
        document.getElementById('winMachines').textContent = winData.machinesCount;
        
        document.getElementById('winModal').style.display = 'flex';
        
        this.startConfetti();
        
        if (typeof soundManager !== 'undefined') {
            soundManager.playWinSound();
        }
        
        this.addLog(`🏆 VICTORY! You reached ${this.score} / ${this.targetScore} score! 🏆`, '#ffcc00');
        
        this.saveGame();
    }
    
    endGame() {
        this.gameActive = false;
        const shortBy = this.targetScore - this.score;
        
        const loseData = {
            score: Math.floor(this.score),
            intelligence: Math.floor(this.intelligence),
            shortBy: shortBy,
            machinesCount: this.machines.length
        };
        
        this.saveGameResult('lose', loseData);
        
        document.getElementById('loseScore').textContent = loseData.score;
        document.getElementById('loseIntelligence').textContent = loseData.intelligence;
        document.getElementById('loseShortBy').textContent = loseData.shortBy;
        document.getElementById('loseMachines').textContent = loseData.machinesCount;
        
        document.getElementById('loseModal').style.display = 'flex';
        
        if (typeof soundManager !== 'undefined') {
            soundManager.playLoseSound();
        }
        
        this.addLog(`📢 Game Complete! Final Score: ${this.score} / ${this.targetScore}`, '#ffcc00');
        this.saveGame();
    }
    
    startConfetti() {
        const canvas = document.getElementById('confettiCanvas');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const particles = [];
        const colors = ['#ffcc00', '#00ffcc', '#ff3366', '#ffffff', '#ff8800'];
        
        for (let i = 0; i < 150; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                size: Math.random() * 8 + 4,
                speedX: (Math.random() - 0.5) * 4,
                speedY: Math.random() * 8 + 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10
            });
        }
        
        let animationId;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            let allDead = true;
            for (let p of particles) {
                if (p.y < canvas.height + 100) {
                    allDead = false;
                    p.x += p.speedX;
                    p.y += p.speedY;
                    p.rotation += p.rotationSpeed;
                    
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rotation * Math.PI / 180);
                    ctx.fillStyle = p.color;
                    ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
                    ctx.restore();
                }
            }
            
            if (!allDead) {
                animationId = requestAnimationFrame(animate);
            } else {
                cancelAnimationFrame(animationId);
            }
        };
        
        animate();
        this.confettiAnimation = animationId;
    }
    
    stopConfetti() {
        if (this.confettiAnimation) {
            cancelAnimationFrame(this.confettiAnimation);
        }
        const canvas = document.getElementById('confettiCanvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    autoBuild() {
        if (!this.gameActive) {
            this.addLog('⚠️ Game is complete! Press RESET to play again', '#ffcc00');
            return;
        }
        
        if (this.machines.length >= this.worldWidth * this.worldHeight) {
            this.addLog('⚠️ World is full! Cannot place more machines', '#ffcc00');
            return;
        }
        
        const bestType = this.getBestMachineType();
        if (!bestType) {
            this.addLog('⚠️ Not enough resources to build anything!', '#ffcc00');
            return;
        }
        
        const cost = this.machineCosts[bestType];
        if (this.resources < cost) {
            this.addLog(`⚠️ Need ${cost} resources for ${bestType}, but only have ${Math.floor(this.resources)}`, '#ffcc00');
            return;
        }
        
        const bestPosition = this.findBestPosition(bestType);
        
        if (!bestPosition) {
            this.addLog('⚠️ No suitable position found!', '#ffcc00');
            return;
        }
        
        this.selectedMachine = bestType;
        this.placeMachine(bestPosition.x, bestPosition.y);
        this.addLog(`🤖 Auto-built ${this.machineNames[bestType]} at (${bestPosition.x},${bestPosition.y})`, '#ffcc00');
    }
    
    findBestPosition(machineType) {
        const emptyPositions = [];
        
        for (let y = 0; y < this.worldHeight; y++) {
            for (let x = 0; x < this.worldWidth; x++) {
                const exists = this.machines.find(m => m.x === x && m.y === y);
                if (!exists) {
                    let score = 0;
                    const nearbyCount = this.machines.filter(m => 
                        Math.abs(m.x - x) + Math.abs(m.y - y) <= 2
                    ).length;
                    
                    if (machineType === 'sensor') {
                        if (this.machines.length === 0) score = 100;
                        if (x < 3 || x > this.worldWidth - 4) score += 20;
                        if (y < 3 || y > this.worldHeight - 4) score += 20;
                    } 
                    else if (machineType === 'actuator') {
                        score = nearbyCount * 15;
                        if (nearbyCount < 3) score += 30;
                    }
                    else if (machineType === 'processor') {
                        const hasSensorNearby = this.machines.some(m => 
                            m.type === 'sensor' && Math.abs(m.x - x) + Math.abs(m.y - y) <= 3
                        );
                        const hasActuatorNearby = this.machines.some(m => 
                            m.type === 'actuator' && Math.abs(m.x - x) + Math.abs(m.y - y) <= 3
                        );
                        if (hasSensorNearby) score += 40;
                        if (hasActuatorNearby) score += 40;
                        score += nearbyCount * 10;
                    }
                    else if (machineType === 'memory') {
                        const centerX = this.worldWidth / 2;
                        const centerY = this.worldHeight / 2;
                        const distanceToCenter = Math.abs(x - centerX) + Math.abs(y - centerY);
                        score = 50 - distanceToCenter;
                        score += nearbyCount * 5;
                    }
                    else if (machineType === 'connector') {
                        score = nearbyCount * 20;
                    }
                    else if (machineType === 'mutator') {
                        score = nearbyCount * 25;
                    }
                    
                    emptyPositions.push({ x, y, score });
                }
            }
        }
        
        if (emptyPositions.length === 0) return null;
        
        emptyPositions.sort((a, b) => b.score - a.score);
        return { x: emptyPositions[0].x, y: emptyPositions[0].y };
    }
    
    getBestMachineType() {
        const sensorCount = this.machines.filter(m => m.type === 'sensor').length;
        const processorCount = this.machines.filter(m => m.type === 'processor').length;
        const actuatorCount = this.machines.filter(m => m.type === 'actuator').length;
        const memoryCount = this.machines.filter(m => m.type === 'memory').length;
        const mutatorCount = this.machines.filter(m => m.type === 'mutator').length;
        
        if (this.currentLoop <= 4) {
            if (sensorCount === 0) return 'sensor';
            if (sensorCount < 2) return 'sensor';
            if (processorCount === 0) return 'processor';
            if (processorCount < 2) return 'processor';
            if (actuatorCount === 0) return 'actuator';
            if (actuatorCount < 2) return 'actuator';
            return 'processor';
        }
        
        if (this.currentLoop <= 9) {
            if (actuatorCount < 4) return 'actuator';
            if (memoryCount === 0 && this.resources >= 30) return 'memory';
            if (processorCount < actuatorCount) return 'processor';
            if (sensorCount < 3) return 'sensor';
            return 'connector';
        }
        
        if (mutatorCount === 0 && this.resources >= 40) return 'mutator';
        if (actuatorCount < 8) return 'actuator';
        if (memoryCount < 2) return 'memory';
        if (processorCount < actuatorCount) return 'processor';
        
        const options = [];
        if (this.resources >= 20 && actuatorCount < 10) options.push('actuator');
        if (this.resources >= 25 && processorCount < 10) options.push('processor');
        if (this.resources >= 15 && sensorCount < 5) options.push('sensor');
        if (this.resources >= 30 && memoryCount < 3) options.push('memory');
        if (this.resources >= 10) options.push('connector');
        
        if (options.length > 0) {
            return options[Math.floor(Math.random() * options.length)];
        }
        
        return null;
    }
    
    getMutators() {
        return this.machines.filter(m => m.type === 'mutator');
    }
    
    addLog(message, color = '#00ffcc') {
        const logDiv = document.getElementById('logMessages');
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.style.borderLeftColor = color;
        entry.innerHTML = `[L${this.currentLoop}] ${message}`;
        logDiv.prepend(entry);
        while (logDiv.children.length > 25) logDiv.removeChild(logDiv.lastChild);
    }
    
    updateUI() {
        document.getElementById('loopNum').textContent = this.currentLoop;
        document.getElementById('intelligence').textContent = Math.floor(this.intelligence);
        document.getElementById('score').textContent = Math.floor(this.score);
        document.getElementById('resources').textContent = Math.floor(this.resources);
        document.getElementById('activeNeurons').textContent = this.machines.length;
        document.getElementById('connections').textContent = this.neuralNet.connections.length;
        document.getElementById('learningRate').textContent = this.neuralNet.learningRate.toFixed(2);
        
        const progress = ((this.currentLoop -1) / this.maxLoops) * 100;
        document.getElementById('progressFill').style.width = progress + '%';
        document.getElementById('loopProgress').textContent = Math.floor(progress);
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const startCol = Math.max(0, Math.floor(this.camera.x / this.cellSize));
        const endCol = Math.min(this.worldWidth, Math.ceil((this.camera.x + this.canvas.width) / this.cellSize) + 1);
        const startRow = Math.max(0, Math.floor(this.camera.y / this.cellSize));
        const endRow = Math.min(this.worldHeight, Math.ceil((this.camera.y + this.canvas.height) / this.cellSize) + 1);
        
        this.ctx.strokeStyle = '#00ffcc';
        this.ctx.lineWidth = 0.5;
        
        for (let x = startCol; x <= endCol; x++) {
            const screenX = x * this.cellSize - this.camera.x;
            if (screenX >= -this.cellSize && screenX <= this.canvas.width) {
                this.ctx.beginPath();
                this.ctx.moveTo(screenX, 0);
                this.ctx.lineTo(screenX, this.canvas.height);
                this.ctx.stroke();
            }
        }
        
        for (let y = startRow; y <= endRow; y++) {
            const screenY = y * this.cellSize - this.camera.y;
            if (screenY >= -this.cellSize && screenY <= this.canvas.height) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, screenY);
                this.ctx.lineTo(this.canvas.width, screenY);
                this.ctx.stroke();
            }
        }
        
        this.neuralNet.connections.forEach(conn => {
            const from = this.machines.find(m => m.id === conn.from);
            const to = this.machines.find(m => m.id === conn.to);
            if (from && to) {
                const fromX = from.x * this.cellSize + this.cellSize/2 - this.camera.x;
                const fromY = from.y * this.cellSize + this.cellSize/2 - this.camera.y;
                const toX = to.x * this.cellSize + this.cellSize/2 - this.camera.x;
                const toY = to.y * this.cellSize + this.cellSize/2 - this.camera.y;
                
                if (fromX >= -this.cellSize && fromX <= this.canvas.width + this.cellSize &&
                    fromY >= -this.cellSize && fromY <= this.canvas.height + this.cellSize) {
                    
                    const weightColor = conn.weight > 0 ? '#00ffcc' : '#ff3366';
                    this.ctx.beginPath();
                    this.ctx.moveTo(fromX, fromY);
                    this.ctx.lineTo(toX, toY);
                    this.ctx.strokeStyle = weightColor;
                    this.ctx.globalAlpha = Math.min(0.6, Math.abs(conn.weight) * 0.4);
                    this.ctx.lineWidth = Math.abs(conn.weight) * 2;
                    this.ctx.stroke();
                }
            }
        });
        this.ctx.globalAlpha = 1;
        
        const icons = { sensor: '📡', processor: '🧠', memory: '💾', actuator: '🦾', connector: '🔗', mutator: '🧬' };
        
        this.machines.forEach(machine => {
            const screenX = machine.x * this.cellSize - this.camera.x;
            const screenY = machine.y * this.cellSize - this.camera.y;
            
            if (screenX + this.cellSize > 0 && screenX < this.canvas.width &&
                screenY + this.cellSize > 0 && screenY < this.canvas.height) {
                
                const size = this.cellSize - 4;
                const isOld = machine.neuronRef.loopCreated < this.currentLoop;
                
                this.ctx.fillStyle = isOld ? 'rgba(80, 80, 120, 0.8)' : 'rgba(0, 120, 120, 0.8)';
                this.ctx.fillRect(screenX + 2, screenY + 2, size, size);
                
                this.ctx.strokeStyle = isOld ? '#ffcc00' : '#00ffcc';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(screenX + 2, screenY + 2, size, size);
                
                this.ctx.font = `${this.cellSize - 15}px Arial`;
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillText(icons[machine.type] || '❓', screenX + 10, screenY + 32);
                
                this.ctx.font = '10px monospace';
                this.ctx.fillStyle = '#00ffcc';
                this.ctx.fillText(machine.neuronRef.value.toFixed(1), screenX + 5, screenY + 15);
            }
        });
        
        this.drawMinimap();
    }
    
    drawMinimap() {
        const minimapWidth = 120;
        const minimapHeight = 80;
        const minimapX = this.canvas.width - minimapWidth - 10;
        const minimapY = 10;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(minimapX, minimapY, minimapWidth, minimapHeight);
        this.ctx.strokeStyle = '#00ffcc';
        this.ctx.strokeRect(minimapX, minimapY, minimapWidth, minimapHeight);
        
        this.machines.forEach(machine => {
            const dotX = minimapX + (machine.x / this.worldWidth) * minimapWidth;
            const dotY = minimapY + (machine.y / this.worldHeight) * minimapHeight;
            this.ctx.fillStyle = '#00ffcc';
            this.ctx.fillRect(dotX - 1, dotY - 1, 2, 2);
        });
        
        const viewLeft = (this.camera.x / (this.worldWidth * this.cellSize)) * minimapWidth;
        const viewTop = (this.camera.y / (this.worldHeight * this.cellSize)) * minimapHeight;
        const viewWidth = (this.canvas.width / (this.worldWidth * this.cellSize)) * minimapWidth;
        const viewHeight = (this.canvas.height / (this.worldHeight * this.cellSize)) * minimapHeight;
        
        this.ctx.strokeStyle = '#ffcc00';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(minimapX + viewLeft, minimapY + viewTop, viewWidth, viewHeight);
    }
    
    saveGame() {
        const saveData = {
            currentLoop: this.currentLoop, score: this.score,
            resources: this.resources, intelligence: this.intelligence,
            machines: this.machines, neuralNet: this.neuralNet.serialize(),
            loopHistory: this.loopHistory, gameActive: this.gameActive,
            camera: { x: this.camera.x, y: this.camera.y }
        };
        localStorage.setItem('neural_forge_save', JSON.stringify(saveData));
    }
    
    loadGame() {
        const saved = localStorage.getItem('neural_forge_save');
        if (saved) {
            const data = JSON.parse(saved);
            this.currentLoop = data.currentLoop;
            this.score = data.score;
            this.resources = data.resources;
            this.intelligence = data.intelligence;
            this.machines = data.machines;
            this.loopHistory = data.loopHistory;
            this.neuralNet.deserialize(data.neuralNet);
            this.gameActive = data.gameActive !== undefined ? data.gameActive : true;
            if (data.camera) {
                this.camera = data.camera;
                this.clampCamera();
            }
            this.updateUI();
            this.draw();
            this.addLog('📀 Game loaded! Welcome back!', '#00ffcc');
        }
    }
    
    resetGame() {
        this.currentLoop = 1;
        this.score = 0;
        this.resources = 100;
        this.intelligence = 0;
        this.machines = [];
        this.loopHistory = [];
        this.neuralNet.clear();
        this.selectedMachine = null;
        this.gameActive = true;
        this.clearGameResult();
        this.centerCamera();
        localStorage.removeItem('neural_forge_save');
        this.updateUI();
        this.draw();
        this.addLog('🔄 Game reset! Start building your machine network!', '#ffcc00');
        this.addLog('🎯 Goal: Reach 1000 score within 15 loops', '#00ffcc');
    }
    
    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

const game = new NeuralForge();