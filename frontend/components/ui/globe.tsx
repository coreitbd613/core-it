"use client"

import { useEffect, useRef, useState } from "react"
import createGlobe, { type COBEOptions } from "cobe"
import { useMotionValue, useSpring } from "motion/react"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"

const MOVEMENT_DAMPING = 1400

const GLOBE_MARKERS = [
  // Manila, Philippines
  { location: [14.5995, 120.9842] as [number, number], size: 0.03 },
  // Mumbai, India
  { location: [19.076, 72.8777] as [number, number], size: 0.1 },
  // Dhaka, Bangladesh
  { location: [23.8103, 90.4125] as [number, number], size: 0.1 },
  // Cairo, Egypt
  { location: [30.0444, 31.2357] as [number, number], size: 0.07 },
  // Beijing, China
  { location: [39.9042, 116.4074] as [number, number], size: 0.08 },
  // São Paulo, Brazil
  { location: [-23.5505, -46.6333] as [number, number], size: 0.1 },
  // Mexico City, Mexico
  { location: [19.4326, -99.1332] as [number, number], size: 0.1 },
  // New York, USA
  { location: [40.7128, -74.006] as [number, number], size: 0.1 },
  // Osaka, Japan
  { location: [34.6937, 135.5022] as [number, number], size: 0.05 },
  // Istanbul, Turkey
  { location: [41.0082, 28.9784] as [number, number], size: 0.06 },
  // London, United Kingdom
  { location: [51.5074, -0.1278] as [number, number], size: 0.08 },
  // Berlin, Germany
  { location: [52.52, 13.405] as [number, number], size: 0.06 },
  // Paris, France
  { location: [48.8566, 2.3522] as [number, number], size: 0.06 },
  // Dubai, UAE
  { location: [25.2048, 55.2708] as [number, number], size: 0.08 },
  // Singapore
  { location: [1.3521, 103.8198] as [number, number], size: 0.07 },
  // Sydney, Australia
  { location: [-33.8688, 151.2093] as [number, number], size: 0.06 },
  // Toronto, Canada
  { location: [43.6532, -79.3832] as [number, number], size: 0.06 },
  // Lagos, Nigeria
  { location: [6.5244, 3.3792] as [number, number], size: 0.06 },
  // Johannesburg, South Africa
  { location: [-26.2041, 28.0473] as [number, number], size: 0.05 },
  // Jakarta, Indonesia
  { location: [-6.2088, 106.8456] as [number, number], size: 0.06 },
  // Karachi, Pakistan
  { location: [24.8607, 67.0011] as [number, number], size: 0.06 },
  // Moscow, Russia
  { location: [55.7558, 37.6173] as [number, number], size: 0.06 },
  // Buenos Aires, Argentina
  { location: [-34.6037, -58.3816] as [number, number], size: 0.05 },
  // Seoul, South Korea
  { location: [37.5665, 126.978] as [number, number], size: 0.06 },
  // Bangkok, Thailand
  { location: [13.7563, 100.5018] as [number, number], size: 0.05 },
]

const LIGHT_GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [0.6, 0.6, 0.63],
  markerColor: [251 / 255, 100 / 255, 21 / 255],
  glowColor: [0.9, 0.9, 0.92],
  markers: GLOBE_MARKERS,
}

const DARK_GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 1,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 6,
  baseColor: [10 / 255, 37 / 255, 64 / 255],
  markerColor: [251 / 255, 100 / 255, 21 / 255],
  glowColor: [0.9, 0.9, 0.92],
  markers: GLOBE_MARKERS,
}

export function Globe({
  className,
  config,
}: {
  className?: string
  config?: COBEOptions
}) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const themeConfig =
    mounted && resolvedTheme === "light" ? LIGHT_GLOBE_CONFIG : DARK_GLOBE_CONFIG
  const activeConfig = config ?? themeConfig
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const phiRef = useRef(0)
  const widthRef = useRef(0)
  const pointerInteracting = useRef<number | null>(null)
  const pointerInteractionMovement = useRef(0)

  const r = useMotionValue(0)
  const rs = useSpring(r, {
    mass: 1,
    damping: 30,
    stiffness: 100,
  })

  const updatePointerInteraction = (value: number | null) => {
    pointerInteracting.current = value
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value !== null ? "grabbing" : "grab"
    }
  }

  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current
      pointerInteractionMovement.current = delta
      r.set(r.get() + delta / MOVEMENT_DAMPING)
    }
  }

  useEffect(() => {
    const onResize = () => {
      if (canvasRef.current) {
        widthRef.current = canvasRef.current.offsetWidth
      }
    }

    window.addEventListener("resize", onResize)
    onResize()

    const globe = createGlobe(canvasRef.current!, {
      ...activeConfig,
      width: widthRef.current * 2,
      height: widthRef.current * 2,
      onRender: (state) => {
        if (!pointerInteracting.current) phiRef.current += 0.005
        state.phi = phiRef.current + rs.get()
        state.width = widthRef.current * 2
        state.height = widthRef.current * 2
      },
    })

    setTimeout(() => (canvasRef.current!.style.opacity = "1"), 0)
    return () => {
      globe.destroy()
      window.removeEventListener("resize", onResize)
    }
  }, [rs, activeConfig])

  return (
    <div
      className={cn(
        "absolute inset-0 mx-auto aspect-square w-full max-w-150",
        className
      )}
    >
      <canvas
        className={cn(
          "size-full opacity-0 transition-opacity duration-500 contain-[layout_paint_size]"
        )}
        ref={canvasRef}
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX
          updatePointerInteraction(e.clientX)
        }}
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) =>
          e.touches[0] && updateMovement(e.touches[0].clientX)
        }
      />
    </div>
  )
}
