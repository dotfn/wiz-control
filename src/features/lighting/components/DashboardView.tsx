import React from 'react';
import { LightState } from '../../../types';
import { LightController } from './LightController';
import { rgbToHex, getLampRgbColor } from '../../../utils/color';
import { PRESET_SCENES } from '../../../data/scenes';
import { Power, Sparkles } from 'lucide-react';

interface DashboardViewProps {
  lampState: LightState;
  isConnected: boolean;
  setLampState: (updates: Partial<LightState>) => Promise<void>;
  circadianActive: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  lampState,
  isConnected,
  setLampState,
  circadianActive,
}) => {
  const rgb = getLampRgbColor(lampState);

  const currentRgbString = () => {
    if (lampState.state && lampState.sceneId !== undefined) {
      const scene = PRESET_SCENES.find((s) => s.id === lampState.sceneId);
      if (scene) return scene.colors[0];
    }
    return `rgb(${rgb.join(',')})`;
  };

  const getModeLabel = () => {
    if (!lampState.state) return 'Apagado';
    if (lampState.sceneId !== undefined) {
      const scene = PRESET_SCENES.find((s) => s.id === lampState.sceneId);
      return `Escena: ${scene?.name || 'Personalizada'}`;
    }
    if (lampState.temp !== undefined) return `Blanco · ${lampState.temp}K`;
    if (lampState.r !== undefined && lampState.g !== undefined && lampState.b !== undefined) {
      return `Color: ${rgbToHex(lampState.r, lampState.g, lampState.b).toUpperCase()}`;
    }
    return 'Luz encendida';
  };

  const handlePower = () => setLampState({ state: !lampState.state });

  const handleBrightnessInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLampState({ dimming: parseInt(e.target.value, 10) });
  };

  return (
    <div className="flex flex-col gap-4 animate-fade-in">

      {/* Hero Card — orb + state + primary controls */}
      <div className="glass-card flex items-center gap-6 p-5">

        {/* Orb */}
        <div className="flex-shrink-0 flex items-center justify-center">
          <div
            className={`w-24 h-24 rounded-full border transition-all duration-700 ${
              lampState.state ? 'animate-breathe' : ''
            }`}
            style={{
              background: lampState.state
                ? `radial-gradient(circle at 38% 32%, ${currentRgbString()} 0%, rgba(var(--glow-color), 0.3) 60%, rgba(255,255,255,0.01) 100%)`
                : 'radial-gradient(circle at 38% 32%, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
              borderColor: lampState.state ? currentRgbString() : 'var(--border-color)',
              boxShadow: lampState.state
                ? `0 0 calc((20px + 40px * var(--glow-strength)) * var(--glow-strength-multiplier, 1.0)) calc((2px + 10px * var(--glow-strength)) * var(--glow-strength-multiplier, 1.0)) rgba(var(--glow-color), 0.4)`
                : 'none',
            }}
          />
        </div>

        {/* Right: state info + controls */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">

          {/* Status row */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`text-base font-bold tracking-tight transition-colors ${lampState.state ? 'text-theme-text' : 'text-theme-textSecondary'}`}>
              {lampState.state ? 'Encendida' : 'Apagada'}
            </span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
              isConnected
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                : 'bg-red-500/10 text-red-400 border-red-500/25'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
              {isConnected ? 'En línea' : 'Desconectada'}
            </span>
            {circadianActive && (
              <span className="text-[10px] bg-blue-500/15 text-blue-500 border border-blue-500/30 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                Circadiano
              </span>
            )}
          </div>

          {/* Mode label */}
          <p className="text-xs text-theme-textSecondary font-medium truncate">
            {getModeLabel()}
          </p>

          {/* Power + brightness row */}
          <div className="flex items-center gap-4">
            <button
              onClick={handlePower}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all duration-200 active:scale-95 ${
                lampState.state
                  ? 'bg-theme-green border-transparent text-white shadow-[0_2px_8px_rgba(52,199,89,0.25)]'
                  : 'bg-theme-input border-theme-border text-theme-textSecondary hover:opacity-85'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              {lampState.state ? 'Apagar' : 'Encender'}
            </button>
            <div className="flex-1 flex items-center gap-3 min-w-0">
              <span className="text-[11px] font-mono text-theme-textSecondary flex-shrink-0">
                {lampState.dimming}%
              </span>
              <input
                type="range"
                min="10"
                max="100"
                value={lampState.dimming}
                onChange={handleBrightnessInput}
                className="flex-1"
                aria-label={`Brillo: ${lampState.dimming}%`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom grid — color controls + readout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Color / White mode controls */}
        <div className="glass-card">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-theme-textSecondary border-b border-theme-border pb-2 mb-4">
            Modo de color
          </div>
          <LightController
            state={lampState}
            onStateChange={setLampState}
            hidePowerAndBrightness
          />
        </div>

        {/* Readout stats */}
        <div className="glass-card">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-theme-textSecondary border-b border-theme-border pb-2 mb-4">
            Estado
          </div>
          <div className="space-y-0">
            {[
              { label: 'Brillo', value: lampState.state ? `${lampState.dimming}%` : '—' },
              { label: 'Temperatura', value: lampState.state && lampState.temp ? `${lampState.temp}K` : '—' },
              { label: 'Modo activo', value: getModeLabel() },
              { label: 'Conexión', value: isConnected ? 'En línea' : 'Desconectada' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2.5 border-b border-theme-border last:border-0 text-xs">
                <span className="text-theme-textSecondary font-medium">{label}</span>
                <span className="font-semibold text-theme-text max-w-[160px] truncate text-right" title={value}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
