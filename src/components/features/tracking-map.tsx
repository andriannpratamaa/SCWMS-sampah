'use client'

import { useEffect, useRef, useState } from 'react'
import type { ArmadaAktif } from '@/types'

interface TrackingMapProps {
  armada?: ArmadaAktif[]
  loading?: boolean
  fullscreen?: boolean
  center?: [number, number]
  zoom?: number
}

const defaultCenter: [number, number] = [-6.2088, 106.8456]

async function getLeaflet() {
  if (typeof window !== 'undefined' && (window as Record<string, unknown>).L) {
    return (window as Record<string, unknown>).L as typeof L
  }
  const mod = await import('leaflet')
  return mod.default
}

export function TrackingMap({ armada = [], loading, fullscreen, center = defaultCenter, zoom = 12 }: TrackingMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const [ready, setReady] = useState(false)

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

      const map = L.map(container, { zoomControl: true }).setView(center, zoom)
      mapRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      ro = new ResizeObserver(() => map.invalidateSize())
      ro.observe(container)

      requestAnimationFrame(() => {
        if (cancelled) return
        map.invalidateSize()
        setReady(true)
      })
    })()

    return () => {
      cancelled = true
      if (ro) ro.disconnect()
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [center, zoom])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return

    ;(async () => {
      const L = await getLeaflet()

      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []

      armada.forEach((a) => {
        if (a.latitude == null || a.longitude == null || isNaN(a.latitude) || isNaN(a.longitude)) return

        const marker = L.marker([a.latitude, a.longitude], {
          icon: L.divIcon({
            html: '<div style="background:#16A34A;color:white;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:16px;">🚛</div>',
            iconSize: [36, 36],
            iconAnchor: [18, 18],
            className: '',
          }),
        }).addTo(map)

        marker.bindPopup(`
          <div style="font-family:system-ui;min-width:200px">
            <p style="font-weight:600;margin:0 0 4px;color:#111">${a.plat_nomor}</p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:4px 0"/>
            <p style="margin:2px 0;font-size:13px;color:#555">👤 ${a.sopir_nama}</p>
            <p style="margin:2px 0;font-size:13px;color:#555">📦 ${a.volume_sampah} m³</p>
            <p style="margin:2px 0;font-size:13px;color:#555">🕐 ${a.update_terakhir}</p>
            <p style="margin:2px 0;font-size:13px;color:#555">📍 ${a.latitude}, ${a.longitude}</p>
          </div>
        `)

        markersRef.current.push(marker)
      })

      if (markersRef.current.length > 0) {
        const group = L.featureGroup(markersRef.current)
        map.fitBounds(group.getBounds().pad(0.1))
      }

      requestAnimationFrame(() => map.invalidateSize())
    })()
  }, [armada, ready])

  return (
    <div className={`relative rounded-xl overflow-hidden ${fullscreen ? 'h-full min-h-[600px]' : 'h-[400px]'}`}>
      <div
        ref={containerRef}
        className="absolute inset-0 rounded-xl border border-gray-200"
      />
      {(!ready || loading) && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-400">Memuat peta...</p>
          </div>
        </div>
      )}
    </div>
  )
}
