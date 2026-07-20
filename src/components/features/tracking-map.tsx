'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { ArmadaAktif } from '@/types'
import { Truck } from 'lucide-react'

interface TrackingMapProps {
  armada?: ArmadaAktif[]
  loading?: boolean
  fullscreen?: boolean
  center?: [number, number]
  zoom?: number
}

const defaultCenter: [number, number] = [-6.2088, 106.8456]

export function TrackingMap({ armada = [], loading, fullscreen, center = defaultCenter, zoom = 12 }: TrackingMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<L.Marker[]>([])

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    mapRef.current = L.map(mapContainerRef.current).setView(center, zoom)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(mapRef.current)
  }, [center, zoom])

  useEffect(() => {
    if (!mapRef.current) return

    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    armada.forEach((a) => {
      if (!a.latitude || !a.longitude) return

      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background:#16A34A;color:white;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:16px;">🚛</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      })

      const marker = L.marker([a.latitude, a.longitude], { icon }).addTo(mapRef.current!)

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

    if (armada.length > 0) {
      const group = L.featureGroup(markersRef.current)
      mapRef.current.fitBounds(group.getBounds().pad(0.1))
    }
  }, [armada])

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  if (loading) {
    return (
      <Card className={fullscreen ? 'h-full' : ''}>
        <Skeleton className={fullscreen ? 'h-full min-h-[600px]' : 'h-[400px]'} />
      </Card>
    )
  }

  return (
    <div
      ref={mapContainerRef}
      className={`rounded-xl border border-gray-200 ${fullscreen ? 'h-full min-h-[600px]' : 'h-[400px]'}`}
    />
  )
}
