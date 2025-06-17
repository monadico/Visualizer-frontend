class MonadVisualizer {
  constructor() {
    this.currentTab = "cityscape"
    this.isConnected = false
    this.currentTps = 0
    this.maxTpsForBar = 8000;
    this.blockNumber = 18784325; // Starting block
    this.totalTxFees = 24.1523;
    this.blockUpdateInterval = null;

    this.derbyConfig = {
      entities: ["Uniswap", "SushiSwap", "PancakeSwap", "Curve", "Balancer"],
    }
    this.racerPositions = {}
    this.racerData = {}

    this.numGridLines = 10;

    this.init()
    window.visualizer = this
  }

  init() {
    this.setupEventListeners()
    this.setupGridLines();
    this.initializeDerby()
    this.startSimulations()
    this.startBlockSimulation();
  }

  setupGridLines() {
    const container = document.querySelector('.grid-lines');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < this.numGridLines; i++) {
        const line = document.createElement('div');
        line.className = 'grid-line';
        container.appendChild(line);
    }
  }

  setupEventListeners() {
    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', () => {
        this.switchTab(button.dataset.tab);
      });
    });

    document.getElementById('configButton')?.addEventListener('click', () => this.openConfigModal());
    document.getElementById('closeModal')?.addEventListener('click', () => this.closeConfigModal());
    document.getElementById('addEntity')?.addEventListener('click', () => this.addEntity());
    document.getElementById('applyConfig')?.addEventListener('click', () => this.applyConfiguration());
    document.getElementById('resetConfig')?.addEventListener('click', () => this.resetConfiguration());
  }

  switchTab(tabName) {
    this.currentTab = tabName;

    document.querySelectorAll('.tab-button').forEach(button => {
      button.classList.toggle('active', button.dataset.tab === tabName);
    });

    document.querySelectorAll('.page').forEach(page => {
      page.classList.toggle('active', page.id === tabName);
    });

    if (tabName === 'cityscape') {
      this.startSimulations();
      this.startBlockSimulation();
    } else {
      if (this.simulationInterval) clearInterval(this.simulationInterval);
      if (this.blockUpdateInterval) clearInterval(this.blockUpdateInterval);
    }
  }

  startSimulations() {
    if (this.simulationInterval) clearInterval(this.simulationInterval);
    this.simulationInterval = setInterval(() => {
      this.simulateDataStream();
    }, 100);
  }

  startBlockSimulation() {
    if (this.blockUpdateInterval) clearInterval(this.blockUpdateInterval);
    this.blockUpdateInterval = setInterval(() => {
        this.blockNumber++;
        this.totalTxFees += Math.random() * 0.2; // Fees added per block

        const blockElement = document.getElementById('blockNumberValue');
        const feesElement = document.getElementById('txFeesValue');

        if(blockElement) blockElement.textContent = this.blockNumber.toLocaleString();
        if(feesElement) feesElement.textContent = this.totalTxFees.toFixed(4);
    }, 3000); // New block every 3 seconds
  }


  simulateDataStream() {
    const types = ['small', 'medium', 'large', 'supernova'];
    const type = types[Math.floor(Math.random() * types.length)];

    const transaction = {
      type,
      hash: this.generateRandomHash(),
      timestamp: new Date().toISOString(),
      value: Math.random() * 1000
    };

    this.createTransactionBar(transaction);
    this.addToDataFeed(transaction);
    this.updateStats();
  }

  createTransactionBar(transaction) {
    const container = document.querySelector(".transaction-container")
    if (!container) return

    const bar = document.createElement("div")
    bar.classList.add("transaction-bar", transaction.type, "animated")

    const columnWidth = container.clientWidth / this.numGridLines;
    const columnIndex = Math.floor(Math.random() * this.numGridLines);
    const x = columnIndex * columnWidth + columnWidth / 2;

    const width = Math.random() * 60 + 40
    bar.style.width = `${width}px`
    bar.style.left = `${x}px`

    const startY = container.clientHeight + 20
    bar.style.top = `${startY}px`

    const monadColors = ["monad-purple", "monad-berry", "monad-off-white"]
    const colorClass = monadColors[Math.floor(Math.random() * monadColors.length)]
    bar.classList.add(colorClass)

    if (transaction.type === "supernova") {
      bar.classList.remove(colorClass)
      bar.classList.add("monad-off-white")
    } else if (transaction.type === "large") {
      const largeTxColors = ["monad-purple", "monad-off-white"]
      const largeTxColor = largeTxColors[Math.floor(Math.random() * largeTxColors.length)]
      bar.classList.remove(colorClass)
      bar.classList.add(largeTxColor)
    }

    container.appendChild(bar)

    setTimeout(() => {
      if (bar.parentNode) {
        bar.remove()
      }
    }, 3600)
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

    while (feed.children.length > 10) {
      feed.removeChild(feed.lastChild);
    }
  }

  updateStats() {
    const now = Date.now();
    if (!this.lastUpdateTime) {
      this.lastUpdateTime = now;
      this.transactionsSinceLastUpdate = 0;
    }

    const timeDiff = (now - this.lastUpdateTime) / 1000;
    if (timeDiff >= 1) {
      this.currentTps = this.transactionsSinceLastUpdate / timeDiff;
      this.transactionsSinceLastUpdate = 0;
      this.lastUpdateTime = now;
    } else {
      this.transactionsSinceLastUpdate++;
    }

    const tpsValueElement = document.getElementById('liveTpsValue');
    const tpsGaugeInnerElement = document.getElementById('tpsGaugeInner');

    if (tpsValueElement && tpsGaugeInnerElement) {
        const displayTps = this.currentTps.toFixed(1);
        tpsValueElement.textContent = displayTps;

        const gaugePercentage = Math.min(100, (this.currentTps / this.maxTpsForBar) * 100);
        tpsGaugeInnerElement.style.width = `${gaugePercentage}%`;
    }
  }

  // --- DERBY METHODS ---
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
      tag.innerHTML = `${entity} <button class="remove-btn" data-entity="${entity}">×</button>`;
      container.appendChild(tag);
    });
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
      nameInput.value = '';
      addressesInput.value = '';
    }
  }

  setupRacetrack() {
    const track = document.getElementById('racetrack');
    if (!track) return;
    track.innerHTML = '';
    this.derbyConfig.entities.forEach((entity) => {
      const lane = document.createElement('div');
      lane.className = 'race-lane';
      lane.innerHTML = `<div class="lane-background"></div><div class="racer" data-entity="${entity}"></div><div class="lane-label">${entity}</div>`;
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
      card.innerHTML = `<div class="racer-name">${entity}</div><div class="racer-stats"><div>Position: ${this.racerPositions[entity] || 0}%</div><div>Speed: ${(Math.random() * 10).toFixed(1)} TPS</div></div>`;
      scoreboard.appendChild(card);
    });
  }

  startDerbySimulation() {
    if (this.derbyInterval) clearInterval(this.derbyInterval);
    this.derbyConfig.entities.forEach(entity => { this.racerPositions[entity] = 0; });
    this.derbyInterval = setInterval(() => {
      this.derbyConfig.entities.forEach(entity => {
        const speed = Math.random() * 2;
        this.racerPositions[entity] = Math.min(100, (this.racerPositions[entity] || 0) + speed);
        if (this.racerPositions[entity] >= 100) {
          this.racerPositions[entity] = 0;
        }
        const racer = document.querySelector(`.racer[data-entity="${entity}"]`);
        if (racer) racer.style.left = `${this.racerPositions[entity]}%`;
      });
      this.updateScoreboard();
    }, 100);
  }

  // --- MODAL METHODS ---
  openConfigModal() {
    const modal = document.getElementById('configModal');
    if (modal) modal.classList.add('active');
  }

  closeConfigModal() {
    const modal = document.getElementById('configModal');
    if (modal) modal.classList.remove('active');
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
    return '0x' + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new MonadVisualizer()
})