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

    // Gmunk stream instance
    this.gmunkStream = null

    this.init()
    window.visualizer = this
  }

  init() {
    this.setupEventListeners()
    this.initializeDerby()
    this.initializeGmunkStream()
    this.startSimulations()
  }

  initializeGmunkStream() {
    const canvas = document.getElementById("gmunk-canvas")
    if (canvas) {
      this.gmunkStream = new GmunkDataStream(canvas)
    }
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
    const createTransaction = () => {
      const transactionTypes = ["small", "medium", "large", "supernova"]
      const weights = [0.5, 0.3, 0.15, 0.05]

      let random = Math.random()
      let type = "small"

      for (let i = 0; i < weights.length; i++) {
        if (random < weights[i]) {
          type = transactionTypes[i]
          break
        }
        random -= weights[i]
      }

      const transaction = {
        hash: "0x" + Math.random().toString(16).substr(2, 16),
        from: "0x" + Math.random().toString(16).substr(2, 8) + "...",
        to: "0x" + Math.random().toString(16).substr(2, 8) + "...",
        value: (Math.random() * 100).toFixed(4),
        type: type,
      }

      // Add to gmunk stream
      if (this.gmunkStream && this.currentTab === "cityscape") {
        this.gmunkStream.addTransaction(transaction)
      }

      // Add to data feed
      this.addToDataFeed(transaction)

      this.transactionCount++
    }

    const scheduleNextTransaction = () => {
      const delay = Math.random() * 400 + 100
      setTimeout(() => {
        createTransaction()
        scheduleNextTransaction()
      }, delay)
    }

    scheduleNextTransaction()
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

  // Derby Implementation (keeping original)
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

// Gmunk Data Stream Class
class GmunkDataStream {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")
    this.streams = []
    this.maxStreams = 30
    this.isActive = true

    this.setupCanvas()
    this.initializeStreams()
    this.start()
  }

  setupCanvas() {
    this.resize()
    this.ctx.globalCompositeOperation = "screen"
    window.addEventListener("resize", () => this.resize())
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect()
    this.canvas.width = rect.width
    this.canvas.height = rect.height
    this.width = rect.width
    this.height = rect.height
  }

  initializeStreams() {
    this.streams = []
    for (let i = 0; i < this.maxStreams; i++) {
      this.createStream(i)
    }
  }

  createStream(index) {
    const stream = {
      x: (index / this.maxStreams) * this.width,
      segments: [],
      baseIntensity: Math.random() * 0.5 + 0.3,
      frequency: Math.random() * 0.02 + 0.01,
      phase: Math.random() * Math.PI * 2,
      color: this.getStreamColor(index),
      width: Math.random() * 6 + 3,
    }

    for (let y = 0; y < this.height + 50; y += 4) {
      stream.segments.push({
        y: y,
        intensity: 0,
        height: Math.random() * 12 + 4,
        targetIntensity: 0,
        life: 0,
      })
    }

    this.streams.push(stream)
  }

  getStreamColor(index) {
    const colors = [
      { r: 255, g: 0, b: 128 }, // Pink
      { r: 128, g: 0, b: 255 }, // Purple
      { r: 0, g: 128, b: 255 }, // Blue
      { r: 0, g: 255, b: 255 }, // Cyan
    ]
    return colors[index % colors.length]
  }

  update() {
    const time = Date.now() * 0.001

    this.streams.forEach((stream) => {
      const activityWave = Math.sin(time * stream.frequency + stream.phase) * 0.5 + 0.5
      const burstProbability = stream.baseIntensity * activityWave * 0.08

      stream.segments.forEach((segment) => {
        if (Math.random() < burstProbability) {
          segment.targetIntensity = Math.random() * 0.8 + 0.2
          segment.life = Math.random() * 1500 + 800
        }

        if (segment.life > 0) {
          segment.life -= 16
          const lifeFactor = Math.max(0, segment.life / 1500)
          segment.intensity = this.lerp(segment.intensity, segment.targetIntensity * lifeFactor, 0.1)
        } else {
          segment.intensity = this.lerp(segment.intensity, 0, 0.05)
        }
      })
    })
  }

  render() {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
    this.ctx.fillRect(0, 0, this.width, this.height)

    this.streams.forEach((stream) => {
      stream.segments.forEach((segment) => {
        if (segment.intensity > 0.01) {
          this.renderSegment(stream, segment)
        }
      })
    })
  }

  renderSegment(stream, segment) {
    const { color } = stream
    const alpha = segment.intensity
    const glowSize = segment.height * (1 + segment.intensity * 2)

    this.ctx.save()

    // Glow effect
    const gradient = this.ctx.createRadialGradient(stream.x, segment.y, 0, stream.x, segment.y, glowSize)
    gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`)
    gradient.addColorStop(0.3, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.6})`)
    gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`)

    this.ctx.fillStyle = gradient
    this.ctx.fillRect(stream.x - glowSize, segment.y - segment.height / 2, glowSize * 2, segment.height)

    // Core segment
    this.ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 1.5})`
    this.ctx.fillRect(stream.x - stream.width / 2, segment.y - segment.height / 2, stream.width, segment.height)

    this.ctx.restore()
  }

  addTransaction(data) {
    const streamIndex = Math.floor(Math.random() * this.streams.length)
    let intensity = 0.3

    switch (data.type) {
      case "small":
        intensity = 0.3
        break
      case "medium":
        intensity = 0.5
        break
      case "large":
        intensity = 0.7
        break
      case "supernova":
        intensity = 1.0
        break
    }

    this.triggerDataBurst(streamIndex, intensity)
  }

  triggerDataBurst(streamIndex, intensity = 1) {
    if (streamIndex < this.streams.length) {
      const stream = this.streams[streamIndex]
      const burstHeight = Math.floor(this.height * 0.3)
      const startY = Math.random() * (this.height - burstHeight)

      for (let i = 0; i < burstHeight; i += 4) {
        const segmentIndex = Math.floor((startY + i) / 4)
        if (segmentIndex < stream.segments.length) {
          const segment = stream.segments[segmentIndex]
          segment.targetIntensity = intensity * (Math.random() * 0.5 + 0.5)
          segment.life = Math.random() * 1200 + 800
        }
      }
    }
  }

  lerp(start, end, factor) {
    return start + (end - start) * factor
  }

  start() {
    this.isActive = true
    this.animate()
  }

  animate() {
    if (this.isActive) {
      this.update()
      this.render()
      requestAnimationFrame(() => this.animate())
    }
  }

  stop() {
    this.isActive = false
  }
}

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  new MonadVisualizer()
})
