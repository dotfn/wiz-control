import React from 'react';

export const Titlebar: React.FC = () => {
  return (
    <div
      data-tauri-drag-region
      className="absolute top-0 left-0 right-0 h-12 bg-[#1c1c1e]/70 border-b border-white/[0.04] backdrop-blur-xl flex items-center justify-between px-5 select-none z-50 text-xs font-sans text-[#a5a5a7]"
    >
      {/* Spacer for native macOS Traffic Lights */}
      <div className="w-[72px]" />

      {/* App Centered Title */}
      <div data-tauri-drag-region className="absolute left-1/2 -translate-x-1/2 font-sans font-semibold text-[#e1e1e6] tracking-wide pointer-events-none text-[11px]">
        WiZ Control
      </div>

      {/* Spacer for symmetry */}
      <div className="w-16" />
    </div>
  );
};
