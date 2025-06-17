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
    this.startCityscapeSimulation()
    this.startDerbySimulation()
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

    // Close modal on overlay click
    document.getElementById("configModal").addEventListener("click", (e) => {
      if (e.target.id === "configModal") {
        this.closeConfigModal()
      }
    })

    // Add this after the existing derby configuration listeners:
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

  // Cityscape Firehose Implementation
  startCityscapeSimulation() {
    this.simulateTransactionStream()
    this.spawnMonanimal()
    this.updateStats()
  }

  simulateTransactionStream() {
    const starsContainer = document.getElementById("starsContainer")

    const createStar = () => {
      const star = document.createElement("div")

      // Random star type based on transaction value/importance
      const rand = Math.random()
      if (rand < 0.6) {
        star.className = "star small"
      } else if (rand < 0.85) {
        star.className = "star medium"
      } else if (rand < 0.97) {
        star.className = "star large"
      } else {
        star.className = "star supernova"
      }

      // Random position
      star.style.left = Math.random() * 100 + "%"
      star.style.top = Math.random() * 100 + "%"

      starsContainer.appendChild(star)

      // Remove after animation
      setTimeout(() => {
        if (star.parentNode) {
          star.parentNode.removeChild(star)
        }
      }, 1000)

      this.transactionCount++
    }

    // Variable rate transaction simulation
    const scheduleNextStar = () => {
      const delay = Math.random() * 200 + 50 // 50-250ms
      setTimeout(() => {
        createStar()
        scheduleNextStar()
      }, delay)
    }

    scheduleNextStar()

    // Add moon click interaction
    document.getElementById("spinningMoon").addEventListener("click", () => {
      this.createMoonBurst()
    })
  }

  createMoonBurst() {
    const starsContainer = document.getElementById("starsContainer")
    const moon = document.getElementById("spinningMoon")
    const moonRect = moon.getBoundingClientRect()
    const containerRect = starsContainer.getBoundingClientRect()

    // Create burst of stars from moon position
    for (let i = 0; i < 12; i++) {
      setTimeout(() => {
        const star = document.createElement("div")
        star.className = "star large"

        // Position relative to moon
        const moonCenterX = ((moonRect.left + moonRect.width / 2 - containerRect.left) / containerRect.width) * 100
        const moonCenterY = ((moonRect.top + moonRect.height / 2 - containerRect.top) / containerRect.height) * 100

        // Spread stars in a circle around moon
        const angle = (i / 12) * 2 * Math.PI
        const distance = 50 + Math.random() * 100
        const offsetX = Math.cos(angle) * distance
        const offsetY = Math.sin(angle) * distance

        star.style.left = Math.max(0, Math.min(100, moonCenterX + (offsetX / containerRect.width) * 100)) + "%"
        star.style.top = Math.max(0, Math.min(100, moonCenterY + (offsetY / containerRect.height) * 100)) + "%"

        starsContainer.appendChild(star)

        setTimeout(() => {
          if (star.parentNode) {
            star.parentNode.removeChild(star)
          }
        }, 1000)
      }, i * 50)
    }
  }

  spawnMonanimal() {
    const container = document.getElementById("monanimalsContainer")

    const createMonanimal = () => {
      const monanimal = document.createElement("div")
      monanimal.className = "monanimal"

      // Random vertical position
      monanimal.style.top = Math.random() * 80 + 10 + "%"
      monanimal.style.left = "-50px"

      container.appendChild(monanimal)

      // Remove after animation
      setTimeout(() => {
        if (monanimal.parentNode) {
          monanimal.parentNode.removeChild(monanimal)
        }
      }, 15000)
    }

    // Spawn Monanimal every 8-15 seconds
    const scheduleNextMonanimal = () => {
      const delay = Math.random() * 7000 + 8000
      setTimeout(() => {
        createMonanimal()
        scheduleNextMonanimal()
      }, delay)
    }

    scheduleNextMonanimal()
  }

  updateStats() {
    const updateTps = () => {
      // Simulate TPS fluctuation
      this.currentTps = Math.floor(Math.random() * 5000 + 1000)
      document.getElementById("liveTps").textContent = this.currentTps.toLocaleString()
      document.getElementById("totalTx").textContent = this.transactionCount.toLocaleString()
    }

    updateTps()
    setInterval(updateTps, 1000)
  }

  // Derby Implementation
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

    // Check if entity already exists
    const exists = this.derbyConfig.entities.some((entity) => (entity.name || entity) === name)

    if (exists) {
      alert("An entity with this name already exists")
      return
    }

    this.derbyConfig.entities.push(newEntity)
    this.updateCurrentEntities()

    // Clear inputs
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

      // Initialize racer position and data
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

    // Sort entities by TPS for leaderboard
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
        // Update TPS with some variation
        const variation = (Math.random() - 0.5) * 200
        this.racerData[entity].tps = Math.max(50, Math.floor(this.racerData[entity].tps + variation))

        // Update position based on TPS
        const speed = this.racerData[entity].tps / 10000 // Normalize speed
        this.racerPositions[entity] += speed

        // Check for lap completion
        if (this.racerPositions[entity] >= 1) {
          this.racerPositions[entity] = 0
          this.racerData[entity].laps++
          this.racerData[entity].hash = this.generateRandomHash()
        }

        // Update racer visual position
        const racerElement = document.getElementById(`racer-${entity}`)
        if (racerElement) {
          const trackWidth = racerElement.parentElement.offsetWidth - 40
          const position = this.racerPositions[entity] * trackWidth
          racerElement.style.left = position + "px"
        }
      })

      this.updateScoreboard()
    }

    // Update race every 100ms for smooth animation
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
    const checkboxes = document.querySelectorAll('#entityCheckboxes input[type="checkbox"]')
    const selectedEntities = Array.from(checkboxes)
      .filter((cb) => cb.checked)
      .map((cb) => cb.value)

    if (selectedEntities.length === 0) {
      alert("Please select at least one entity to race.")
      return
    }

    this.derbyConfig.entities = selectedEntities
    this.racerPositions = {}
    this.racerData = {}

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

    // Reset form
    document.getElementById("entityName").value = ""
    document.getElementById("entityAddresses").value = ""
    document.getElementById("toAddress").checked = true
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new MonadVisualizer()
})

// Performance optimization: Use requestAnimationFrame for smooth animations
let lastFrameTime = 0
function optimizedUpdate(currentTime) {
  if (currentTime - lastFrameTime >= 16) {
    // ~60fps
    // Perform any frame-based updates here
    lastFrameTime = currentTime
  }
  requestAnimationFrame(optimizedUpdate)
}
requestAnimationFrame(optimizedUpdate)
