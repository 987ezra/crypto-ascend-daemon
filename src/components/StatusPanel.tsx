
import React from 'react';
import { useMqtt } from '@/contexts/MqttContext';
import { Bitcoin, Clock, Cpu, Database, RotateCw, ShieldAlert } from 'lucide-react';

interface StatusPanelProps {
  className?: string;
}

const StatusPanel: React.FC<StatusPanelProps> = ({ className }) => {
  const { status, diagnostics } = useMqtt();

  if (!status) {
    return (
      <div className={`p-4 glass-panel ${className}`}>
        <h2 className="text-xl font-bold text-center mb-4 neon-text">System Status</h2>
        <div className="text-center animate-pulse">
          <p>Waiting for elevator data...</p>
        </div>
      </div>
    );
  }

  // Format uptime
  const formatUptime = (seconds?: number): string => {
    if (!seconds) return "N/A";
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return `${days}d ${hours}h ${minutes}m ${remainingSeconds}s`;
  };

  // Get status colors based on current state
  const getStateColor = (): string => {
    if (status.emergency) return "text-red-500";
    if (status.maintenance) return "text-yellow-500";
    if (status.state === "moving_up" || status.state === "moving_down") return "text-bitcoin-blue";
    if (status.door === "open") return "text-green-500";
    return "text-white";
  };

  return (
    <div className={`p-4 glass-panel ${className}`}>
      <h2 className="text-xl font-bold text-center mb-4 neon-text">System Status</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Current floor */}
        <div className="col-span-2 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-gray-400">Current Floor</p>
            <div className="text-6xl font-bold neon-text animate-pulse-glow">
              {status.floor}
            </div>
          </div>
        </div>
        
        {/* Status indicators */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Status</span>
            <span className={`text-sm font-bold ${getStateColor()} capitalize`}>
              {status.state.replace(/_/g, ' ')}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Door</span>
            <span className={`text-sm font-bold ${status.door === "open" ? "text-green-500" : "text-white"}`}>
              {status.door === "open" ? "Open" : "Closed"}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Target Floor</span>
            <span className="text-sm font-bold">
              {status.target_floor}
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          {/* Render diagnostics if available */}
          {diagnostics ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400 flex items-center">
                  <RotateCw className="h-3 w-3 mr-1" /> Trips
                </span>
                <span className="text-sm font-bold">{diagnostics.total_trips}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400 flex items-center">
                  <Database className="h-3 w-3 mr-1" /> Door Ops
                </span>
                <span className="text-sm font-bold">{diagnostics.door_operations}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400 flex items-center">
                  <Clock className="h-3 w-3 mr-1" /> Uptime
                </span>
                <span className="text-sm font-bold">{formatUptime(diagnostics.uptime_seconds)}</span>
              </div>
            </>
          ) : (
            <div className="text-center text-xs text-gray-400">
              Waiting for diagnostics...
            </div>
          )}
        </div>

        {/* Alert indicators */}
        <div className="col-span-2 grid grid-cols-2 gap-2 mt-2">
          <div className={`flex items-center justify-center p-2 rounded border ${status.emergency ? 'border-red-500 bg-red-500/20' : 'border-gray-700'}`}>
            <ShieldAlert className={`h-4 w-4 mr-2 ${status.emergency ? 'text-red-500' : 'text-gray-500'}`} />
            <span className={`text-xs font-bold ${status.emergency ? 'text-red-500' : 'text-gray-500'}`}>
              {status.emergency ? 'EMERGENCY ACTIVE' : 'No Emergency'}
            </span>
          </div>
          
          <div className={`flex items-center justify-center p-2 rounded border ${status.maintenance ? 'border-yellow-500 bg-yellow-500/20' : 'border-gray-700'}`}>
            <Cpu className={`h-4 w-4 mr-2 ${status.maintenance ? 'text-yellow-500' : 'text-gray-500'}`} />
            <span className={`text-xs font-bold ${status.maintenance ? 'text-yellow-500' : 'text-gray-500'}`}>
              {status.maintenance ? 'MAINTENANCE MODE' : 'Normal Operation'}
            </span>
          </div>
        </div>

        {/* Blockchain connection indicator */}
        <div className="col-span-2 flex items-center justify-center p-2 border border-bitcoin-orange/30 rounded bg-black/20">
          <Bitcoin className="h-4 w-4 mr-2 text-bitcoin-orange animate-spin-slow" />
          <span className="text-xs text-bitcoin-orange">Connected to Blockchain</span>
        </div>
      </div>
    </div>
  );
};

export default StatusPanel;
