
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { mqttService, MqttConnectionConfig, ElevatorStatus, ElevatorDiagnostics, ElevatorLog } from '../services/mqtt';
import { useToast } from '@/hooks/use-toast';

interface MqttContextType {
  isConnected: boolean;
  connect: (config: MqttConnectionConfig) => Promise<boolean>;
  disconnect: () => void;
  status: ElevatorStatus | null;
  diagnostics: ElevatorDiagnostics | null;
  logs: ElevatorLog[];
  allMessages: { topic: string; message: string; timestamp: number }[];
  sendCommand: (floor: number) => void;
  sendDoorCommand: (action: 'open' | 'close') => void;
  sendEmergencyCommand: (action: 'activate' | 'deactivate') => void;
  sendMaintenanceCommand: (action: 'activate' | 'deactivate') => void;
}

const initialElevatorStatus: ElevatorStatus = {
  floor: 1,
  target_floor: 1,
  state: 'idle',
  door: 'closed',
  emergency: false,
  maintenance: false,
  overload: false,
  door_obstructed: false
};

const MqttContext = createContext<MqttContextType | undefined>(undefined);

export const MqttProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState<ElevatorStatus | null>(null);
  const [diagnostics, setDiagnostics] = useState<ElevatorDiagnostics | null>(null);
  const [logs, setLogs] = useState<ElevatorLog[]>([]);
  const [allMessages, setAllMessages] = useState<{ topic: string; message: string; timestamp: number }[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const statusUnsubscribe = mqttService.onStatusUpdate((newStatus) => {
      setStatus(newStatus);
    });

    const diagnosticsUnsubscribe = mqttService.onDiagnosticsUpdate((newDiagnostics) => {
      setDiagnostics(newDiagnostics);
    });

    const logUnsubscribe = mqttService.onLogUpdate((newLog) => {
      setLogs(prevLogs => {
        const updatedLogs = [newLog, ...prevLogs].slice(0, 100); // Keep the latest 100 logs
        return updatedLogs;
      });
    });

    const connectionUnsubscribe = mqttService.onConnectionStatusChange((connected) => {
      setIsConnected(connected);
      
      if (connected) {
        toast({
          title: "Connected to MQTT Broker",
          description: "Successfully connected to the MQTT broker",
          variant: "default",
        });
      } else {
        toast({
          title: "Disconnected from MQTT Broker",
          description: "Connection to MQTT broker was lost",
          variant: "destructive",
        });
      }
    });
    
    const messageUnsubscribe = mqttService.onMessageReceived((topic, message) => {
      setAllMessages(prev => {
        const newMessages = [
          { topic, message, timestamp: Date.now() },
          ...prev
        ].slice(0, 200); // Keep only the latest 200 messages
        return newMessages;
      });
    });

    return () => {
      statusUnsubscribe();
      diagnosticsUnsubscribe();
      logUnsubscribe();
      connectionUnsubscribe();
      messageUnsubscribe();
      mqttService.disconnect();
    };
  }, [toast]);

  const connect = async (config: MqttConnectionConfig): Promise<boolean> => {
    try {
      const result = await mqttService.connect(config);
      return result;
    } catch (error) {
      console.error('Failed to connect to MQTT broker:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to MQTT broker. Please check your settings.",
        variant: "destructive",
      });
      return false;
    }
  };

  const disconnect = () => {
    mqttService.disconnect();
  };

  const sendCommand = (floor: number) => {
    mqttService.sendCommand(floor);
  };

  const sendDoorCommand = (action: 'open' | 'close') => {
    mqttService.sendDoorCommand(action);
  };

  const sendEmergencyCommand = (action: 'activate' | 'deactivate') => {
    mqttService.sendEmergencyCommand(action);
  };

  const sendMaintenanceCommand = (action: 'activate' | 'deactivate') => {
    mqttService.sendMaintenanceCommand(action);
  };

  return (
    <MqttContext.Provider
      value={{
        isConnected,
        connect,
        disconnect,
        status: status || initialElevatorStatus,
        diagnostics,
        logs,
        allMessages,
        sendCommand,
        sendDoorCommand,
        sendEmergencyCommand,
        sendMaintenanceCommand,
      }}
    >
      {children}
    </MqttContext.Provider>
  );
};

export const useMqtt = (): MqttContextType => {
  const context = useContext(MqttContext);
  if (context === undefined) {
    throw new Error('useMqtt must be used within a MqttProvider');
  }
  return context;
};
