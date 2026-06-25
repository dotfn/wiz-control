import React, { useState, useEffect } from 'react';
import { Moon, Play, Square, Sparkles, Clock, Minus, Plus } from 'lucide-react';

interface TimerViewProps {
  isActive: boolean;
  onStartTimer: (minutes: number, fadeOut: boolean) => void;
  onCancelTimer: () => void;
  remainingSeconds: number;
  totalSeconds: number;
  fadeOutEnabled: boolean;
}

export const TimerView: React.FC<TimerViewProps> = ({
  isActive,
  onStartTimer,
  onCancelTimer,
  remainingSeconds,
  totalSeconds,
  fadeOutEnabled,
}) => {
  const [minutes, setMinutes] = useState(15);
  const [fadeOut, setFadeOut] = useState(true);
  const [estimatedOffTime, setEstimatedOffTime] = useState<string>('');

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    onStartTimer(minutes, fadeOut);
  };

  const handleDecrement = () => {
    setMinutes((prev) => Math.max(1, prev - 1));
  };

  const handleIncrement = () => {
    setMinutes((prev) => Math.min(180, prev + 1));
  };

  // Calculate estimated off time when remainingSeconds changes
  useEffect(() => {
    if (isActive && remainingSeconds > 0) {
      const offDate = new Date();
      offDate.setSeconds(offDate.getSeconds() + remainingSeconds);
      const hrs = offDate.getHours().toString().padStart(2, '0');
      const mins = offDate.getMinutes().toString().padStart(2, '0');
      setEstimatedOffTime(`${hrs}:${mins}`);
    }
  }, [isActive, remainingSeconds]);

  // SVG Circumference calculation
  const radius = 80;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;
  const strokeDashoffset = circumference - progress * circumference;

  // Custom range track fill percentage
  const percent = ((minutes - 1) / (180 - 1)) * 100;

  return (
    <div className="max-w-md mx-auto space-y-6 animate-fade-in">
      {!isActive ? (
        <div className="glass-card space-y-5">
          {/* Header Block with Ambient Glow */}
          <div className="flex items-center gap-3.5 border-b border-theme-border pb-4 relative overflow-hidden">
            <div className="absolute top-1/2 left-4 -translate-y-1/2 w-10 h-10 bg-indigo-500/15 dark:bg-indigo-500/20 rounded-full blur-md -z-10 animate-pulse" />
            <div className="p-2.5 bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20 rounded-2xl flex items-center justify-center">
              <Moon className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-theme-text tracking-tight">Temporizador de Apagado</h3>
              <p className="text-[11px] text-theme-textSecondary mt-0.5">Apaga tu lámpara gradualmente para conciliar el sueño.</p>
            </div>
          </div>

          {/* Quick presets grid */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-theme-textSecondary block">
              Seleccionar Tiempo
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[15, 30, 45, 60, 90, 120].map((t) => {
                const isSelected = minutes === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setMinutes(t)}
                    className={`py-3 px-2 text-xs font-semibold rounded-xl border transition-all duration-200 flex flex-col items-center justify-center gap-1.5 active:scale-[0.97] hover:scale-[1.02] ${
                      isSelected
                        ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-200 shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                        : 'bg-theme-input/40 border-theme-border text-theme-textSecondary hover:bg-theme-input/70 hover:text-theme-text hover:border-theme-textSecondary/20'
                    }`}
                  >
                    <Clock className={`w-3.5 h-3.5 transition-transform duration-300 ${isSelected ? 'scale-110 text-indigo-400' : 'opacity-70'}`} />
                    <span className={isSelected ? 'font-bold' : ''}>{t} min</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Duration Input */}
          <div className="space-y-3 bg-theme-input/20 p-4 border border-theme-border rounded-2xl transition-colors duration-300">
            <div className="flex justify-between items-center text-[10px] text-theme-textSecondary font-bold uppercase tracking-wider">
              <label htmlFor="custom-time">Duración Personalizada</label>
              <span className="text-indigo-400 font-mono text-xs lowercase first-letter:uppercase">{minutes} {minutes === 1 ? 'minuto' : 'minutos'}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={minutes <= 1}
                className="p-2 bg-theme-input hover:bg-theme-border border border-theme-border rounded-xl text-theme-textSecondary hover:text-theme-text transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-90"
                aria-label="Disminuir 1 minuto"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <div className="flex-1 py-1">
                <input
                  id="custom-time"
                  type="range"
                  min="1"
                  max="180"
                  value={minutes}
                  onChange={(e) => setMinutes(parseInt(e.target.value, 10))}
                  style={{
                    background: `linear-gradient(to right, rgb(99, 102, 241) 0%, rgb(99, 102, 241) ${percent}%, var(--slider-track) ${percent}%, var(--slider-track) 100%)`
                  }}
                  className="w-full h-1.5 cursor-pointer appearance-none rounded-full outline-none transition-all duration-150"
                  aria-label={`Duración: ${minutes} minutos`}
                />
              </div>
              <button
                type="button"
                onClick={handleIncrement}
                disabled={minutes >= 180}
                className="p-2 bg-theme-input hover:bg-theme-border border border-theme-border rounded-xl text-theme-textSecondary hover:text-theme-text transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-90"
                aria-label="Aumentar 1 minuto"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* iOS-style toggle switch wrapper */}
          <div
            onClick={() => setFadeOut(!fadeOut)}
            className="flex items-center justify-between p-4 bg-theme-input/20 border border-theme-border rounded-2xl cursor-pointer select-none hover:bg-theme-input/30 transition-all duration-300"
          >
            <div className="flex items-start gap-3.5 mr-4">
              <div className="mt-0.5 p-1.5 bg-indigo-500/10 rounded-lg">
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <span className="font-bold text-xs text-theme-text">Desvanecimiento gradual</span>
                <p className="text-[10px] text-theme-textSecondary mt-0.5 leading-relaxed">La intensidad de la luz disminuirá progresivamente hasta apagarse.</p>
              </div>
            </div>
            {/* Custom switch */}
            <div className="relative inline-flex items-center flex-shrink-0">
              <div className={`w-9 h-5 rounded-full transition-colors duration-200 ease-in-out relative ${
                fadeOut ? 'bg-indigo-600' : 'bg-theme-input border border-theme-border'
              }`}>
                <div className={`absolute top-[2px] left-[2px] bg-white w-4 h-4 rounded-full shadow transition-transform duration-200 ease-in-out ${
                  fadeOut ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </div>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={handleStart}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-[0_4px_16px_rgba(99,102,241,0.25)] hover:shadow-[0_4px_20px_rgba(99,102,241,0.35)] active:scale-[0.98]"
          >
            <Play className="w-4 h-4 fill-current" />
            Iniciar Temporizador
          </button>
        </div>
      ) : (
        <div className="glass-card flex flex-col items-center justify-center text-center p-6 space-y-6 animate-fade-in">
          {/* Active Timer Header */}
          <div className="flex items-center justify-between w-full border-b border-theme-border pb-3 mb-1">
            <span className="text-xs font-bold text-theme-textSecondary uppercase tracking-wider flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-indigo-400 animate-pulse" />
              Temporizador Activo
            </span>
            <span className="text-[10px] bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full font-bold animate-pulse">
              En Progreso
            </span>
          </div>

          {/* Radial Progress Circle Countdown */}
          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-0 w-full h-full rounded-full bg-indigo-500/5 blur-xl scale-75 animate-pulse" />
            <svg height={radius * 2} width={radius * 2} className="transform -rotate-90 relative z-10 drop-shadow-[0_0_8px_rgba(99,102,241,0.25)]">
              {/* Background circle track */}
              <circle
                stroke="var(--border-color)"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                className="opacity-20"
              />
              {/* Glowing active progress circle */}
              <circle
                stroke="rgb(99, 102, 241)"
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center z-20">
              <span className="text-3xl font-extrabold font-mono text-theme-text tracking-tight tabular-nums select-all">
                {formatTime(remainingSeconds)}
              </span>
              <span className="text-[9px] text-theme-textSecondary uppercase font-bold tracking-wider mt-1">
                Restante
              </span>
            </div>
          </div>

          {/* Details info block */}
          <div className="w-full bg-theme-input/20 border border-theme-border/60 rounded-2xl p-4 text-xs text-left space-y-3 transition-colors duration-300">
            <div className="flex justify-between items-center border-b border-theme-border pb-2.5">
              <span className="text-theme-textSecondary font-semibold flex items-center gap-2">
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                Apagado Programado
              </span>
              <span className="font-bold text-theme-text font-mono text-[13px]">{estimatedOffTime}</span>
            </div>
            <div className="flex justify-between items-center border-b border-theme-border pb-2.5">
              <span className="text-theme-textSecondary font-semibold flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Desvanecimiento
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${fadeOutEnabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-theme-input text-theme-textSecondary border border-theme-border'}`}>
                {fadeOutEnabled ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-theme-textSecondary font-semibold flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Duración Total
              </span>
              <span className="font-bold text-theme-text">{Math.round(totalSeconds / 60)} min</span>
            </div>
          </div>

          {/* Stop / Cancel button */}
          <button
            onClick={onCancelTimer}
            className="w-full py-3 px-4 bg-theme-input hover:bg-theme-border/60 border border-theme-border text-theme-text hover:text-red-400 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Square className="w-3.5 h-3.5 fill-current text-red-500/80" />
            Cancelar Temporizador
          </button>
        </div>
      )}
    </div>
  );
};
