class MonadVisualizer {
  constructor() {
    this.currentTab = "cityscape"
    this.isConnected = false
    this.transactionCount = 0
    this.currentTps = 0
    this.derbyConfig = {
      entities: ["Uniswap", "SushiSwap", "PancakeSwap", "Curve", "Balancer"],
    }
    this.racerPositions = {}
    this.racerData = {}

    // NEW: Define the number of vertical lines
    this.numGridLines = 10;

    this.init()
    window.visualizer = this
  }

  init() {
    this.setupEventListeners()
    // NEW: Call the function to create the visible grid lines
    this.setupGridLines(); 
    this.initializeDerby()
    this.startSimulations()
  }

  // NEW: This function creates the 10 vertical line elements in the HTML
  setupGridLines() {
    const container = document.querySelector('.grid-lines');
    if (!container) return;
    container.innerHTML = ''; // Clear any existing lines first
    for (let i = 0; i < this.numGridLines; i++) {
        const line = document.createElement('div');
        line.className = 'grid-line';
        container.appendChild(line);
    }
  }

  setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', () => {
        const tabName = button.dataset.tab;
        this.switchTab(tabName);
      });
    });

    // Config modal
    document.getElementById('configButton')?.addEventListener('click', () => this.openConfigModal());
    document.getElementById('closeModal')?.addEventListener('click', () => this.closeConfigModal());
    document.getElementById('addEntity')?.addEventListener('click', () => this.addEntity());
    document.getElementById('applyConfig')?.addEventListener('click', () => this.applyConfiguration());
    document.getElementById('resetConfig')?.addEventListener('click', () => this.resetConfiguration());
  }

  switchTab(tabName) {
    // Update active tab
    this.currentTab = tabName;
    
    // Update UI
    document.querySelectorAll('.tab-button').forEach(button => {
      button.classList.toggle('active', button.dataset.tab === tabName);
    });
    
    document.querySelectorAll('.page').forEach(page => {
      page.classList.toggle('active', page.id === tabName);
    });

    // Reset or start appropriate simulations
    if (tabName === 'cityscape') {
      this.startSimulations();
    } else if (tabName === 'derby') {
      this.startDerbySimulation();
    }
  }

  startSimulations() {
    // Clear any existing intervals
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }

    // Start data stream simulation
    this.simulationInterval = setInterval(() => {
      this.simulateDataStream();
    }, 100); // Generate new data every 100ms
  }

  simulateDataStream() {
    // Generate random transaction
    const types = ['small', 'medium', 'large', 'supernova'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const transaction = {
      type,
      hash: this.generateRandomHash(),
      timestamp: new Date().toISOString(),
      value: Math.random() * 1000
    };

    // Create visual bar
    this.createTransactionBar(transaction);
    
    // Add to data feed
    this.addToDataFeed(transaction);
    
    // Update stats
    this.transactionCount++;
    this.updateStats();
  }

  createTransactionBar(transaction) {
    const container = document.querySelector(".transaction-container")
    if (!container) return

    const bar = document.createElement("div")
    bar.classList.add("transaction-bar", transaction.type, "animated")

    // MODIFIED: This logic now uses our 10 grid lines for positioning
    const columnWidth = container.clientWidth / this.numGridLines;
    const columnIndex = Math.floor(Math.random() * this.numGridLines);
    // Position the bar in the middle of the chosen column/line
    const x = columnIndex * columnWidth + columnWidth / 2;

    // Random width (40px to 100px, but aligned to grid)
    const width = Math.random() * 60 + 40
    bar.style.width = `${width}px`
    bar.style.left = `${x}px`

    // Start at bottom
    const startY = container.clientHeight + 20
    bar.style.top = `${startY}px`

    // Assign Monad colors randomly
    const monadColors = ["monad-purple", "monad-berry", "monad-off-white"]
    const colorClass = monadColors[Math.floor(Math.random() * monadColors.length)]
    bar.classList.add(colorClass)

    // Weight colors based on transaction type for visual hierarchy
    if (transaction.type === "supernova") {
      // Supernova always gets off-white for maximum impact
      bar.classList.remove(colorClass)
      bar.classList.add("monad-off-white")
    } else if (transaction.type === "large") {
      // Large transactions favor purple and off-white
      const largeTxColors = ["monad-purple", "monad-off-white"]
      const largeTxColor = largeTxColors[Math.floor(Math.random() * largeTxColors.length)]
      bar.classList.remove(colorClass)
      bar.classList.add(largeTxColor)
    }
    // Small and medium keep random assignment

    container.appendChild(bar)

    // Remove bar after animation completes
    setTimeout(() => {
      if (bar.parentNode) {
        bar.remove()
      }
    }, 3600) // Slightly longer than animation duration
  }

  burst(count = 10) {
    // ... (this function remains unchanged)
  }

  addToDataFeed(transaction) {
    const feed = document.getElementById('dataFeed');
    if (!feed) return;

    const feedItem = document.createElement('div');
    feedItem.className = 'feed-item';
    
    const timestamp = new Date(transaction.timestamp).toLocaleTimeString();
    const value = transaction.value.toFixed(2);
    
    feedItem.innerHTML = `
      <span class="timestamp">${timestamp}</span>
      <span class="action">${transaction.type.toUpperCase()}</span>
      <span class="details">${value} ETH</span>
    `;

    feed.insertBefore(feedItem, feed.firstChild);

    // Keep only last 10 items
    while (feed.children.length > 10) {
      feed.removeChild(feed.lastChild);
    }
  }

  updateStats() {
    // Update TPS (Transactions Per Second)
    const now = Date.now();
    if (!this.lastUpdateTime) {
      this.lastUpdateTime = now;
      this.transactionsSinceLastUpdate = 0;
    }

    const timeDiff = (now - this.lastUpdateTime) / 1000; // Convert to seconds
    if (timeDiff >= 1) { // Update every second
      this.currentTps = this.transactionsSinceLastUpdate / timeDiff;
      this.transactionsSinceLastUpdate = 0;
      this.lastUpdateTime = now;
    } else {
      this.transactionsSinceLastUpdate++;
    }

    // Update UI
    const liveTpsElement = document.getElementById('liveTps');
    const totalTxElement = document.getElementById('totalTx');
    
    if (liveTpsElement) {
      liveTpsElement.textContent = this.currentTps.toFixed(1);
    }
    if (totalTxElement) {
      totalTxElement.textContent = this.transactionCount;
    }
  }

  initializeDerby() {
    this.updateCurrentEntities();
    this.setupRacetrack();
    this.updateScoreboard();
  }

  updateCurrentEntities() {
    const container = document.getElementById('currentEntities');
    if (!container) return;

    container.innerHTML = '';
    this.derbyConfig.entities.forEach(entity => {
      const tag = document.createElement('div');
      tag.className = 'entity-tag';
      tag.innerHTML = `
        ${entity}
        <button class="remove-btn" data-entity="${entity}">×</button>
      `;
      container.appendChild(tag);
    });

    // Add remove event listeners
    container.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', () => this.removeEntity(btn.dataset.entity));
    });
  }

  removeEntity(entityName) {
    this.derbyConfig.entities = this.derbyConfig.entities.filter(e => e !== entityName);
    this.updateCurrentEntities();
  }

  addEntity() {
    const nameInput = document.getElementById('entityName');
    const addressesInput = document.getElementById('entityAddresses');
    
    if (!nameInput || !addressesInput) return;
    
    const name = nameInput.value.trim();
    const addresses = addressesInput.value.trim();
    
    if (name && addresses) {
      if (!this.derbyConfig.entities.includes(name)) {
        this.derbyConfig.entities.push(name);
        this.updateCurrentEntities();
      }
      
      // Clear inputs
      nameInput.value = '';
      addressesInput.value = '';
    }
  }

  setupRacetrack() {
    const track = document.getElementById('racetrack');
    if (!track) return;

    track.innerHTML = '';
    this.derbyConfig.entities.forEach((entity, index) => {
      const lane = document.createElement('div');
      lane.className = 'race-lane';
      lane.innerHTML = `
        <div class="lane-background"></div>
        <div class="racer" data-entity="${entity}"></div>
        <div class="lane-label">${entity}</div>
      `;
      track.appendChild(lane);
    });
  }

  updateScoreboard() {
    const scoreboard = document.getElementById('scoreboardContent');
    if (!scoreboard) return;

    scoreboard.innerHTML = '';
    this.derbyConfig.entities.forEach(entity => {
      const card = document.createElement('div');
      card.className = 'racer-card';
      card.innerHTML = `
        <div class="racer-name">${entity}</div>
        <div class="racer-stats">
          <div>Position: ${this.racerPositions[entity] || 0}%</div>
          <div>Speed: ${(Math.random() * 10).toFixed(1)} TPS</div>
        </div>
      `;
      scoreboard.appendChild(card);
    });
  }

  startDerbySimulation() {
    // Clear any existing interval
    if (this.derbyInterval) {
      clearInterval(this.derbyInterval);
    }

    // Initialize positions
    this.derbyConfig.entities.forEach(entity => {
      this.racerPositions[entity] = 0;
    });

    // Start simulation
    this.derbyInterval = setInterval(() => {
      this.derbyConfig.entities.forEach(entity => {
        // Update position
        const speed = Math.random() * 2; // Random speed between 0-2%
        this.racerPositions[entity] = Math.min(100, (this.racerPositions[entity] || 0) + speed);
        
        // If racer reaches the end, reset their position
        if (this.racerPositions[entity] >= 100) {
          this.racerPositions[entity] = 0;
        }
        
        // Update racer position
        const racer = document.querySelector(`.racer[data-entity="${entity}"]`);
        if (racer) {
          racer.style.left = `${this.racerPositions[entity]}%`;
        }
      });

      // Update scoreboard
      this.updateScoreboard();
    }, 100);
  }

  openConfigModal() {
    const modal = document.getElementById('configModal');
    if (modal) {
      modal.classList.add('active');
    }
  }

  closeConfigModal() {
    const modal = document.getElementById('configModal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  applyConfiguration() {
    this.setupRacetrack();
    this.updateScoreboard();
    this.closeConfigModal();
  }

  resetConfiguration() {
    this.derbyConfig.entities = ["Uniswap", "SushiSwap", "PancakeSwap", "Curve", "Balancer"];
    this.updateCurrentEntities();
  }

  generateRandomHash() {
    return '0x' + Array.from({length: 40}, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }
}

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  new MonadVisualizer()
})