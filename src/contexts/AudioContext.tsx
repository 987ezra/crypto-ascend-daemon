
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { speechRecognitionService } from '../services/speech';
import { soundService, SoundEffect } from '../services/sound';
import { useMqtt } from './MqttContext';
import { useToast } from '@/hooks/use-toast';

interface AudioContextType {
  isListening: boolean;
  isMuted: boolean;
  startListening: () => void;
  stopListening: () => void;
  toggleMute: () => void;
  lastTranscript: string;
  isSupported: boolean;
  lastCommand: string | null;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  
  const { sendCommand, sendDoorCommand, sendEmergencyCommand, sendMaintenanceCommand, isConnected } = useMqtt();
  const { toast } = useToast();

  useEffect(() => {
    setIsSupported(speechRecognitionService.supported);
    
    const transcriptUnsubscribe = speechRecognitionService.onTranscript((text) => {
      setLastTranscript(text);
      soundService.play(SoundEffect.VOICE_COMMAND);
      processCommand(text);
    });

    const statusUnsubscribe = speechRecognitionService.onStatusChange((listening) => {
      setIsListening(listening);
    });

    const errorUnsubscribe = speechRecognitionService.onError((error) => {
      toast({
        title: "Voice Recognition Error",
        description: `Error: ${error}`,
        variant: "destructive",
      });
    });

    setIsMuted(soundService.isMuted());

    return () => {
      transcriptUnsubscribe();
      statusUnsubscribe();
      errorUnsubscribe();
    };
  }, [toast, isConnected]);

  const processCommand = (text: string) => {
    if (!isConnected) {
      toast({
        title: "Not Connected",
        description: "Please connect to MQTT broker first",
        variant: "destructive",
      });
      return;
    }

    const lowerText = text.toLowerCase();
    setLastCommand(lowerText);

    // Floor commands
    if (lowerText.includes('floor')) {
      // Extract floor number
      const floorMatch = lowerText.match(/floor\s+(\d+)/i);
      if (floorMatch && floorMatch[1]) {
        const floor = parseInt(floorMatch[1], 10);
        if (floor >= 1 && floor <= 3) {
          toast({
            title: "Voice Command Recognized",
            description: `Calling elevator to floor ${floor}`,
            variant: "default",
          });
          sendCommand(floor);
        }
      }
    } 
    // Door commands
    else if (lowerText.includes('open') && lowerText.includes('door')) {
      toast({
        title: "Voice Command Recognized",
        description: "Opening elevator door",
        variant: "default",
      });
      sendDoorCommand('open');
    } 
    else if (lowerText.includes('close') && lowerText.includes('door')) {
      toast({
        title: "Voice Command Recognized",
        description: "Closing elevator door",
        variant: "default",
      });
      sendDoorCommand('close');
    } 
    // Emergency commands
    else if (lowerText.includes('emergency')) {
      if (lowerText.includes('activate') || lowerText.includes('start')) {
        toast({
          title: "Emergency Command Recognized",
          description: "Activating emergency mode",
          variant: "destructive",
        });
        sendEmergencyCommand('activate');
      } else if (lowerText.includes('deactivate') || lowerText.includes('stop') || lowerText.includes('reset')) {
        toast({
          title: "Emergency Command Recognized",
          description: "Deactivating emergency mode",
          variant: "default",
        });
        sendEmergencyCommand('deactivate');
      }
    } 
    // Maintenance commands
    else if (lowerText.includes('maintenance')) {
      if (lowerText.includes('activate') || lowerText.includes('start')) {
        toast({
          title: "Maintenance Command Recognized",
          description: "Activating maintenance mode",
          variant: "default",
        });
        sendMaintenanceCommand('activate');
      } else if (lowerText.includes('deactivate') || lowerText.includes('stop') || lowerText.includes('reset')) {
        toast({
          title: "Maintenance Command Recognized",
          description: "Deactivating maintenance mode",
          variant: "default",
        });
        sendMaintenanceCommand('deactivate');
      }
    } else {
      toast({
        title: "Voice Command Not Recognized",
        description: "Please try again with a valid command",
        variant: "default",
      });
    }
  };

  const startListening = () => {
    if (!isConnected) {
      toast({
        title: "Not Connected",
        description: "Please connect to MQTT broker first",
        variant: "destructive",
      });
      return;
    }
    
    const started = speechRecognitionService.start();
    if (!started) {
      toast({
        title: "Voice Recognition Error",
        description: "Failed to start voice recognition",
        variant: "destructive",
      });
    }
  };

  const stopListening = () => {
    speechRecognitionService.stop();
  };

  const toggleMute = () => {
    const newMutedState = soundService.toggleMute();
    setIsMuted(newMutedState);
  };

  return (
    <AudioContext.Provider
      value={{
        isListening,
        isMuted,
        startListening,
        stopListening,
        toggleMute,
        lastTranscript,
        isSupported,
        lastCommand,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
