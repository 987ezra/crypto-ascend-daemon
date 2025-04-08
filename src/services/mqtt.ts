
import mqtt, { MqttClient, IClientOptions } from 'mqtt';

export interface MqttConnectionConfig {
  brokerUrl: string;
  clientId: string;
  username?: string;
  password?: string;
  port?: number;
}

export interface ElevatorStatus {
  floor: number;
  target_floor: number;
  state: string;
  door: string;
  emergency: boolean;
  maintenance: boolean;
  overload: boolean;
  door_obstructed: boolean;
}

export interface ElevatorDiagnostics {
  uptime_seconds: number;
  total_trips: number;
  door_operations: number;
  wifi_rssi: number;
  free_heap: number;
  current_floor: number;
}

export interface ElevatorLog {
  timestamp: number;
  message: string;
}

export class MqttService {
  private client: MqttClient | null = null;
  private statusListeners: ((status: ElevatorStatus) => void)[] = [];
  private diagnosticsListeners: ((diagnostics: ElevatorDiagnostics) => void)[] = [];
  private logListeners: ((log: ElevatorLog) => void)[] = [];
  private connectionStatusListeners: ((connected: boolean) => void)[] = [];
  private messageListeners: ((topic: string, message: string) => void)[] = [];

  // Topic definitions
  private static TOPIC_ELEVATOR_STATUS = "building/elevator/status";
  private static TOPIC_ELEVATOR_COMMAND = "building/elevator/command";
  private static TOPIC_ELEVATOR_LOG = "building/elevator/log";
  private static TOPIC_EMERGENCY = "building/elevator/emergency";
  private static TOPIC_MAINTENANCE = "building/elevator/maintenance";
  private static TOPIC_DIAGNOSTICS = "building/elevator/diagnostics";

  get isConnected(): boolean {
    return this.client?.connected || false;
  }

  connect(config: MqttConnectionConfig): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.client?.connected) {
        this.client.end();
      }

      const opts: IClientOptions = {
        clientId: config.clientId || `elevator_dashboard_${Math.random().toString(16).substring(2, 8)}`,
        username: config.username,
        password: config.password,
        port: config.port || 8883,
        protocol: config.brokerUrl.startsWith('wss') ? 'wss' : 'ws',
        rejectUnauthorized: false, // For testing purposes (not recommended for production)
      };

      try {
        const url = config.brokerUrl;
        this.client = mqtt.connect(url, opts);

        this.client.on('connect', () => {
          console.log('Connected to MQTT broker');
          
          // Subscribe to all topics in the building/elevator/ path
          this.client?.subscribe('building/elevator/#', (err) => {
            if (err) {
              console.error('Subscription error:', err);
              reject(err);
            } else {
              this.notifyConnectionStatus(true);
              resolve(true);
            }
          });
        });

        this.client.on('message', (topic, message) => {
          const messageStr = message.toString();
          
          // Notify all message listeners
          this.notifyMessageReceived(topic, messageStr);
          
          try {
            if (topic === MqttService.TOPIC_ELEVATOR_STATUS) {
              const status: ElevatorStatus = JSON.parse(messageStr);
              this.notifyStatusUpdate(status);
            } 
            else if (topic === MqttService.TOPIC_DIAGNOSTICS) {
              const diagnostics: ElevatorDiagnostics = JSON.parse(messageStr);
              this.notifyDiagnosticsUpdate(diagnostics);
            }
            else if (topic === MqttService.TOPIC_ELEVATOR_LOG) {
              const log: ElevatorLog = JSON.parse(messageStr);
              this.notifyLogUpdate(log);
            }
          } catch (e) {
            console.error('Error parsing message:', e);
          }
        });

        this.client.on('error', (err) => {
          console.error('MQTT connection error:', err);
          this.notifyConnectionStatus(false);
          reject(err);
        });

        this.client.on('close', () => {
          console.log('MQTT connection closed');
          this.notifyConnectionStatus(false);
        });

      } catch (error) {
        console.error('Failed to connect to MQTT broker:', error);
        this.notifyConnectionStatus(false);
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.client?.connected) {
      this.client.end();
      this.notifyConnectionStatus(false);
    }
  }

  sendCommand(floor: number): void {
    if (!this.client?.connected) {
      console.error('Not connected to MQTT broker');
      return;
    }

    const command = {
      floor: floor
    };

    this.client.publish(
      MqttService.TOPIC_ELEVATOR_COMMAND,
      JSON.stringify(command)
    );
  }

  sendDoorCommand(action: 'open' | 'close'): void {
    if (!this.client?.connected) {
      console.error('Not connected to MQTT broker');
      return;
    }

    const command = {
      door: action
    };

    this.client.publish(
      MqttService.TOPIC_ELEVATOR_COMMAND,
      JSON.stringify(command)
    );
  }

  sendEmergencyCommand(action: 'activate' | 'deactivate'): void {
    if (!this.client?.connected) {
      console.error('Not connected to MQTT broker');
      return;
    }

    this.client.publish(MqttService.TOPIC_EMERGENCY, action);
  }

  sendMaintenanceCommand(action: 'activate' | 'deactivate'): void {
    if (!this.client?.connected) {
      console.error('Not connected to MQTT broker');
      return;
    }

    this.client.publish(MqttService.TOPIC_MAINTENANCE, action);
  }

  onStatusUpdate(listener: (status: ElevatorStatus) => void): () => void {
    this.statusListeners.push(listener);
    return () => {
      this.statusListeners = this.statusListeners.filter(l => l !== listener);
    };
  }

  onDiagnosticsUpdate(listener: (diagnostics: ElevatorDiagnostics) => void): () => void {
    this.diagnosticsListeners.push(listener);
    return () => {
      this.diagnosticsListeners = this.diagnosticsListeners.filter(l => l !== listener);
    };
  }

  onLogUpdate(listener: (log: ElevatorLog) => void): () => void {
    this.logListeners.push(listener);
    return () => {
      this.logListeners = this.logListeners.filter(l => l !== listener);
    };
  }

  onConnectionStatusChange(listener: (connected: boolean) => void): () => void {
    this.connectionStatusListeners.push(listener);
    return () => {
      this.connectionStatusListeners = this.connectionStatusListeners.filter(l => l !== listener);
    };
  }
  
  onMessageReceived(listener: (topic: string, message: string) => void): () => void {
    this.messageListeners.push(listener);
    return () => {
      this.messageListeners = this.messageListeners.filter(l => l !== listener);
    };
  }

  private notifyStatusUpdate(status: ElevatorStatus): void {
    this.statusListeners.forEach(listener => listener(status));
  }

  private notifyDiagnosticsUpdate(diagnostics: ElevatorDiagnostics): void {
    this.diagnosticsListeners.forEach(listener => listener(diagnostics));
  }

  private notifyLogUpdate(log: ElevatorLog): void {
    this.logListeners.forEach(listener => listener(log));
  }

  private notifyConnectionStatus(connected: boolean): void {
    this.connectionStatusListeners.forEach(listener => listener(connected));
  }
  
  private notifyMessageReceived(topic: string, message: string): void {
    this.messageListeners.forEach(listener => listener(topic, message));
  }
}

// Create a singleton instance
export const mqttService = new MqttService();
export default mqttService;
