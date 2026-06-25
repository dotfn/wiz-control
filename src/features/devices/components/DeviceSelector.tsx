import React, { useState, useRef } from 'react';
import { Plus, Edit2, Check, X, Radio, Loader2, Lightbulb, Globe, Network } from 'lucide-react';
import { LightDevice } from '../../../types';

interface DeviceSelectorProps {
  selectedIp: string | null;
  onSelect: (ip: string) => void;
  devices: LightDevice[];
  onScan: () => Promise<void>;
  isScanning: boolean;
  onUpdateDeviceName: (ip: string, name: string) => void;
}

export const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  selectedIp,
  onSelect,
  devices,
  onScan,
  isScanning,
  onUpdateDeviceName,
}) => {
  const [manualIp, setManualIp] = useState('');
  const [editingIp, setEditingIp] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');
  const manualIpInputId = 'manual-ip-input';
  const editInputRef = useRef<HTMLInputElement>(null);

  const isValidIp = (ip: string) => {
    // IPv4
    const parts4 = ip.split('.');
    if (parts4.length === 4) {
      return parts4.every((p) => {
        const n = Number(p);
        return !Number.isNaN(n) && n >= 0 && n <= 255 && String(n) === p;
      });
    }
    // IPv6
    if (ip.includes(':')) {
      const hasBracketStart = ip.startsWith('[');
      const hasBracketEnd = ip.endsWith(']');
      if ((hasBracketStart || hasBracketEnd) && !(hasBracketStart && hasBracketEnd)) return false;
      const clean = ip.replace(/^\[|\]$/g, '');
      const parts6 = clean.split(':');
      if (parts6.length < 2 || parts6.length > 8) return false;
      const emptyCount = parts6.filter((p) => p === '').length;
      if (emptyCount > 1) return false;
      if (emptyCount === 1 && clean !== '::' && !clean.includes('::')) return false;
      return parts6.every((p) => {
        if (p === '') return true;
        return /^[0-9a-fA-F]{1,4}$/.test(p);
      });
    }
    return false;
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanIp = manualIp.trim();
    if (isValidIp(cleanIp)) {
      onSelect(cleanIp);
      setManualIp('');
    }
  };

  const startEditing = (ip: string, currentName?: string) => {
    setEditingIp(ip);
    setTempName(currentName || '');
    // Focus handled via ref after render
    setTimeout(() => editInputRef.current?.focus(), 0);
  };

  const saveName = (ip: string) => {
    onUpdateDeviceName(ip, tempName.trim());
    setEditingIp(null);
  };

  const cancelEditing = () => {
    setEditingIp(null);
    setTempName('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent, ip: string) => {
    if (e.key === 'Enter') saveName(ip);
    if (e.key === 'Escape') cancelEditing();
  };

  // Dynamically estimate lightbulb colors and dropshadows based on active state parameters
  const getDeviceIconStyle = (device: LightDevice) => {
    const state = device.state;
    if (!state || !state.state) {
      return { className: 'text-theme-textSecondary opacity-40', style: {} };
    }

    if (state.r !== undefined && state.g !== undefined && state.b !== undefined) {
      return {
        className: '',
        style: {
          color: `rgb(${state.r}, ${state.g}, ${state.b})`,
          filter: `drop-shadow(0 0 6px rgba(${state.r}, ${state.g}, ${state.b}, 0.65))`,
        },
      };
    }

    if (state.temp !== undefined) {
      const isWarm = state.temp < 4000;
      return {
        className: '',
        style: {
          color: isWarm ? 'rgb(251, 191, 36)' : 'rgb(147, 197, 253)',
          filter: `drop-shadow(0 0 6px ${isWarm ? 'rgba(251, 191, 36, 0.65)' : 'rgba(147, 197, 253, 0.65)'
            })`,
        },
      };
    }

    return {
      className: 'text-amber-400',
      style: { filter: 'drop-shadow(0 0 6px rgba(251, 191, 36, 0.65))' },
    };
  };

  return (
    <div className="space-y-4">
      {/* Header section */}
      <div className="flex items-center justify-between gap-2 border-b border-theme-border pb-3 transition-colors duration-300">
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-theme-textSecondary font-display flex items-center gap-1.5 transition-colors duration-300 whitespace-nowrap flex-shrink-0">
          <Radio
            className={`w-3.5 h-3.5 ${isScanning
                ? 'animate-pulse text-theme-accent'
                : 'text-theme-textSecondary opacity-60'
              }`}
          />
          Dispositivos en red
        </h2>
        <button
          onClick={onScan}
          disabled={isScanning}
          className={`w-20 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all flex items-center justify-center flex-shrink-0 active:scale-95 disabled:opacity-75 ${isScanning
              ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
              : 'bg-theme-input hover:bg-theme-border border-theme-border text-theme-text'
            }`}
        >
          {isScanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Buscar'}
        </button>
      </div>

      {/* Devices list — padding lateral para que los ring/sombras no se corten */}
      <div
        className="space-y-2.5 overflow-y-auto custom-scrollbar"
        style={{
          maxHeight: '14rem',     /* 224 px ≈ max-h-56 */
          /* Padding extra en los lados para que drop-shadows y rings no queden cortados */
          paddingRight: '6px',
          paddingLeft: '2px',
          paddingTop: '2px',
          paddingBottom: '4px',
          /* overflow-x oculto pero y visible en scroll */
          overflowX: 'visible',
        }}
      >
        {devices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center border border-dashed border-theme-border rounded-2xl bg-theme-input space-y-3 transition-all duration-300">
            <div className="p-3 bg-theme-input rounded-full border border-theme-border">
              <Network className="w-5 h-5 text-theme-textSecondary opacity-40 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h4 className="text-[11px] font-bold text-theme-text uppercase tracking-wider">
                Sin dispositivos
              </h4>
              <p className="text-[10px] text-theme-textSecondary leading-relaxed max-w-[200px] mx-auto">
                Haz clic en "Buscar" para rastrear lámparas inteligentes Wi-Fi en tu red.
              </p>
            </div>
          </div>
        ) : (
          devices.map((device) => {
            const isSelected = device.ip === selectedIp;
            const isEditing = device.ip === editingIp;
            const iconStyle = getDeviceIconStyle(device);

            return (
              <div
                key={device.ip}
                /*
                 * FIX 1 — Eliminado `overflow-hidden` que cortaba sombras/rings.
                 * FIX 2 — Contexto de apilamiento explícito con `relative z-0`
                 *          para que los hijos con z-index funcionen correctamente.
                 */
                className={`group relative z-0 flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300 ${isSelected
                    ? 'border-blue-500/30 bg-blue-500/5 dark:bg-blue-500/10 shadow-[0_2px_10px_rgba(0,122,255,0.06)]'
                    : 'border-theme-border bg-theme-input hover:bg-theme-border'
                  }`}
              >
                {/* Icono de bombilla */}
                <div
                  /*
                   * FIX 3 — `flex-shrink-0` garantiza que el icono no se comprima
                   *          cuando el nombre o la IP son muy largos.
                   */
                  className="flex-shrink-0 p-2 bg-theme-bg rounded-xl border border-theme-border flex items-center justify-center transition-colors duration-300"
                  onClick={() => !isEditing && onSelect(device.ip)}
                  style={{ cursor: isEditing ? 'default' : 'pointer' }}
                >
                  <Lightbulb
                    className={`w-4 h-4 transition-all duration-300 ${iconStyle.className}`}
                    style={iconStyle.style}
                  />
                </div>

                {/* Contenido central — clickable para seleccionar */}
                <div
                  className="flex-1 min-w-0"
                  onClick={() => !isEditing && onSelect(device.ip)}
                  style={{ cursor: isEditing ? 'default' : 'pointer' }}
                >
                  {isEditing ? (
                    /*
                     * FIX 4 — El input de edición ya no necesita stopPropagation
                     *          en el wrapper porque el onClick está sólo en el padre
                     *          cuando !isEditing.
                     */
                    <div className="flex items-center gap-1.5">
                      <input
                        ref={editInputRef}
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        placeholder="Ej. Escritorio"
                        onKeyDown={(e) => handleEditKeyDown(e, device.ip)}
                        className="flex-1 min-w-0 bg-theme-input border border-theme-border rounded-xl px-2.5 py-1 text-xs text-theme-text outline-none focus:border-theme-accent transition-colors"
                      />
                      {/* Confirmar */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          saveName(device.ip);
                        }}
                        className="flex-shrink-0 p-1.5 hover:bg-theme-border rounded-lg text-theme-green transition-all"
                        aria-label="Confirmar nombre"
                      >
                        <Check className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      {/* Cancelar */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          cancelEditing();
                        }}
                        className="flex-shrink-0 p-1.5 hover:bg-theme-border rounded-lg text-theme-textSecondary transition-all"
                        aria-label="Cancelar edición"
                      >
                        <X className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <span className="font-bold text-xs text-theme-text truncate transition-colors duration-300">
                        {device.name || 'Lámpara inteligente'}
                      </span>
                      <span className="font-mono text-[9px] text-theme-textSecondary mt-0.5 flex items-center gap-1 transition-colors duration-300">
                        {device.ip}
                        {device.state?.state !== undefined && (
                          <>
                            <span>·</span>
                            <span
                              className={
                                device.state.state ? 'text-amber-400' : 'text-theme-textSecondary'
                              }
                            >
                              {device.state.state ? 'Encendida' : 'Apagada'}
                            </span>
                          </>
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/*
                 * FIX 5 — Zona de acción derecha con z-index explícito (z-10)
                 *          para que el botón de editar siempre quede por encima
                 *          del contenido del card. Tamaño fijo para no desplazar layout.
                 */}
                {!isEditing && (
                  <div className="relative flex-shrink-0 w-7 h-7 z-10">
                    {/* Botón editar — visible en hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(device.ip, device.name);
                      }}
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center bg-theme-input hover:bg-theme-border border border-theme-border rounded-lg text-theme-textSecondary hover:text-theme-text transition-all duration-200 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-theme-accent"
                      aria-label={`Editar nombre de ${device.name || device.ip}`}
                    >
                      <Edit2 className="w-3 h-3" aria-hidden="true" />
                    </button>

                    {/* Indicador de selección — oculto en hover */}
                    {isSelected && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 flex items-center justify-center group-hover:opacity-0 transition-opacity duration-200 pointer-events-none"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20 animate-pulse" />
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Barra de IP manual */}
      <form onSubmit={handleManualAdd} className="relative flex items-center group w-full pt-1.5">
        <label htmlFor={manualIpInputId} className="sr-only">
          Dirección IP manual
        </label>
        <div className="absolute left-3.5 text-theme-textSecondary opacity-40 group-focus-within:text-theme-accent group-focus-within:opacity-80 transition-colors duration-200 pointer-events-none">
          <Globe className="w-3.5 h-3.5" />
        </div>
        <input
          id={manualIpInputId}
          type="text"
          value={manualIp}
          onChange={(e) => setManualIp(e.target.value)}
          placeholder="Añadir IP manualmente..."
          className="w-full bg-theme-input border border-theme-border rounded-2xl pl-9 pr-10 py-2.5 text-xs font-mono text-theme-text placeholder-theme-textSecondary/60 outline-none focus:border-theme-accent transition-all duration-300"
        />
        <button
          type="submit"
          disabled={!isValidIp(manualIp.trim())}
          aria-label="Añadir dispositivo por IP"
          className="absolute right-1.5 p-1.5 bg-theme-input hover:bg-theme-border border border-theme-border text-theme-text rounded-xl transition-all duration-200 flex items-center justify-center active:scale-90 disabled:opacity-30 disabled:pointer-events-none"
        >
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
};