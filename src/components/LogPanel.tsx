
import React, { useEffect, useRef, useState } from 'react';
import { useMqtt } from '@/contexts/MqttContext';
import { Bitcoin } from 'lucide-react';

interface LogPanelProps {
  className?: string;
  maxHeight?: string;
}

// Format timestamp to readable format
const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
};

const LogPanel: React.FC<LogPanelProps> = ({ className, maxHeight = '300px' }) => {
  const { logs } = useMqtt();
  const logContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll to bottom when new logs come in
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Track scroll position to enable/disable auto-scroll
  const handleScroll = () => {
    if (!logContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = logContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
    setAutoScroll(isAtBottom);
  };

  return (
    <div className={`p-4 glass-panel ${className}`}>
      <h2 className="text-xl font-bold text-center mb-4 text-bitcoin-orange neon-text-orange">Blockchain Transaction Log</h2>
      
      <div 
        ref={logContainerRef}
        className="overflow-y-auto scrollbar-thin scrollbar-thumb-bitcoin-orange/30 scrollbar-track-transparent"
        style={{ maxHeight }}
        onScroll={handleScroll}
      >
        <div className="space-y-2">
          {logs.length === 0 ? (
            <div className="text-center text-gray-400 py-4">
              <p className="animate-pulse">Waiting for elevator activity...</p>
            </div>
          ) : (
            logs.map((log, index) => (
              <div 
                key={index} 
                className="p-2 border border-bitcoin-orange/20 rounded bg-black/30 text-sm flex items-start"
              >
                <Bitcoin className="h-4 w-4 mr-2 text-bitcoin-orange shrink-0 mt-1" />
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Hash: #{log.timestamp.toString(16).substr(0, 8)}...</span>
                    <span>{formatTimestamp(log.timestamp)}</span>
                  </div>
                  <p className="text-white">{log.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="mt-2 text-xs text-gray-400 text-center">
        <p>All elevator operations are securely recorded on the blockchain</p>
      </div>
    </div>
  );
};

export default LogPanel;
