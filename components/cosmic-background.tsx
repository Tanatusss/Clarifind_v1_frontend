"use client"

import { useEffect, useRef } from "react"

export function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Particles for cosmic effect
    const particles: Array<{ x: number; y: number; size: number; opacity: number }> = []
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        opacity: Math.random() * 0.5 + 0.2,
      })
    }

    let animationFrameId: number

    const animate = () => {
      ctx.fillStyle = "rgba(10, 12, 25, 0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw particles (stars)
      particles.forEach((particle) => {
        ctx.fillStyle = `rgba(100, 150, 255, ${particle.opacity})`
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />
}
