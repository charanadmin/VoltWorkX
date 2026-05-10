"use client"

import { useState, useCallback } from "react"
import { Navbar } from "@/components/volt-workx/navbar"
import { ComponentVault } from "@/components/volt-workx/component-vault"
import Workbench3D, { type PlacedComponent3D } from "@/components/volt-workx/workbench-3d"
import { PropertiesPanel } from "@/components/volt-workx/properties-panel"
import { StatusBar } from "@/components/volt-workx/status-bar"
import type { ComponentItem } from "@/lib/components-data"

// Maps sidebar component IDs → 3D model types
const COMPONENT_TYPE_MAP: Record<string, PlacedComponent3D["type"]> = {
  // Resistors → resistor
  "res-1k": "resistor", "res-10k": "resistor", "res-100": "resistor",
  "res-220": "resistor", "res-470": "resistor", "pot-10k": "resistor",
  "trim-500": "resistor", "ntc-10k": "resistor", "ptc": "resistor",
  "ldr": "resistor", "mov": "resistor", "ferrite": "resistor",
  // Capacitors → capacitor
  "cap-100n": "capacitor", "cap-10u": "capacitor", "cap-100u": "capacitor",
  "cap-1000u": "capacitor", "cap-10p": "capacitor", "tant-10u": "capacitor",
  "supercap-1f": "capacitor",
  // LEDs → led
  "led-red": "led", "led-green": "led", "led-blue": "led",
  "led-yellow": "led", "led-white": "led", "led-ir": "led",
  "led-uv": "led", "led-rgb": "led", "ws2812b": "led",
  "ws2812b-strip": "led",
  // Transistors → npn-transistor
  "npn-2n2222": "npn-transistor", "npn-bc547": "npn-transistor",
  "pnp-bc557": "npn-transistor", "pnp-2n3906": "npn-transistor",
  // Arduino boards → arduino-uno
  "arduino-uno-r3": "arduino-uno", "arduino-nano": "arduino-uno",
  "arduino-mega": "arduino-uno", "arduino-leo": "arduino-uno",
  "arduino-micro": "arduino-uno", "arduino-due": "arduino-uno",
  "arduino-promini-5v": "arduino-uno", "arduino-promini-33v": "arduino-uno",
  // Breadboard → breadboard
  "breadboard-full": "breadboard", "breadboard-half": "breadboard",
  "breadboard-mini": "breadboard",
  // Batteries → battery-9v
  "batt-9v": "battery-9v", "batt-aa-2x": "battery-9v",
  "batt-aa-4x": "battery-9v", "lipo-3v7-1000": "battery-9v",
  "lipo-3v7-2000": "battery-9v", "cell-18650": "battery-9v",
  "coin-cr2032": "battery-9v",
  // Switches → switch
  "sw-pushbutton": "switch", "sw-toggle": "switch",
  "sw-slide": "switch", "sw-dip4": "switch",
}

// Maps LED sidebar IDs → colors
const LED_COLOR_MAP: Record<string, string> = {
  "led-red": "#ff0000", "led-green": "#00ff00", "led-blue": "#0044ff",
  "led-yellow": "#ffff00", "led-white": "#ffffff", "led-ir": "#4400ff",
  "led-uv": "#8800ff", "led-rgb": "#ff00ff", "ws2812b": "#00ffff",
  "ws2812b-strip": "#ff8800",
}

// Converts PlacedComponent3D to a shape PropertiesPanel can display
function toDisplayComponent(c: PlacedComponent3D) {
  return {
    id: c.id,
    componentId: c.type,
    name: c.name ?? c.type,
    value: c.value,
    category: c.category ?? "",
    badge: undefined,
    x: Math.round(c.position[0] * 10),
    y: Math.round(c.position[2] * 10),
  }
}

export default function VoltWorkX() {
  const [projectName, setProjectName] = useState("Untitled Project")
  const [isModified, setIsModified] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)
  const [placedComponents, setPlacedComponents] = useState<PlacedComponent3D[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isPlacingComponent, setIsPlacingComponent] = useState<string | null>(null)
  const [pendingItem, setPendingItem] = useState<ComponentItem | null>(null)

  // Called when user clicks a component in the sidebar
  const handleDragStart = useCallback((component: ComponentItem) => {
    const type3d = COMPONENT_TYPE_MAP[component.id]
    if (!type3d) {
      // fallback: default to resistor for unmapped components
      setIsPlacingComponent("resistor")
    } else {
      setIsPlacingComponent(type3d)
    }
    setPendingItem(component)
  }, [])

  // Called when user clicks on the 3D canvas to place
  const handlePlaceComponent = useCallback(
    (type: string, position: [number, number, number]) => {
      const item = pendingItem
      const newComp: PlacedComponent3D = {
        id: `${type}-${Date.now()}`,
        type: type as PlacedComponent3D["type"],
        position,
        selected: false,
        powered: false,
        color: item ? LED_COLOR_MAP[item.id] ?? "#ff0000" : "#ff0000",
        name: item?.name ?? type,
        value: item?.value,
        category: item?.category ?? "",
      }
      setPlacedComponents((prev) => [
        ...prev.map((c) => ({ ...c, selected: false })),
        { ...newComp, selected: true },
      ])
      setSelectedId(newComp.id)
      setIsPlacingComponent(null)
      setPendingItem(null)
      setIsModified(true)
    },
    [pendingItem],
  )

  const handleSelectComponent = useCallback((id: string | null) => {
    setSelectedId(id)
    setPlacedComponents((prev) =>
      prev.map((c) => ({ ...c, selected: c.id === id })),
    )
  }, [])

  const handleCancelPlacement = useCallback(() => {
    setIsPlacingComponent(null)
    setPendingItem(null)
  }, [])

  const handleDeleteComponent = useCallback(() => {
    if (!selectedId) return
    setPlacedComponents((prev) => prev.filter((c) => c.id !== selectedId))
    setSelectedId(null)
    setIsModified(true)
  }, [selectedId])

  const handleUpdateComponent = useCallback(
    (updates: Record<string, unknown>) => {
      if (!selectedId) return
      setPlacedComponents((prev) =>
        prev.map((c) => (c.id === selectedId ? { ...c, ...updates } : c)),
      )
      setIsModified(true)
    },
    [selectedId],
  )

  const selectedComponent = placedComponents.find((c) => c.id === selectedId) ?? null
  const displaySelected = selectedComponent ? toDisplayComponent(selectedComponent) : null

  return (
    <div className="h-screen w-screen flex flex-col bg-[#000000] overflow-hidden">
      {/* Cursor hint when placing */}
      {isPlacingComponent && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#000000] border border-[#00f0ff] px-4 py-1.5 text-[12px] font-mono text-[#00f0ff] pointer-events-none">
          Click on canvas to place · Esc to cancel
        </div>
      )}

      <Navbar
        projectName={projectName}
        setProjectName={(name) => { setProjectName(name); setIsModified(true) }}
        isModified={isModified}
        isSimulating={isSimulating}
        setIsSimulating={setIsSimulating}
      />

      <div className="flex-1 flex overflow-hidden">
        <div className="hidden md:flex">
          <ComponentVault
            onDragStart={handleDragStart}
            selectedComponentId={null}
            onSelectComponent={handleDragStart}
          />
        </div>

        {/* 3D Canvas */}
        <div
          className="flex-1 relative"
          style={{ cursor: isPlacingComponent ? "crosshair" : "default" }}
        >
          <Workbench3D
            placedComponents={placedComponents}
            onSelectComponent={handleSelectComponent}
            onPlaceComponent={handlePlaceComponent}
            onCancelPlacement={handleCancelPlacement}
            isPlacingComponent={isPlacingComponent}
            isSimulating={isSimulating}
          />
        </div>

        <div className="hidden lg:flex">
          <PropertiesPanel
            selectedComponent={displaySelected as any}
            onDelete={handleDeleteComponent}
            onUpdateComponent={handleUpdateComponent as any}
          />
        </div>
      </div>

      <StatusBar
        componentCount={placedComponents.length}
        connectionCount={0}
        isSimulating={isSimulating}
      />
    </div>
  )
}
