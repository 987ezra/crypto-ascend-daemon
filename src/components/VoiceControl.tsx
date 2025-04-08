
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAudio } from '@/contexts/AudioContext';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

interface VoiceControlProps {
  className?: string;
}

const VoiceControl: React.FC<VoiceControlProps> = ({ className }) => {
  const { isListening, isMuted, startListening, stopListening, toggleMute, lastTranscript, isSupported, lastCommand } = useAudio();

  if (!isSupported) {
    return (
      <div className={`p-4 glass-panel ${className}`}>
        <h2 className="text-xl font-bold text-center mb-4 text-bitcoin-orange neon-text-orange">Voice Control</h2>
        <div className="text-center text-red-500">
          Voice recognition is not supported in this browser.
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 glass-panel ${className}`}>
      <h2 className="text-xl font-bold text-center mb-4 text-bitcoin-orange neon-text-orange">Voice Control</h2>
      
      <div className="space-y-4">
        <div className="flex space-x-4">
          <Button
            variant="outline"
            className={`flex-1 cyber-button-orange ${isListening ? 'bg-bitcoin-orange text-white' : ''}`}
            onMouseDown={startListening}
            onMouseUp={stopListening}
            onTouchStart={startListening}
            onTouchEnd={stopListening}
          >
            {isListening ? (
              <>
                <Mic className="mr-2 h-4 w-4 animate-pulse" /> Listening...
              </>
            ) : (
              <>
                <Mic className="mr-2 h-4 w-4" /> Hold to Speak
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            className={`cyber-button-orange ${isMuted ? 'bg-bitcoin-orange text-white' : ''}`}
            onClick={toggleMute}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <div className="p-2 border border-bitcoin-orange/30 rounded-md min-h-[60px] bg-black/30">
          <p className="text-sm text-white/80">
            {isListening ? (
              <span className="blinking-cursor">Listening...</span>
            ) : lastTranscript ? (
              <>Heard: "{lastTranscript}"</>
            ) : (
              "Hold the mic button and speak a command"
            )}
          </p>
        </div>
        
        {lastCommand && (
          <div className="p-2 border border-bitcoin-orange/30 rounded-md bg-black/30">
            <p className="text-xs text-white/70">Last command: "{lastCommand}"</p>
          </div>
        )}
        
        <div className="text-xs text-gray-400 mt-2">
          <p className="font-bold">Example commands:</p>
          <ul className="list-disc list-inside">
            <li>"Call elevator to floor 2"</li>
            <li>"Open door" / "Close door"</li>
            <li>"Activate emergency" / "Deactivate emergency"</li>
            <li>"Start maintenance" / "Stop maintenance"</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VoiceControl;
