import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMqtt } from '@/contexts/MqttContext';
import { soundService, SoundEffect } from '@/services/sound';
import { WifiIcon, Loader2, WifiOff } from 'lucide-react';

interface MqttConnectionProps {
  className?: string;
}

const MqttConnection: React.FC<MqttConnectionProps> = ({ className }) => {
  const { isConnected, connect, disconnect } = useMqtt();
  
  // Initialize with HiveMQ credentials and correct websocket port
  const [hostname, setHostname] = useState('5412836165b448ca98f99040756f5b82.s1.eu.hivemq.cloud');
  const [port, setPort] = useState('8884');
  const [path, setPath] = useState('/mqtt');
  const [clientId, setClientId] = useState(`crypto_elevator_${Math.floor(Math.random() * 1000)}`);
  const [username, setUsername] = useState('hivemq.webclient.1745152073766');
  const [password, setPassword] = useState('PRG*8.Ipg7U6x$neC0j<');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  
  // Generate the full broker URL whenever components change
  const brokerUrl = `wss://${hostname}:${port}${path}`;

  // Function to add debug info
  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [info, ...prev].slice(0, 10));
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    setConnectionError(null);
    addDebugInfo(`Attempting connection to: ${brokerUrl}`);
    
    try {
      console.log(`Attempting to connect to MQTT broker: ${brokerUrl}`);
      
      // Create a config object with explicit URL construction to avoid any library manipulation
      const config = {
        brokerUrl,
        clientId,
        username,
        password,
        options: {
          keepalive: 60,
          reconnectPeriod: 5000,
          connectTimeout: 30000,
          rejectUnauthorized: true,
          port: parseInt(port, 10),
          // Force the protocol and port to avoid any auto-changes
          protocol: 'wss',
          hostname: hostname,
          path: path
        }
      };
      
      addDebugInfo(`Config created with URL: ${config.brokerUrl}`);
      const result = await connect(config);
      
      if (result) {
        addDebugInfo('Connection successful');
        soundService.play(SoundEffect.CONNECTION);
      } else {
        addDebugInfo('Connection returned false');
        setConnectionError('Connection failed');
      }
    } catch (error) {
      console.error('Connection error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown connection failure';
      addDebugInfo(`Error: ${errorMessage}`);
      setConnectionError(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setConnectionError(null);
    addDebugInfo('Disconnected from broker');
  };

  return (
    <div className={`p-4 glass-panel ${className}`}>
      <h2 className="text-xl font-bold text-center mb-4 text-bitcoin-light neon-text">MQTT Connection</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="hostname">Broker Hostname</Label>
          <Input
            id="hostname"
            value={hostname}
            onChange={(e) => setHostname(e.target.value)}
            disabled={isConnected}
            className="bg-black/30 border-bitcoin-light/30"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="port">WebSocket Port</Label>
            <Input
              id="port"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              disabled={isConnected}
              className="bg-black/30 border-bitcoin-light/30"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="path">WebSocket Path</Label>
            <Input
              id="path"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              disabled={isConnected}
              className="bg-black/30 border-bitcoin-light/30"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="generated-url">Generated URL</Label>
          <Input
            id="generated-url"
            value={brokerUrl}
            readOnly
            className="bg-black/30 border-bitcoin-light/30 text-gray-400"
          />
          <p className="text-xs text-gray-400">The URL that will be used for the connection</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="client-id">Client ID</Label>
          <Input
            id="client-id"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            disabled={isConnected}
            className="bg-black/30 border-bitcoin-light/30"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="username">Username <span className="text-red-500">*</span></Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isConnected}
              className="bg-black/30 border-bitcoin-light/30"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isConnected}
              className="bg-black/30 border-bitcoin-light/30"
              required
            />
          </div>
        </div>
        
        {connectionError && (
          <div className="text-red-500 text-sm py-2 px-3 bg-red-500/10 border border-red-500/20 rounded">
            Connection Error: {connectionError}
          </div>
        )}

        <div className="bg-black/20 p-2 rounded-md h-24 overflow-y-auto text-xs">
          <h3 className="text-xs font-semibold mb-1">Connection Debug Log:</h3>
          {debugInfo.length === 0 ? (
            <p className="text-gray-400">No debug information available yet</p>
          ) : (
            <ul className="space-y-1">
              {debugInfo.map((info, idx) => (
                <li key={idx} className="text-gray-300">{info}</li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="pt-2">
          {isConnected ? (
            <Button 
              variant="default" 
              onClick={handleDisconnect}
              className="w-full bg-red-500 hover:bg-red-600"
            >
              <WifiOff className="mr-2 h-4 w-4" /> Disconnect
            </Button>
          ) : (
            <Button 
              variant="default" 
              onClick={handleConnect}
              disabled={isConnecting || !hostname || !port || !clientId || !username || !password}
              className="w-full bg-bitcoin-light hover:bg-bitcoin-light/80"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...
                </>
              ) : (
                <>
                  <WifiIcon className="mr-2 h-4 w-4" /> Connect
                </>
              )}
            </Button>
          )}
        </div>
        
        <div className="text-xs text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          {isConnected && (
            <p className="mt-1 text-green-500">
              Subscribed to all building/elevator/# topics
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MqttConnection;
