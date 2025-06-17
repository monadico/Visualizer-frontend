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

    this.init()
    window.visualizer = this
  }

  init() {
    this.setupEventListeners()
    this.initializeDerby()
    this.startSimulations()
  }

  setupEventListeners() {
    // Tab navigation
    document.querySelectorAll(".tab-button").forEach((button) => {
      button.addEventListener("click", (e) => {
        this.switchTab(e.target.dataset.tab)
      })
    })

    // Derby configuration
    document.getElementById("configButton").addEventListener("click", () => {
      this.openConfigModal()
    })

    document.getElementById("closeModal").addEventListener("click", () => {
      this.closeConfigModal()
    })

    document.getElementById("applyConfig").addEventListener("click", () => {
      this.applyConfiguration()
    })

    document.getElementById("resetConfig").addEventListener("click", () => {
      this.resetConfiguration()
    })

    document.getElementById("configModal").addEventListener("click", (e) => {
      if (e.target.id === "configModal") {
        this.closeConfigModal()
      }
    })

    document.getElementById("addEntity").addEventListener("click", () => {
      this.addEntity()
    })
  }

  switchTab(tabName) {
    // Update active tab button
    document.querySelectorAll(".tab-button").forEach((btn) => {
      btn.classList.remove("active")
    })
    document.querySelector(`[data-tab="${tabName}"]`).classList.add("active")

    // Update active page
    document.querySelectorAll(".page").forEach((page) => {
      page.classList.remove("active")
    })
    document.getElementById(tabName).classList.add("active")

    this.currentTab = tabName
  }

  startSimulations() {
    this.simulateDataStream()
    this.updateStats()
    this.startDerbySimulation()
  }

  simulateDataStream() {
    const createBurst = () => {
      if (this.currentTab === "cityscape") {
        // More varied clustering: sometimes small bursts, sometimes large waves
        const burstType = Math.random()
        let burstSize

        if (burstType < 0.4) {
          // Small burst (40% chance)
          burstSize = 3 + Math.floor(Math.random() * 5) // 3-7 bars
        } else if (burstType < 0.8) {
          // Medium burst (40% chance)
          burstSize = 8 + Math.floor(Math.random() * 8) // 8-15 bars
        } else {
          // Large wave (20% chance)
          burstSize = 16 + Math.floor(Math.random() * 12) // 16-27 bars
        }

        this.burst(burstSize)
      }
    }

    const scheduleNextBurst = () => {
      // More natural rhythm: shorter gaps between small bursts, longer gaps after large waves
      const lastBurstSize = this.lastBurstSize || 10
      let delay

      if (lastBurstSize < 8) {
        delay = 300 + Math.random() * 400 // 300-700ms for small bursts
      } else if (lastBurstSize < 16) {
        delay = 500 + Math.random() * 600 // 500-1100ms for medium bursts
      } else {
        delay = 800 + Math.random() * 800 // 800-1600ms for large waves
      }

      setTimeout(() => {
        createBurst()
        scheduleNextBurst()
      }, delay)
    }

    scheduleNextBurst()
  }

  createTransactionBar(transaction) {
    const container = document.querySelector(".transaction-container")
    if (!container) return

    const bar = document.createElement("div")
    bar.classList.add("transaction-bar", transaction.type, "animated")

    // Grid-aligned positioning
    const numColumns = 24 // 24 vertical grid lines for good distribution
    const columnWidth = container.clientWidth / numColumns
    const columnIndex = Math.floor(Math.random() * numColumns)
    const x = columnIndex * columnWidth + columnWidth / 2 // center on grid line

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
    const transactionTypes = ["small", "medium", "large", "supernova"]
    const weights = [0.65, 0.22, 0.11, 0.02] // Slightly adjusted for better visual balance

    for (let i = 0; i < count; i++) {
      // Determine transaction type
      let random = Math.random()
      let type = "small"

      for (let j = 0; j < weights.length; j++) {
        if (random < weights[j]) {
          type = transactionTypes[j]
          break
        }
        random -= weights[j]
      }

      const transaction = {
        hash: "0x" + Math.random().toString(16).substr(2, 16),
        from: "0x" + Math.random().toString(16).substr(2, 8) + "...",
        to: "0x" + Math.random().toString(16).substr(2, 8) + "...",
        value: (Math.random() * 100).toFixed(4),
        type: type,
      }

      // Staggered timing within burst for natural flow
      const delay = Math.random() * 120 // 0-120ms spread
      setTimeout(() => {
        this.createTransactionBar(transaction)
        this.addToDataFeed(transaction)
        this.transactionCount++
      }, delay)
    }
  }

  addToDataFeed(transaction) {
    const feedContent = document.getElementById("dataFeed")
    if (!feedContent) return

    const timestamp = new Date().toLocaleTimeString()
    const feedItem = document.createElement("div")
    feedItem.className = "feed-item"
    feedItem.innerHTML = `
      <div class="timestamp">${timestamp}</div>
      <div class="action">Transaction ${transaction.hash.substring(0, 8)}...</div>
      <div class="details">${transaction.from} → ${transaction.to} (${transaction.value} ETH)</div>
    `

    feedContent.insertBefore(feedItem, feedContent.firstChild)

    // Remove old items
    while (feedContent.children.length > 50) {
      feedContent.removeChild(feedContent.lastChild)
    }
  }

  updateStats() {
    const updateTps = () => {
      this.currentTps = Math.floor(Math.random() * 5000 + 1000)
      document.getElementById("liveTps").textContent = this.currentTps.toLocaleString()
      document.getElementById("totalTx").textContent = this.transactionCount.toLocaleString()
    }

    updateTps()
    setInterval(updateTps, 1000)
  }

  // Keep all the existing Derby methods unchanged...
  initializeDerby() {
    this.updateCurrentEntities()
    this.setupRacetrack()
    this.updateScoreboard()
  }

  updateCurrentEntities() {
    const container = document.getElementById("currentEntities")
    container.innerHTML = ""

    if (this.derbyConfig.entities.length === 0) {
      container.innerHTML = '<span style="opacity: 0.6; font-style: italic;">No entities configured</span>'
      return
    }

    this.derbyConfig.entities.forEach((entity) => {
      const tag = document.createElement("div")
      tag.className = "entity-tag"
      tag.innerHTML = `
        <span>${entity.name || entity}</span>
        <button class="remove-btn" onclick="visualizer.removeEntity('${entity.name || entity}')" title="Remove entity">×</button>
      `
      container.appendChild(tag)
    })
  }

  removeEntity(entityName) {
    this.derbyConfig.entities = this.derbyConfig.entities.filter((entity) => (entity.name || entity) !== entityName)
    this.updateCurrentEntities()
    this.setupRacetrack()
  }

  addEntity() {
    const nameInput = document.getElementById("entityName")
    const addressInput = document.getElementById("entityAddresses")
    const monitoringOption = document.querySelector('input[name="monitoring"]:checked')

    const name = nameInput.value.trim()
    const addresses = addressInput.value.trim()

    if (!name || !addresses) {
      alert("Please enter both entity name and address(es)")
      return
    }

    const newEntity = {
      name: name,
      addresses: addresses.split(",").map((addr) => addr.trim()),
      monitoring: monitoringOption.value,
    }

    const exists = this.derbyConfig.entities.some((entity) => (entity.name || entity) === name)

    if (exists) {
      alert("An entity with this name already exists")
      return
    }

    this.derbyConfig.entities.push(newEntity)
    this.updateCurrentEntities()

    nameInput.value = ""
    addressInput.value = ""
    document.getElementById("toAddress").checked = true
  }

  setupRacetrack() {
    const racetrack = document.getElementById("racetrack")
    racetrack.innerHTML = ""

    this.derbyConfig.entities.forEach((entity, index) => {
      const entityName = entity.name || entity
      const lane = document.createElement("div")
      lane.className = "race-lane"
      lane.innerHTML = `
        <div class="lane-background"></div>
        <div class="lane-label">${entityName}</div>
        <div class="racer" id="racer-${entityName}"></div>
      `
      racetrack.appendChild(lane)

      this.racerPositions[entityName] = 0
      this.racerData[entityName] = {
        tps: Math.floor(Math.random() * 1000 + 100),
        laps: 0,
        hash: this.generateRandomHash(),
      }
    })
  }

  updateScoreboard() {
    const content = document.getElementById("scoreboardContent")
    content.innerHTML = ""

    const sortedEntities = [...this.derbyConfig.entities].sort((a, b) => this.racerData[b].tps - this.racerData[a].tps)

    sortedEntities.forEach((entity, index) => {
      const data = this.racerData[entity]
      const card = document.createElement("div")
      card.className = "racer-card"
      card.innerHTML = `
        <div class="racer-name">#${index + 1} ${entity}</div>
        <div class="racer-stats">
          <span>TPS: ${data.tps}</span>
          <span>Laps: ${data.laps}</span>
        </div>
        <div style="font-size: 0.7rem; opacity: 0.6; margin-top: 0.5rem;">
          ${data.hash}
        </div>
      `
      content.appendChild(card)
    })
  }

  startDerbySimulation() {
    const updateRace = () => {
      this.derbyConfig.entities.forEach((entity) => {
        const variation = (Math.random() - 0.5) * 200
        this.racerData[entity].tps = Math.max(50, Math.floor(this.racerData[entity].tps + variation))

        const speed = this.racerData[entity].tps / 10000
        this.racerPositions[entity] += speed

        if (this.racerPositions[entity] >= 1) {
          this.racerPositions[entity] = 0
          this.racerData[entity].laps++
          this.racerData[entity].hash = this.generateRandomHash()
        }

        const racerElement = document.getElementById(`racer-${entity}`)
        if (racerElement) {
          const trackWidth = racerElement.parentElement.offsetWidth - 40
          const position = this.racerPositions[entity] * trackWidth
          racerElement.style.left = position + "px"
        }
      })

      this.updateScoreboard()
    }

    setInterval(updateRace, 100)
  }

  generateRandomHash() {
    return "0x" + Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
  }

  // Modal Management
  openConfigModal() {
    document.getElementById("configModal").classList.add("active")
  }

  closeConfigModal() {
    document.getElementById("configModal").classList.remove("active")
  }

  applyConfiguration() {
    this.setupRacetrack()
    this.closeConfigModal()
  }

  resetConfiguration() {
    this.derbyConfig.entities = [
      { name: "Uniswap", addresses: ["0x1f9840a85d5af5bf1d1762f925bdaddc4201f984"], monitoring: "both" },
      { name: "SushiSwap", addresses: ["0x6b3595068778dd592e39a122f4f5a5cf09c90fe2"], monitoring: "both" },
      { name: "PancakeSwap", addresses: ["0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82"], monitoring: "both" },
    ]
    this.updateCurrentEntities()
    this.setupRacetrack()

    document.getElementById("entityName").value = ""
    document.getElementById("entityAddresses").value = ""
    document.getElementById("toAddress").checked = true
  }
}

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  new MonadVisualizer()
})
