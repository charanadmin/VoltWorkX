"use client"

import { useRef, useState, useCallback } from "react"
import { Plus } from "lucide-react"
import type { ComponentItem } from "@/lib/components-data"

export interface PlacedComponent {
  id: string
  componentId: string
  name: string
  value?: string
  category: string
  x: number
  y: number
  badge?: string
}

interface CanvasProps {
  placedComponents: PlacedComponent[]
  setPlacedComponents: React.Dispatch<React.SetStateAction<PlacedComponent[]>>
  selectedId: string | null
  setSelectedId: (id: string | null) => void
  draggedComponent: ComponentItem | null
}

export function Canvas({
  placedComponents,
  setPlacedComponents,
  selectedId,
  setSelectedId,
  draggedComponent,
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [draggedPlacedId, setDraggedPlacedId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (!draggedComponent || !canvasRef.current) return

      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left - 60
      const y = e.clientY - rect.top - 30

      const newPlaced: PlacedComponent = {
        id: `${draggedComponent.id}-${Date.now()}`,
        componentId: draggedComponent.id,
        name: draggedComponent.name,
        value: draggedComponent.value,
        category: draggedComponent.category,
        badge: draggedComponent.badge,
        x: Math.max(0, Math.round(x / 24) * 24),
        y: Math.max(0, Math.round(y / 24) * 24),
      }

      setPlacedComponents((prev) => [...prev, newPlaced])
      setSelectedId(newPlaced.id)
    },
    [draggedComponent, setPlacedComponents, setSelectedId]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedId(null)
    }
  }

  const handleComponentMouseDown = (
    e: React.MouseEvent,
    comp: PlacedComponent
  ) => {
    e.stopPropagation()
    setSelectedId(comp.id)
    setDraggedPlacedId(comp.id)
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggedPlacedId || !canvasRef.current) return

      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left - dragOffset.x
      const y = e.clientY - rect.top - dragOffset.y

      setPlacedComponents((prev) =>
        prev.map((comp) =>
          comp.id === draggedPlacedId
            ? {
                ...comp,
                x: Math.max(0, Math.round(x / 24) * 24),
                y: Math.max(0, Math.round(y / 24) * 24),
              }
            : comp
        )
      )
    },
    [draggedPlacedId, dragOffset, setPlacedComponents]
  )

  const handleMouseUp = () => {
    setDraggedPlacedId(null)
  }

  return (
    <div
      ref={canvasRef}
      className="flex-1 bg-[#000000] dot-grid relative overflow-hidden"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={handleCanvasClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Empty state */}
      {placedComponents.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="w-12 h-12 flex items-center justify-center mb-4">
            <Plus size={48} className="text-[rgba(255,255,255,0.1)]" strokeWidth={1} />
          </div>
          <p className="text-[14px] font-mono text-[rgba(255,255,255,0.2)] mb-2">
            Drag components to begin
          </p>
          <p className="text-[12px] font-mono text-[rgba(255,255,255,0.15)]">
            or press <kbd className="px-1.5 py-0.5 bg-[#111111] border border-[rgba(255,255,255,0.1)] mx-1">Space</kbd> to quick-add
          </p>
        </div>
      )}

      {/* Placed components */}
      {placedComponents.map((comp) => (
        <div
          key={comp.id}
          onMouseDown={(e) => handleComponentMouseDown(e, comp)}
          className={`absolute bg-[#111111] border transition-all cursor-move select-none ${
            selectedId === comp.id
              ? "border-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.3)]"
              : "border-[rgba(255,255,255,0.12)] hover:border-[rgba(255,255,255,0.25)]"
          }`}
          style={{
            left: comp.x,
            top: comp.y,
            minWidth: 120,
          }}
        >
          <div className="px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-mono font-bold text-white truncate">
                {comp.name}
              </span>
              {comp.badge && (
                <span className="text-[9px] font-sans uppercase bg-[rgba(0,240,255,0.1)] text-[#00f0ff] px-1 py-0.5">
                  {comp.badge}
                </span>
              )}
            </div>
            {comp.value && (
              <div className="text-[10px] font-mono text-[rgba(255,255,255,0.4)] mt-1">
                {comp.value}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
