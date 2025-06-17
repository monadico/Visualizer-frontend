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
        // Randomize 8-15 bars per burst for tighter grouping
        const burstSize = 8 + Math.floor(Math.random() * 8)
        this.burst(burstSize)
      }
    }

    const scheduleNextBurst = () => {
      const delay = Math.random() * 300 + 700 // 700-1000ms intervals
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
    bar.classList.add("transaction-bar", transaction.type)

    // Random width (50px to 150px)
    const width = Math.random() * 100 + 50
    bar.style.width = `${width}px`

    // Random horizontal position
    const x = Math.random() * (container.clientWidth - width)
    bar.style.left = `${x}px`

    // Start at bottom
    const startY = container.clientHeight
    bar.style.top = `${startY}px`

    container.appendChild(bar)

    // Animate with dynamic glow based on Y-position
    let y = startY
    const totalDistance = container.clientHeight + 100

    const animate = () => {
      const progress = (startY - y) / totalDistance
      y -= 2 // Constant speed

      // Position
      bar.style.top = `${y}px`

      // Glow intensity: peak around 50% height with narrower band
      const glowStrength = Math.max(
        0,
        1 - Math.abs(progress - 0.5) * 3, // narrower peak band
      )

      bar.style.opacity = glowStrength
      bar.style.filter = `blur(${glowStrength * 6}px)`

      if (y < -20) {
        bar.remove()
      } else {
        requestAnimationFrame(animate)
      }
    }

    animate()
  }

  burst(count = 10) {
    const transactionTypes = ["small", "medium", "large", "supernova"]
    const weights = [0.6, 0.25, 0.12, 0.03]

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

      // Tight temporal grouping - spawn almost simultaneously
      setTimeout(() => {
        this.createTransactionBar(transaction)
        this.addToDataFeed(transaction)
        this.transactionCount++
      }, Math.random() * 50) // 0-50ms spread for tight grouping
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
