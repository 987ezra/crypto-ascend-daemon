import React, { useState } from 'react';
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
  const [brokerUrl, setBrokerUrl] = useState('wss://5412836165b448ca98f99040756f5b82.s1.eu.hivemq.cloud:8884');
  const [clientId, setClientId] = useState(`crypto_elevator_${Math.floor(Math.random() * 1000)}`);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    setConnectionError(null);
    try {
      await connect({
        brokerUrl,
        clientId,
        username: username || undefined,
        password: password || undefined,
        options: {
          keepalive: 60,
          reconnectPeriod: 5000,
          connectTimeout: 30000,
          // HiveMQ Cloud requires TLS
          rejectUnauthorized: true
        }
      });
      soundService.play(SoundEffect.CONNECTION);
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionError(error instanceof Error ? error.message : 'Connection failed');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setConnectionError(null);
  };

  return (
    <div className={`p-4 glass-panel ${className}`}>
      <h2 className="text-xl font-bold text-center mb-4 text-bitcoin-light neon-text">MQTT Connection</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="broker-url">Broker URL</Label>
          <Input
            id="broker-url"
            value={brokerUrl}
            onChange={(e) => setBrokerUrl(e.target.value)}
            disabled={isConnected}
            className="bg-black/30 border-bitcoin-light/30"
            placeholder="wss://[broker-id].s1.eu.hivemq.cloud:8884"
          />
          <p className="text-xs text-gray-400">Use WebSocket port 8884 for secure connections</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="client-id">Client ID</Label>
          <Input
            id="client-id"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            disabled={isConnected}
            className="bg-black/30 border-bitcoin-light/30"
            placeholder="crypto_elevator_client"
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
              placeholder="HiveMQ Username"
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
              placeholder="HiveMQ Password"
              required
            />
          </div>
        </div>
        
        {connectionError && (
          <div className="text-red-500 text-sm py-2 px-3 bg-red-500/10 border border-red-500/20 rounded">
            Connection Error: {connectionError}
          </div>
        )}
        
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
              disabled={isConnecting || !brokerUrl || !clientId || !username || !password}
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
