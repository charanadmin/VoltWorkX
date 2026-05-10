"use client"

import { useState } from "react"
import {
  Plus,
  FolderOpen,
  Save,
  Undo2,
  Redo2,
  Share2,
  Download,
  Play,
  Square,
} from "lucide-react"

interface NavbarProps {
  projectName: string
  setProjectName: (name: string) => void
  isModified: boolean
  isSimulating: boolean
  setIsSimulating: (sim: boolean) => void
}

export function Navbar({
  projectName,
  setProjectName,
  isModified,
  isSimulating,
  setIsSimulating,
}: NavbarProps) {
  const [isFocused, setIsFocused] = useState(false)

  const ToolButton = ({
    icon: Icon,
    label,
  }: {
    icon: React.ElementType
    label: string
  }) => (
    <button
      className="h-8 px-3 flex items-center gap-2 text-[rgba(255,255,255,0.4)] hover:text-white hover:bg-[rgba(255,255,255,0.04)] transition-colors font-sans text-[13px]"
      title={label}
    >
      <Icon size={16} strokeWidth={1.5} />
      <span className="hidden xl:inline">{label}</span>
    </button>
  )

  return (
    <header className="h-12 bg-[#000000] border-b border-[rgba(255,255,255,0.06)] flex items-center px-4 shrink-0">
      {/* Left section */}
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-1 mr-4">
          <span className="text-lg">⚡</span>
          <span className="font-bold text-white tracking-tight">VOLT</span>
          <span className="font-bold text-[#00f0ff] tracking-tight">WORKX</span>
        </div>

        <div className="w-px h-5 bg-[rgba(255,255,255,0.1)] mx-2" />

        <ToolButton icon={Plus} label="New" />
        <ToolButton icon={FolderOpen} label="Open" />
        <ToolButton icon={Save} label="Save" />
        <div className="w-px h-5 bg-[rgba(255,255,255,0.1)] mx-1" />
        <ToolButton icon={Undo2} label="Undo" />
        <ToolButton icon={Redo2} label="Redo" />
      </div>

      {/* Center section */}
      <div className="flex-1 flex justify-center items-center gap-2">
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`bg-transparent text-center font-mono text-[13px] text-white/80 outline-none px-2 py-1 min-w-[180px] ${
            isFocused ? "border-b border-[#00f0ff]" : "border-b border-transparent"
          }`}
        />
        {isModified && (
          <div className="w-2 h-2 rounded-full bg-[#ff9500]" title="Unsaved changes" />
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        <button className="h-8 px-4 border border-[rgba(255,255,255,0.2)] text-white/80 hover:text-white hover:border-white/40 transition-colors font-sans text-[13px] flex items-center gap-2">
          <Share2 size={14} strokeWidth={1.5} />
          Share
        </button>
        <button className="h-8 px-4 border border-[rgba(255,255,255,0.2)] text-white/80 hover:text-white hover:border-white/40 transition-colors font-sans text-[13px] flex items-center gap-2">
          <Download size={14} strokeWidth={1.5} />
          Export
        </button>
        <button
          onClick={() => setIsSimulating(!isSimulating)}
          className={`h-8 px-4 font-bold text-[13px] flex items-center gap-2 transition-all ${
            isSimulating
              ? "bg-[#00ff88] text-black pulse-glow"
              : "bg-[#00f0ff] text-black hover:brightness-110 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]"
          }`}
        >
          {isSimulating ? (
            <>
              <Square size={14} strokeWidth={2} fill="currentColor" />
              Halt Simulation
            </>
          ) : (
            <>
              <Play size={14} strokeWidth={2} fill="currentColor" />
              Initialize Simulation
            </>
          )}
        </button>
      </div>
    </header>
  )
}
