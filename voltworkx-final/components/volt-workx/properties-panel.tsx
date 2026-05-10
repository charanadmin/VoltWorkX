"use client"

import { Trash2, FileText, ShoppingCart, ChevronDown } from "lucide-react"
import type { PlacedComponent } from "./canvas"

interface PropertiesPanelProps {
  selectedComponent: PlacedComponent | null
  onDelete: () => void
  onUpdateComponent: (updates: Partial<PlacedComponent>) => void
}

export function PropertiesPanel({
  selectedComponent,
  onDelete,
  onUpdateComponent,
}: PropertiesPanelProps) {
  if (!selectedComponent) {
    return (
      <aside className="w-[260px] bg-[#000000] border-l border-[rgba(255,255,255,0.06)] flex flex-col shrink-0">
        <div className="h-10 border-b border-[rgba(255,255,255,0.06)] px-4 flex items-center">
          <span className="text-[11px] font-sans uppercase tracking-widest text-[rgba(255,255,255,0.25)]">
            PROPERTIES
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[13px] font-mono text-[rgba(255,255,255,0.2)]">
            No component selected
          </p>
        </div>
      </aside>
    )
  }

  const Section = ({
    title,
    children,
  }: {
    title: string
    children: React.ReactNode
  }) => (
    <div className="border-b border-[rgba(255,255,255,0.06)]">
      <div className="h-7 px-4 flex items-center bg-[#0a0a0a]">
        <span className="text-[10px] font-sans uppercase tracking-widest text-[rgba(255,255,255,0.3)]">
          {title}
        </span>
      </div>
      <div className="p-3 space-y-2">{children}</div>
    </div>
  )

  const Field = ({
    label,
    value,
    suffix,
    type = "text",
    onChange,
  }: {
    label: string
    value: string | number
    suffix?: string
    type?: string
    onChange?: (val: string) => void
  }) => (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-[rgba(255,255,255,0.5)] w-20 shrink-0">
        {label}:
      </span>
      <div className="flex-1 flex items-center gap-1">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="flex-1 h-7 bg-[#111111] border border-[rgba(255,255,255,0.1)] px-2 text-[12px] font-mono text-white outline-none focus:border-[rgba(0,240,255,0.35)]"
        />
        {suffix && (
          <span className="text-[11px] font-mono text-[rgba(255,255,255,0.4)]">
            {suffix}
          </span>
        )}
      </div>
    </div>
  )

  const SelectField = ({
    label,
    value,
    options,
  }: {
    label: string
    value: string
    options: string[]
  }) => (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-[rgba(255,255,255,0.5)] w-20 shrink-0">
        {label}:
      </span>
      <div className="flex-1 relative">
        <select
          value={value}
          className="w-full h-7 bg-[#111111] border border-[rgba(255,255,255,0.1)] px-2 text-[12px] font-mono text-white outline-none appearance-none focus:border-[rgba(0,240,255,0.35)]"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown
          size={12}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.4)] pointer-events-none"
        />
      </div>
    </div>
  )

  return (
    <aside className="w-[260px] bg-[#000000] border-l border-[rgba(255,255,255,0.06)] flex flex-col shrink-0">
      {/* Header */}
      <div className="h-10 border-b border-[rgba(255,255,255,0.06)] px-4 flex items-center">
        <span className="text-[11px] font-sans uppercase tracking-widest text-[rgba(255,255,255,0.25)]">
          PROPERTIES
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <Section title="COMPONENT">
          <Field label="Name" value={selectedComponent.name} />
          <Field label="Category" value={selectedComponent.category} />
          <Field label="Footprint" value="Through-hole" />
        </Section>

        <Section title="PARAMETERS">
          <Field
            label="Value"
            value={selectedComponent.value?.replace(/[^\d.]/g, "") || "0"}
            suffix={selectedComponent.value?.replace(/[\d.]/g, "") || ""}
            type="number"
          />
          <SelectField
            label="Tolerance"
            value="±5%"
            options={["±1%", "±5%", "±10%", "±20%"]}
          />
          <Field label="Power" value="0.25" suffix="W" type="number" />
        </Section>

        <Section title="POSITION">
          <div className="flex gap-2">
            <div className="flex-1">
              <Field
                label="X"
                value={selectedComponent.x}
                suffix="px"
                type="number"
                onChange={(val) => onUpdateComponent({ x: parseInt(val) || 0 })}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Field
                label="Y"
                value={selectedComponent.y}
                suffix="px"
                type="number"
                onChange={(val) => onUpdateComponent({ y: parseInt(val) || 0 })}
              />
            </div>
          </div>
          <Field label="Rotation" value="0" suffix="°" type="number" />
        </Section>

        <Section title="DATASHEET">
          <button className="w-full h-8 flex items-center justify-center gap-2 border border-[rgba(255,255,255,0.1)] text-[12px] text-[rgba(255,255,255,0.6)] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-colors">
            <FileText size={14} />
            View Datasheet
          </button>
          <button className="w-full h-8 flex items-center justify-center gap-2 border border-[rgba(255,255,255,0.1)] text-[12px] text-[rgba(255,255,255,0.6)] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-colors">
            <ShoppingCart size={14} />
            Buy from Robu.in
          </button>
          <button className="w-full h-8 flex items-center justify-center gap-2 border border-[rgba(255,255,255,0.1)] text-[12px] text-[rgba(255,255,255,0.6)] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-colors">
            <ShoppingCart size={14} />
            Buy from MakerBazar
          </button>
        </Section>
      </div>

      {/* Delete button */}
      <div className="p-3 border-t border-[rgba(255,255,255,0.06)]">
        <button
          onClick={onDelete}
          className="w-full h-9 flex items-center justify-center gap-2 border border-[#ff0044] text-[#ff0044] text-[12px] font-sans hover:bg-[rgba(255,0,68,0.1)] transition-colors"
        >
          <Trash2 size={14} />
          Delete Component
        </button>
      </div>
    </aside>
  )
}
