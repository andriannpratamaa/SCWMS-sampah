'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface DetailMapProps {
  latitude: number
  longitude: number
}

export default function DetailMap({ latitude, longitude }: DetailMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    mapRef.current = L.map(containerRef.current).setView([latitude, longitude], 15)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(mapRef.current)

    const icon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="background:#16A34A;color:white;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">📍</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    })

    L.marker([latitude, longitude], { icon })
      .addTo(mapRef.current)
      .bindPopup(`Lat: ${latitude}<br/>Lng: ${longitude}`)

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [latitude, longitude])

  return <div ref={containerRef} className="h-[400px] rounded-xl border border-gray-200" />
}
