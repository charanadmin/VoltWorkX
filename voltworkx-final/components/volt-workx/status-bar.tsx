"use client"

interface StatusBarProps {
  componentCount: number
  connectionCount: number
  isSimulating: boolean
}

export function StatusBar({
  componentCount,
  connectionCount,
  isSimulating,
}: StatusBarProps) {
  return (
    <footer className="h-8 bg-[#000000] border-t border-[rgba(255,255,255,0.06)] flex items-center px-4 shrink-0">
      {/* Left */}
      <div className="flex-1">
        <span className="text-[11px] font-mono text-[rgba(255,255,255,0.3)]">
          VOLTWORKX v1.0
        </span>
      </div>

      {/* Center */}
      <div className="flex items-center gap-4">
        <span className="text-[11px] font-mono text-[rgba(255,255,255,0.3)]">
          <span
            className={`inline-block w-2 h-2 rounded-full mr-2 ${
              isSimulating
                ? "bg-[#00ff88] status-pulse"
                : "bg-[#ff9500]"
            }`}
          />
          {componentCount} Components | {connectionCount} Connections | Simulation:{" "}
          {isSimulating ? (
            <span className="text-[#00ff88]">RUNNING</span>
          ) : (
            <span className="text-[#ff9500]">IDLE</span>
          )}
        </span>
      </div>

      {/* Right */}
      <div className="flex-1 text-right">
        <span className="text-[11px] font-mono text-[rgba(255,255,255,0.3)]">
          <kbd className="px-1 py-0.5 bg-[#111111] border border-[rgba(255,255,255,0.1)] mx-0.5">W</kbd> Wire
          <span className="mx-2">|</span>
          <kbd className="px-1 py-0.5 bg-[#111111] border border-[rgba(255,255,255,0.1)] mx-0.5">V</kbd> Select
          <span className="mx-2">|</span>
          <kbd className="px-1 py-0.5 bg-[#111111] border border-[rgba(255,255,255,0.1)] mx-0.5">Del</kbd> Delete
          <span className="mx-2">|</span>
          <kbd className="px-1 py-0.5 bg-[#111111] border border-[rgba(255,255,255,0.1)] mx-0.5">Space</kbd> Simulate
        </span>
      </div>
    </footer>
  )
}
