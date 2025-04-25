"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"

type Particle = {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  color: string
}

export function BackgroundParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>(0)
  const { theme } = useTheme()
  const prefersReducedMotion = useRef(false)

  // Check if user prefers reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    prefersReducedMotion.current = mediaQuery.matches

    const handleChange = () => {
      prefersReducedMotion.current = mediaQuery.matches
      if (mediaQuery.matches && animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = 0
      } else if (!mediaQuery.matches && !animationRef.current) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  // Initialize canvas and particles
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const { clientWidth, clientHeight } = document.documentElement
        setDimensions({
          width: clientWidth,
          height: clientHeight,
        })
        canvasRef.current.width = clientWidth
        canvasRef.current.height = clientHeight
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    // Initialize particles
    const particleCount = Math.min(Math.max(Math.floor((dimensions.width * dimensions.height) / 20000), 20), 100)
    initParticles(particleCount)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [dimensions.width, dimensions.height])

  // Start animation when component mounts
  useEffect(() => {
    if (!prefersReducedMotion.current && dimensions.width > 0 && dimensions.height > 0) {
      animationRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [dimensions])

  // Update particle colors when theme changes
  useEffect(() => {
    if (particlesRef.current.length > 0) {
      particlesRef.current = particlesRef.current.map((particle) => ({
        ...particle,
        color: getParticleColor(),
      }))
    }
  }, [theme])

  const getParticleColor = () => {
    const isDark = theme === "dark"

    // Colors for light theme
    const lightColors = [
      "rgba(167, 139, 250, 0.4)", // Purple
      "rgba(96, 165, 250, 0.4)", // Blue
      "rgba(251, 191, 36, 0.4)", // Yellow
      "rgba(248, 113, 113, 0.4)", // Red
      "rgba(52, 211, 153, 0.4)", // Green
    ]

    // Colors for dark theme
    const darkColors = [
      "rgba(167, 139, 250, 0.2)", // Purple
      "rgba(96, 165, 250, 0.2)", // Blue
      "rgba(251, 191, 36, 0.2)", // Yellow
      "rgba(248, 113, 113, 0.2)", // Red
      "rgba(52, 211, 153, 0.2)", // Green
    ]

    const colors = isDark ? darkColors : lightColors
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const initParticles = (count: number) => {
    const particles: Particle[] = []

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.1,
        color: getParticleColor(),
      })
    }

    particlesRef.current = particles
  }

  const animate = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, dimensions.width, dimensions.height)

    // Update and draw particles
    particlesRef.current.forEach((particle, index) => {
      // Update position
      particle.x += particle.speedX
      particle.y += particle.speedY

      // Wrap around edges
      if (particle.x < 0) particle.x = dimensions.width
      if (particle.x > dimensions.width) particle.x = 0
      if (particle.y < 0) particle.y = dimensions.height
      if (particle.y > dimensions.height) particle.y = 0

      // Draw particle
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fillStyle = particle.color
      ctx.fill()

      // Store updated particle
      particlesRef.current[index] = particle
    })

    animationRef.current = requestAnimationFrame(animate)
  }

  return (
    <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-0" aria-hidden="true" />
  )
}
