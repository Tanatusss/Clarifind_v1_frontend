"use client"

import { useEffect, useRef } from "react"

interface Node3D {
  lat: number
  lon: number
  type: "company" | "location" | "person"
  label: string
  speed: number
}

export function GlobeNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Globe settings
    const centerX = canvas.width / 2
    const centerY = canvas.height * 0.65 // Increased globe size and adjusted positioning for full sphere
    const radius = Math.min(canvas.width, canvas.height) * 0.5
    let rotation = 0

    // Nodes on the globe surface
    const nodes: Node3D[] = [
      { lat: 13.7563, lon: 100.5018, type: "location", label: "Bangkok", speed: 0.002 },
      { lat: 1.3521, lon: 103.8198, type: "location", label: "Singapore", speed: 0.0015 },
      { lat: 22.3193, lon: 114.1694, type: "company", label: "Hong Kong", speed: 0.0018 },
      { lat: 35.6762, lon: 139.6503, type: "company", label: "Tokyo", speed: 0.0022 },
      { lat: 51.5074, lon: -0.1278, type: "person", label: "London", speed: 0.0012 },
      { lat: 40.7128, lon: -74.006, type: "company", label: "New York", speed: 0.0025 },
      { lat: -33.8688, lon: 151.2093, type: "location", label: "Sydney", speed: 0.002 },
      { lat: 31.2304, lon: 121.4737, type: "person", label: "Shanghai", speed: 0.0019 },
    ]

    // Convert lat/lon to 3D coordinates
    const latLonToXYZ = (lat: number, lon: number, r: number, rot: number) => {
      const phi = (90 - lat) * (Math.PI / 180)
      const theta = (lon + rot) * (Math.PI / 180)
      return {
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.cos(phi),
        z: r * Math.sin(phi) * Math.sin(theta),
      }
    }

    let animationFrameId: number

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      rotation += 0.2

      // Draw globe wireframe (both hemispheres)
      ctx.strokeStyle = "rgba(100, 150, 255, 0.15)"
      ctx.lineWidth = 1

      // Latitude lines (full sphere)
      for (let lat = -90; lat <= 90; lat += 15) {
        ctx.beginPath()
        for (let lon = 0; lon <= 360; lon += 5) {
          const pos = latLonToXYZ(lat, lon, radius, rotation)
          const x = centerX + pos.x
          const y = centerY - pos.y

          // Only draw if on front side of globe
          if (pos.z > -radius * 0.3) {
            if (lon === 0) {
              ctx.moveTo(x, y)
            } else {
              ctx.lineTo(x, y)
            }
          }
        }
        ctx.stroke()
      }

      // Longitude lines (full sphere)
      for (let lon = 0; lon < 360; lon += 15) {
        ctx.beginPath()
        for (let lat = -90; lat <= 90; lat += 5) {
          const pos = latLonToXYZ(lat, lon, radius, rotation)
          const x = centerX + pos.x
          const y = centerY - pos.y

          // Only draw front-facing lines
          if (pos.z > -radius * 0.3) {
            if (lat === -90) {
              ctx.moveTo(x, y)
            } else {
              ctx.lineTo(x, y)
            }
          }
        }
        ctx.stroke()
      }

      // Calculate node positions and draw connections
      const nodePositions = nodes.map((node) => {
        const pos = latLonToXYZ(node.lat, node.lon, radius, rotation)
        return {
          ...node,
          x: centerX + pos.x,
          y: centerY - pos.y,
          z: pos.z,
          pos3D: pos,
        }
      })

      // Draw connections between nodes (curved along globe surface)
      nodePositions.forEach((node1, i) => {
        nodePositions.forEach((node2, j) => {
          if (i >= j || node1.z < 0 || node2.z < 0) return

          // Draw arc between nodes along globe surface
          const steps = 30
          ctx.strokeStyle = "rgba(100, 200, 255, 0.3)"
          ctx.lineWidth = 1.5
          ctx.beginPath()

          for (let step = 0; step <= steps; step++) {
            const t = step / steps
            const lat = node1.lat + (node2.lat - node1.lat) * t
            const lon = node1.lon + (node2.lon - node1.lon) * t
            const pos = latLonToXYZ(lat, lon, radius * 1.02, rotation)

            if (pos.z > 0) {
              const x = centerX + pos.x
              const y = centerY - pos.y
              if (step === 0) {
                ctx.moveTo(x, y)
              } else {
                ctx.lineTo(x, y)
              }
            }
          }
          ctx.stroke()

          // Animated pulse along connection
          const pulsePos = ((Date.now() * node1.speed) % 1000) / 1000
          const pulseLat = node1.lat + (node2.lat - node1.lat) * pulsePos
          const pulseLon = node1.lon + (node2.lon - node1.lon) * pulsePos
          const pulseXYZ = latLonToXYZ(pulseLat, pulseLon, radius * 1.02, rotation)

          if (pulseXYZ.z > 0) {
            const pulseX = centerX + pulseXYZ.x
            const pulseY = centerY - pulseXYZ.y

            const gradient = ctx.createRadialGradient(pulseX, pulseY, 0, pulseX, pulseY, 8)
            gradient.addColorStop(0, "rgba(100, 220, 255, 0.8)")
            gradient.addColorStop(1, "rgba(100, 220, 255, 0)")
            ctx.fillStyle = gradient
            ctx.beginPath()
            ctx.arc(pulseX, pulseY, 8, 0, Math.PI * 2)
            ctx.fill()
          }
        })
      })

      // Draw nodes
      nodePositions.forEach((node) => {
        if (node.z < 0) return // Don't draw nodes on back of globe

        const nodeColor =
          node.type === "company"
            ? "rgba(100, 150, 255, 0.9)"
            : node.type === "location"
              ? "rgba(100, 220, 255, 0.9)"
              : "rgba(150, 180, 255, 0.9)"

        // Outer glow
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 15)
        gradient.addColorStop(0, nodeColor)
        gradient.addColorStop(1, "rgba(100, 150, 255, 0)")
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(node.x, node.y, 15, 0, Math.PI * 2)
        ctx.fill()

        // Inner node
        ctx.fillStyle = nodeColor
        ctx.beginPath()
        ctx.arc(node.x, node.y, 6, 0, Math.PI * 2)
        ctx.fill()

        // Node border
        ctx.strokeStyle = "rgba(200, 230, 255, 0.8)"
        ctx.lineWidth = 2
        ctx.stroke()
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 5 }} />
}
