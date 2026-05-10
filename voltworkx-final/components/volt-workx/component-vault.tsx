"use client"

import { useState, useMemo } from "react"
import { Search, X, ChevronDown, ChevronRight, AlertTriangle } from "lucide-react"
import { componentsData, type ComponentItem } from "@/lib/components-data"

const filterTabs = ["All", "Passives", "ICs", "MCU", "Sensors"]

interface ComponentVaultProps {
  onDragStart: (component: ComponentItem) => void
  selectedComponentId: string | null
  onSelectComponent: (component: ComponentItem) => void
}

export function ComponentVault({
  onDragStart,
  selectedComponentId,
  onSelectComponent,
}: ComponentVaultProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("All")
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())

  const toggleCategory = (categoryId: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  const filteredData = useMemo(() => {
    let data = componentsData

    if (activeFilter !== "All") {
      const filterMap: Record<string, string[]> = {
        Passives: ["passives"],
        ICs: ["semiconductors"],
        MCU: ["microcontrollers"],
        Sensors: ["sensors"],
      }
      const categoryIds = filterMap[activeFilter] || []
      data = data.filter((cat) => categoryIds.includes(cat.id))
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      data = data
        .map((cat) => ({
          ...cat,
          components: cat.components.filter(
            (comp) =>
              comp.name.toLowerCase().includes(query) ||
              comp.value?.toLowerCase().includes(query) ||
              comp.badge?.toLowerCase().includes(query)
          ),
        }))
        .filter((cat) => cat.components.length > 0)
    }

    return data
  }, [searchQuery, activeFilter])

  const highlightMatch = (text: string) => {
    if (!searchQuery.trim()) return text
    const query = searchQuery.toLowerCase()
    const index = text.toLowerCase().indexOf(query)
    if (index === -1) return text
    return (
      <>
        {text.slice(0, index)}
        <span className="text-[#00f0ff] bg-[rgba(0,240,255,0.15)]">
          {text.slice(index, index + query.length)}
        </span>
        {text.slice(index + query.length)}
      </>
    )
  }

  const totalComponents = componentsData.reduce((acc, cat) => acc + cat.components.length, 0)

  return (
    <aside className="w-[280px] bg-[#000000] border-r border-[rgba(255,255,255,0.06)] flex flex-col shrink-0">
      {/* Search bar */}
      <div className="h-10 border-b border-[rgba(255,255,255,0.06)] px-3 flex items-center gap-2">
        <Search size={14} className="text-[rgba(255,255,255,0.25)]" />
        <input
          type="text"
          placeholder={`Search ${totalComponents}+ components...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent text-[13px] font-mono text-white/80 placeholder:text-[rgba(255,255,255,0.25)] outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-[rgba(255,255,255,0.4)] hover:text-white"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="h-9 border-b border-[rgba(255,255,255,0.06)] px-2 flex items-center gap-1 overflow-x-auto">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-3 py-1 text-[11px] font-sans whitespace-nowrap transition-colors ${
              activeFilter === tab
                ? "text-[#00f0ff] border-b-2 border-[#00f0ff]"
                : "text-[rgba(255,255,255,0.4)] hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Component list */}
      <div className="flex-1 overflow-y-auto">
        {filteredData.map((category) => (
          <div key={category.id}>
            {/* Category header */}
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full h-8 px-3 flex items-center gap-2 bg-[#0a0a0a] border-b border-[rgba(255,255,255,0.06)] hover:bg-[#111111] transition-colors"
            >
              {collapsedCategories.has(category.id) ? (
                <ChevronRight size={12} className="text-[rgba(255,255,255,0.25)]" />
              ) : (
                <ChevronDown size={12} className="text-[rgba(255,255,255,0.25)]" />
              )}
              <span className="text-[11px] font-sans uppercase tracking-widest text-[rgba(255,255,255,0.25)]">
                {category.icon} {category.name}
              </span>
              <span className="text-[10px] font-mono text-[rgba(255,255,255,0.15)] ml-auto">
                ({category.components.length})
              </span>
            </button>

            {/* Components */}
            {!collapsedCategories.has(category.id) && (
              <div>
                {category.components.map((component) => (
                  <div
                    key={component.id}
                    draggable
                    onDragStart={() => onDragStart(component)}
                    onClick={() => onSelectComponent(component)}
                    className={`h-9 flex items-center gap-2 px-3 cursor-grab active:cursor-grabbing transition-colors border-l-2 ${
                      selectedComponentId === component.id
                        ? "bg-[rgba(0,240,255,0.06)]"
                        : "hover:bg-[rgba(255,255,255,0.04)]"
                    }`}
                    style={{
                      borderLeftColor:
                        selectedComponentId === component.id
                          ? "#00f0ff"
                          : component.borderColor || "transparent",
                    }}
                  >
                    {/* Component name */}
                    <span className="flex-1 text-[13px] text-[rgba(255,255,255,0.8)] truncate">
                      {highlightMatch(component.name)}
                    </span>

                    {/* Polarity warning */}
                    {component.polarityWarning && (
                      <AlertTriangle size={12} className="text-[#ff9500] shrink-0" />
                    )}

                    {/* Badge */}
                    {component.badge && (
                      <span className="text-[10px] font-sans uppercase bg-[rgba(0,240,255,0.1)] text-[#00f0ff] px-1.5 py-0.5 shrink-0">
                        {component.badge}
                      </span>
                    )}

                    {/* Value */}
                    {component.value && (
                      <span className="text-[11px] font-mono text-[rgba(255,255,255,0.4)] shrink-0">
                        {component.value}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {filteredData.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-[13px] font-mono text-[rgba(255,255,255,0.25)]">
              No components found
            </p>
          </div>
        )}
      </div>
    </aside>
  )
}
