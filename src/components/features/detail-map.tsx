'use client'

import { useEffect, useRef } from 'react'

interface DetailMapProps {
  latitude: number
  longitude: number
}

async function getLeaflet() {
  if (typeof window !== 'undefined' && (window as Record<string, unknown>).L) {
    return (window as Record<string, unknown>).L as typeof L
  }
  const mod = await import('leaflet')
  return mod.default
}

export default function DetailMap({ latitude, longitude }: DetailMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || mapRef.current) return

    let cancelled = false
    let ro: ResizeObserver | null = null

    ;(async () => {
      const L = await getLeaflet()
      if (cancelled) return

      delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      if (cancelled) return

      const map = L.map(container, { zoomControl: true }).setView([latitude, longitude], 15)
      mapRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map)

      const marker = L.marker([latitude, longitude], {
        icon: L.divIcon({
          html: '<div style="background:#16A34A;color:white;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">📍</div>',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          className: '',
        }),
      }).addTo(map)

      marker.bindPopup(`Lat: ${latitude}<br/>Lng: ${longitude}`)

      ro = new ResizeObserver(() => map.invalidateSize())
      ro.observe(container)

      requestAnimationFrame(() => map.invalidateSize())
    })()

    return () => {
      cancelled = true
      if (ro) ro.disconnect()
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [latitude, longitude])

  return <div ref={containerRef} className="h-[400px] rounded-xl border border-gray-200" />
}
