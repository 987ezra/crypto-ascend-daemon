
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import StatusPanel from './StatusPanel';
import ElevatorShaft from './ElevatorShaft';
import ElevatorControls from './ElevatorControls';
import VoiceControl from './VoiceControl';
import MqttConnection from './MqttConnection';
import LogPanel from './LogPanel';
import { CircuitBoard, Zap, Binary } from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <div className="flex items-center justify-center mb-2">
          <div className="relative">
            <CircuitBoard className="h-8 w-8 text-voltage-orange mr-1" />
            <Zap className="h-5 w-5 text-voltage-yellow absolute top-1.5 left-1.5" />
          </div>
          <h1 className="text-3xl font-bold electric-text font-circuit tracking-wider">
            MAD L<span className="text-voltage-yellow">I</span>FT
          </h1>
          <Binary className="h-6 w-6 text-voltage-blue ml-2" />
        </div>
        <p className="text-gray-400 max-w-2xl mx-auto font-mono text-sm">
          "High-Voltage Tokenomics – No Fuses Blown" | For engineers who speak in amps, not hype
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main visualization and status */}
        <Card className="md:col-span-2 circuit-panel border-voltage-blue/30">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 3D Elevator Visualization */}
              <div className="col-span-1">
                <h2 className="text-xl font-bold mb-4 electric-text text-center font-circuit">Elevator Shaft</h2>
                <ElevatorShaft />
              </div>
              
              <div className="col-span-1 space-y-4">
                {/* Status Panel */}
                <StatusPanel />
                
                {/* Elevator Controls */}
                <ElevatorControls />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Sidebar components */}
        <div className="space-y-6">
          {/* MQTT Connection */}
          <MqttConnection />
          
          {/* Voice Control */}
          <VoiceControl />
          
          {/* Transaction Log */}
          <LogPanel maxHeight="300px" />
        </div>
      </div>
      
      <footer className="mt-8 text-center text-xs text-gray-500 font-mono">
        <p>"Current &gt; Currency" | MAD LIFT &copy; 2025 • If You Can&apos;t Ohm It, Don&apos;t Tokenize It</p>
      </footer>
    </div>
  );
};

export default Dashboard;
