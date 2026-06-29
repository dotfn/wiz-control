import React, { useState, useRef } from 'react';
import { Plus, Edit2, Check, X, Radio, Loader2, Lightbulb, Globe, Network, Eye, EyeOff, ChevronDown, ChevronUp, Home, Trash2, ChevronRight } from 'lucide-react';
import { LightDevice } from '../../../types';
import { DeviceGroup } from '../store/deviceStore';

interface DeviceSelectorProps {
  selectedMac: string | null;
  onSelect: (mac: string, ipOverride?: string) => void;
  devices: LightDevice[];
  onScan: () => Promise<void>;
  isScanning: boolean;
  onUpdateDeviceName: (mac: string, name: string) => void;
  excludedMacs: string[];
  onExcludeDevice: (mac: string) => void;
  onIncludeDevice: (mac: string) => void;
  deviceNames: Record<string, string>;
  macToIp: Record<string, string>;
  groups: DeviceGroup[];
  selectedGroupId: string | null;
  onCreateGroup: (name: string, deviceMacs: string[]) => void;
  onUpdateGroup: (id: string, name: string, deviceMacs: string[]) => void;
  onDeleteGroup: (id: string) => void;
  onSelectGroup: (id: string | null) => void;
}

export const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  selectedMac,
  onSelect,
  devices,
  onScan,
  isScanning,
  onUpdateDeviceName,
  excludedMacs,
  onExcludeDevice,
  onIncludeDevice,
  deviceNames,
  macToIp,
  groups,
  selectedGroupId,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  onSelectGroup,
}) => {
  const [manualIp, setManualIp] = useState('');
  const [editingMac, setEditingMac] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');
  const [showExcluded, setShowExcluded] = useState(false);
  const manualIpInputId = 'manual-ip-input';
  const editInputRef = useRef<HTMLInputElement>(null);

  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [groupNameInput, setGroupNameInput] = useState('');
  const [selectedGroupMacs, setSelectedGroupMacs] = useState<string[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const isValidIp = (ip: string) => {
    const parts4 = ip.split('.');
    if (parts4.length === 4) {
      return parts4.every((p) => {
        const n = Number(p);
        return !Number.isNaN(n) && n >= 0 && n <= 255 && String(n) === p;
      });
    }
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
      const syntheticMac = `manual-${cleanIp}`;
      onSelect(syntheticMac, cleanIp);
      setManualIp('');
    }
  };

  const startEditing = (mac: string, currentName?: string) => {
    setEditingMac(mac);
    setTempName(currentName || '');
    setTimeout(() => editInputRef.current?.focus(), 0);
  };

  const saveName = (mac: string) => {
    onUpdateDeviceName(mac, tempName.trim());
    setEditingMac(null);
  };

  const cancelEditing = () => {
    setEditingMac(null);
    setTempName('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent, mac: string) => {
    if (e.key === 'Enter') saveName(mac);
    if (e.key === 'Escape') cancelEditing();
  };

  const toggleGroupMacSelection = (mac: string) => {
    setSelectedGroupMacs((prev) =>
      prev.includes(mac) ? prev.filter((item) => item !== mac) : [...prev, mac]
    );
  };

  const handleStartCreateGroup = () => {
    setGroupNameInput('');
    setSelectedGroupMacs([]);
    setEditingGroupId(null);
    setIsCreatingGroup(true);
  };

  const handleStartEditGroup = (group: DeviceGroup) => {
    setGroupNameInput(group.name);
    setSelectedGroupMacs(group.deviceMacs);
    setEditingGroupId(group.id);
    setIsCreatingGroup(false);
  };

  const handleCancelGroupForm = () => {
    setIsCreatingGroup(false);
    setEditingGroupId(null);
    setGroupNameInput('');
    setSelectedGroupMacs([]);
  };

  const handleSaveGroup = () => {
    if (!groupNameInput.trim()) return;
    if (editingGroupId) {
      onUpdateGroup(editingGroupId, groupNameInput.trim(), selectedGroupMacs);
    } else {
      onCreateGroup(groupNameInput.trim(), selectedGroupMacs);
    }
    handleCancelGroupForm();
  };

  const toggleGroupExpanded = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: prev[groupId] === false ? true : false,
    }));
  };

  const isGroupExpanded = (groupId: string) => {
    return expandedGroups[groupId] !== false;
  };

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

  const macsInGroups = groups.flatMap((g) => g.deviceMacs);
  const individualDevices = devices.filter(
    (d) => !excludedMacs.includes(d.mac) && !macsInGroups.includes(d.mac)
  );

  const getRoomDevices = (group: DeviceGroup) =>
    group.deviceMacs
      .filter((mac) => !excludedMacs.includes(mac))
      .map((mac) => {
        const device = devices.find((d) => d.mac === mac);
        const ip = device?.ip || macToIp[mac] || '';
        return { ip, mac, name: device?.name || deviceNames[mac] || 'Lámpara' };
      });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 border-b border-theme-border/60 pb-3 transition-colors duration-300">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-theme-textSecondary font-display flex items-center gap-1.5 transition-colors duration-300 whitespace-nowrap flex-shrink-0">
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
          className={`px-4 py-1.5 text-[11px] font-semibold rounded-full border transition-colors flex items-center justify-center gap-1.5 flex-shrink-0 active:scale-95 disabled:opacity-75 ${isScanning
            ? 'bg-theme-text/10 border-theme-text/20 text-theme-text'
            : 'bg-theme-card hover:bg-theme-input border-theme-border text-theme-text'
            }`}
        >
          {isScanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Buscar'}
        </button>
      </div>

      {/* Manual IP entry */}
      <form onSubmit={handleManualAdd} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-theme-textSecondary/60 pointer-events-none" />
          <input
            id={manualIpInputId}
            type="text"
            value={manualIp}
            onChange={(e) => setManualIp(e.target.value)}
            placeholder="Añadir IP manual..."
            className="w-full bg-theme-input border border-theme-border rounded-full pl-8 pr-3 py-1.5 text-[11px] text-theme-text outline-none focus:border-theme-accent transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={!isValidIp(manualIp.trim())}
          className="p-1.5 rounded-full bg-theme-accent text-white hover:opacity-90 disabled:opacity-40 transition-opacity flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </form>

      {(isCreatingGroup || editingGroupId) && (
        <div className="p-3 bg-theme-input border border-theme-border rounded-[28px] space-y-3 transition-colors">
          <div className="flex items-center justify-between border-b border-theme-border/60 pb-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-theme-accent">
              {editingGroupId ? 'Editar Habitación' : 'Nueva Habitación'}
            </span>
            <button
              type="button"
              onClick={handleCancelGroupForm}
              className="p-1 hover:bg-theme-border rounded-lg text-theme-textSecondary transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-[0.05em] text-theme-textSecondary/80">Nombre</label>
            <input
              type="text"
              value={groupNameInput}
              onChange={(e) => setGroupNameInput(e.target.value)}
              placeholder="Ej. Living, Dormitorio..."
              className="w-full bg-theme-bg border border-theme-border rounded-xl px-2.5 py-1.5 text-xs text-theme-text outline-none focus:border-theme-accent transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-[0.05em] text-theme-textSecondary/80 block">Lámparas a incluir</label>
            <div className="max-h-32 overflow-y-auto custom-scrollbar border border-theme-border rounded-xl p-1 bg-theme-bg/50 space-y-0.5">
              {devices
                .filter((d) => !excludedMacs.includes(d.mac))
                .map((device) => {
                  const isChecked = selectedGroupMacs.includes(device.mac);
                  return (
                    <label
                      key={device.mac}
                      className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-theme-input cursor-pointer text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleGroupMacSelection(device.mac)}
                        className="accent-theme-accent rounded border-theme-border w-3.5 h-3.5 cursor-pointer"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold truncate text-[11px] leading-tight text-theme-text">
                          {device.name || 'Lámpara inteligente'}
                        </div>
                        <div className="text-[10px] text-theme-textSecondary/60 truncate">
                          {device.ip}
                        </div>
                      </div>
                    </label>
                  );
                })}
              {devices.filter((d) => !excludedMacs.includes(d.mac)).length === 0 && (
                <div className="p-3 text-center text-[10px] text-theme-textSecondary/60">
                  No hay dispositivos activos disponibles.
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={handleCancelGroupForm}
              className="px-3 py-1.5 text-[10px] font-semibold rounded-full border border-theme-border text-theme-textSecondary hover:bg-theme-input transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveGroup}
              disabled={!groupNameInput.trim()}
              className="px-4 py-1.5 text-[10px] font-semibold rounded-full bg-theme-accent text-white hover:opacity-90 disabled:opacity-50 transition-opacity shadow-none"
            >
              Guardar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4 pt-1 pr-1">
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-theme-border/60 pb-2 transition-colors">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-theme-textSecondary flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-theme-textSecondary opacity-80" />
              Habitaciones
            </h3>
            {!isCreatingGroup && !editingGroupId && (
              <button
                type="button"
                onClick={handleStartCreateGroup}
                className="px-3 py-1.5 bg-theme-card hover:bg-theme-input border border-theme-border rounded-full text-[10px] font-semibold text-theme-textSecondary hover:text-theme-text transition-colors flex items-center gap-1.5 active:scale-95 shadow-none"
                title="Añadir Habitación"
              >
                <Plus className="w-3 h-3 text-theme-accent" />
                Añadir
              </button>
            )}
          </div>

          {groups.length === 0 ? (
            !isCreatingGroup && !editingGroupId && (
              <div className="p-4 border border-dashed border-theme-border rounded-[28px] bg-theme-card/30 space-y-2.5 text-center transition-colors duration-300">
                <p className="text-[10px] text-theme-textSecondary/90 font-medium leading-relaxed">
                  Crea una habitación para agrupar tus lámparas (ej. Living, Dormitorio) y controlarlas todas juntas.
                </p>
                <button
                  type="button"
                  onClick={handleStartCreateGroup}
                  className="mx-auto px-4 py-1.5 bg-theme-card hover:bg-theme-input border border-theme-border text-[10px] font-semibold rounded-full transition-colors duration-344 flex items-center gap-1.5 text-theme-text active:scale-95"
                >
                  <Plus className="w-3 h-3 text-theme-accent" />
                  Crear Habitación
                </button>
              </div>
            )
          ) : (
            <div className="space-y-2">
              {groups.map((group) => {
                const isSelected = selectedGroupId === group.id;
                const expanded = isGroupExpanded(group.id);
                const roomDevices = getRoomDevices(group);

                return (
                  <div key={group.id} className="space-y-1.5">
                    <div
                      className={`group/room relative flex items-center gap-3 p-4 rounded-[28px] border transition-colors duration-300 cursor-pointer shadow-none ${isSelected
                          ? 'border-theme-border bg-theme-card ring-1 ring-inset ring-theme-text/20'
                          : 'border-theme-border/30 bg-theme-card hover:bg-theme-input'
                        }`}
                      onClick={() => { onSelectGroup(group.id); toggleGroupExpanded(group.id); }}
                    >
                      <div className="flex-shrink-0 p-1.5 bg-theme-card rounded-full border border-theme-border/60 flex items-center justify-center">
                        <Home className="w-3 h-3 text-theme-textSecondary/60" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-[13px] leading-snug text-theme-text truncate block">
                          {group.name}
                        </span>
                        <span className="text-[10px] text-theme-textSecondary block mt-0.5">
                          {roomDevices.filter((d) => !!d.ip).length} de {roomDevices.length} {roomDevices.length === 1 ? 'lámpara' : 'lámparas'}
                        </span>
                      </div>

                      <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover/room:opacity-100 transition-opacity duration-150 pointer-events-none group-hover/room:pointer-events-auto">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleStartEditGroup(group); }}
                          className="p-1.5 rounded-full border border-theme-border bg-theme-card hover:bg-theme-input text-theme-textSecondary hover:text-theme-text transition-colors duration-150 active:scale-95"
                          title="Editar Habitación"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onDeleteGroup(group.id); }}
                          className="p-1.5 rounded-full border border-theme-border bg-theme-card hover:bg-theme-input text-theme-textSecondary hover:text-red-400 transition-colors duration-150 active:scale-95"
                          title="Eliminar Habitación"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {isSelected && (
                          <span className="group-hover/room:opacity-0 transition-opacity duration-150 w-1.5 h-1.5 rounded-full bg-theme-accent animate-pulse" />
                        )}
                        <span className="text-theme-textSecondary/40">
                          {expanded ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </span>
                      </div>
                    </div>

                    {expanded && roomDevices.length > 0 && (
                      <div className="pl-3.5 space-y-1.5 border-l border-theme-border ml-[18px] py-1">
                        {roomDevices.map((device) => {
                          const isOnline = !!device.ip;
                          const isDeviceSelected = device.mac === selectedMac && (!selectedGroupId || selectedGroupId === group.id);
                          const isEditing = device.mac === editingMac && isOnline;
                          const iconStyle = isOnline ? getDeviceIconStyle(device) : { className: 'text-theme-textSecondary opacity-30', style: {} };

                          return (
                            <div
                              key={device.mac}
                              className={`group relative z-0 flex items-center gap-2.5 p-3 rounded-[28px] border transition-colors duration-300 shadow-none ${isDeviceSelected
                                  ? 'border-theme-text/40 bg-theme-text/[0.04]'
                                  : 'border-theme-border/20 bg-theme-card/50 hover:bg-theme-input'
                                } ${!isOnline ? 'opacity-50' : ''}`}
                            >
                              <div
                                className="flex-shrink-0 p-1.5 bg-theme-card rounded-full border border-theme-border flex items-center justify-center cursor-pointer"
                                onClick={() => !isEditing && onSelect(device.mac)}
                              >
                                <Lightbulb
                                  className={`w-3.5 h-3.5 transition-[color,filter] duration-300 ${iconStyle.className}`}
                                  style={iconStyle.style}
                                />
                              </div>

                              <div
                                className="flex-1 min-w-0 cursor-pointer"
                                onClick={() => !isEditing && onSelect(device.mac)}
                              >
                                {isEditing ? (
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      ref={editInputRef}
                                      type="text"
                                      value={tempName}
                                      onChange={(e) => setTempName(e.target.value)}
                                      onKeyDown={(e) => handleEditKeyDown(e, device.mac)}
                                      className="flex-1 min-w-0 bg-theme-input border border-theme-border rounded-full px-2 py-0.5 text-xs text-theme-text outline-none focus:border-theme-accent transition-colors"
                                    />
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        saveName(device.mac);
                                      }}
                                      className="p-1 hover:bg-theme-input rounded-full text-theme-green transition-colors"
                                    >
                                      <Check className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        cancelEditing();
                                      }}
                                      className="p-1 hover:bg-theme-input rounded-full text-theme-textSecondary transition-colors"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex flex-col min-w-0 pr-2">
                                    <span className="font-bold text-xs text-theme-text truncate block leading-tight tracking-apple-body">
                                      {device.name || 'Lámpara inteligente'}
                                      {!isOnline && (
                                        <span className="text-[10px] text-red-400/60 ml-2 font-normal">Sin conexión</span>
                                      )}
                                    </span>
                                    <span className="text-[10px] text-theme-textSecondary/60 mt-0.5 truncate transition-opacity duration-200 group-hover:opacity-0">
                                      {device.ip || 'No disponible'}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {!isEditing && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10">
                                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 transition-opacity duration-200">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        startEditing(device.mac, device.name);
                                      }}
                                      className="p-1.5 bg-theme-card hover:bg-theme-input border border-theme-border rounded-full text-theme-textSecondary hover:text-theme-text transition-colors duration-150 active:scale-95"
                                      title="Editar"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onExcludeDevice(device.mac);
                                      }}
                                      className="p-1.5 bg-theme-card hover:bg-theme-input border border-theme-border rounded-full text-theme-textSecondary hover:text-red-400 transition-colors duration-150 active:scale-95"
                                      title="Excluir"
                                    >
                                      <EyeOff className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  {isDeviceSelected && (
                                    <span className="group-hover:hidden flex items-center justify-center w-7 h-7">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {individualDevices.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-theme-textSecondary flex items-center gap-1.5 border-b border-theme-border/60 pb-2 transition-colors">
              <Radio className="w-3.5 h-3.5 text-theme-textSecondary opacity-60" />
              Lámparas sin asignar
            </h3>

            <div className="space-y-2.5">
              {individualDevices.map((device) => {
                const isSelected = device.mac === selectedMac && !selectedGroupId;
                const isEditing = device.mac === editingMac;
                const iconStyle = getDeviceIconStyle(device);

                return (
                  <div
                    key={device.mac}
                    className={`group relative z-0 flex items-center gap-2.5 p-3 rounded-[28px] border transition-colors duration-300 shadow-none ${isSelected
                        ? 'border-theme-text/40 bg-theme-text/[0.04]'
                        : 'border-theme-border/30 bg-theme-card hover:bg-theme-input'
                      }`}
                  >
                    <div
                      className="flex-shrink-0 p-1.5 bg-theme-card rounded-full border border-theme-border flex items-center justify-center cursor-pointer"
                      onClick={() => !isEditing && onSelect(device.mac)}
                    >
                      <Lightbulb
                        className={`w-3.5 h-3.5 transition-[color,filter] duration-300 ${iconStyle.className}`}
                        style={iconStyle.style}
                      />
                    </div>

                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => !isEditing && onSelect(device.mac)}
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            ref={editInputRef}
                            type="text"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            onKeyDown={(e) => handleEditKeyDown(e, device.mac)}
                            className="flex-1 min-w-0 bg-theme-input border border-theme-border rounded-full px-2.5 py-1 text-xs text-theme-text outline-none focus:border-theme-accent transition-colors"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              saveName(device.mac);
                            }}
                            className="p-1.5 hover:bg-theme-input rounded-full text-theme-green transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              cancelEditing();
                            }}
                            className="p-1.5 hover:bg-theme-input rounded-full text-theme-textSecondary transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col min-w-0 pr-2">
                          <span className="font-bold text-xs text-theme-text truncate tracking-apple-body">
                            {device.name || 'Lámpara inteligente'}
                          </span>
                          <div className="text-[10px] text-theme-textSecondary mt-0.5 flex items-center gap-1 min-w-0 transition-opacity duration-200 group-hover:opacity-0">
                            <span className="truncate">{device.ip}</span>
                            {device.state?.state !== undefined && (
                              <>
                                <span className="flex-shrink-0">·</span>
                                <span className={`flex-shrink-0 font-sans tracking-apple-body-sm ${device.state.state ? 'text-amber-500' : 'text-theme-textSecondary'}`}>
                                  {device.state.state ? 'Encendida' : 'Apagada'}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10">
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 transition-opacity duration-200">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditing(device.mac, device.name);
                            }}
                            className="p-1.5 bg-theme-card hover:bg-theme-input border border-theme-border rounded-full text-theme-textSecondary hover:text-theme-text transition-colors duration-150 active:scale-95"
                            title="Editar"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onExcludeDevice(device.mac);
                            }}
                            className="p-1.5 bg-theme-card hover:bg-theme-input border border-theme-border rounded-full text-theme-textSecondary hover:text-red-400 transition-colors duration-150 active:scale-95"
                            title="Excluir"
                          >
                            <EyeOff className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {isSelected && (
                          <span className="group-hover:hidden flex items-center justify-center w-7 h-7 bg-theme-input/40 backdrop-blur-md rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {groups.length === 0 && individualDevices.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 px-6 text-center border border-dashed border-theme-border rounded-[28px] bg-theme-input/20 space-y-4 transition-colors duration-300 shadow-none">
            <div className="p-3 bg-theme-card rounded-full border border-theme-border flex items-center justify-center">
              <Network className="w-5 h-5 text-theme-textSecondary opacity-40 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h4 className="text-[11px] font-semibold text-theme-text uppercase tracking-[0.06em]">
                No se encontraron lámparas
              </h4>
              <p className="text-[10px] text-theme-textSecondary/80 max-w-[200px] mx-auto">
                Asegúrate de que las lámparas estén encendidas y en la misma red. También puedes añadir una dirección IP manualmente.
              </p>
            </div>
          </div>
        )}

        {/* Excluded devices section */}
        {excludedMacs.length > 0 && (
          <div className="space-y-2">
            <button
              onClick={() => setShowExcluded(!showExcluded)}
              className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-theme-textSecondary/70 hover:text-theme-textSecondary transition-colors border-b border-theme-border/60 pb-2 w-full"
            >
              <EyeOff className="w-3 h-3" />
              Excluidas ({excludedMacs.length})
              {showExcluded ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
            </button>
            {showExcluded && (
              <div className="space-y-1.5">
                {excludedMacs.map((mac) => {
                  const device = devices.find((d) => d.mac === mac);
                  return (
                    <div
                      key={mac}
                      className="flex items-center gap-2 p-3 rounded-[28px] border border-theme-border/20 bg-theme-card/30 opacity-60 hover:opacity-100 transition-opacity"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-theme-textSecondary" />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-theme-textSecondary truncate block">
                          {device?.name || deviceNames[mac] || 'Lámpara'}
                        </span>
                        <span className="text-[10px] text-theme-textSecondary/50">{device?.ip || mac}</span>
                      </div>
                      <button
                        onClick={() => onIncludeDevice(mac)}
                        className="p-1.5 bg-theme-card hover:bg-theme-input border border-theme-border rounded-full text-theme-textSecondary hover:text-theme-green transition-colors"
                        title="Incluir"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
