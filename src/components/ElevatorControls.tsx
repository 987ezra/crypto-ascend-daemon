
import React from 'react';
import { Button } from '@/components/ui/button';
import { useMqtt } from '@/contexts/MqttContext';
import { soundService, SoundEffect } from '@/services/sound';
import { ArrowUp, ArrowDown, DoorOpen, DoorClosed, Bell, ShieldAlert, Timer } from 'lucide-react';

interface ElevatorControlsProps {
  className?: string;
}

const ElevatorControls: React.FC<ElevatorControlsProps> = ({ className }) => {
  const { sendCommand, sendDoorCommand, sendEmergencyCommand, sendMaintenanceCommand, status } = useMqtt();

  // Get status
  const currentFloor = status?.floor || 1;
  const isEmergency = status?.emergency || false;
  const isMaintenance = status?.maintenance || false;
  const isDoorOpen = status?.door === 'open';

  const handleFloorButtonClick = (floor: number) => {
    soundService.play(SoundEffect.BUTTON_CLICK);
    sendCommand(floor);
  };

  const handleDoorButtonClick = (action: 'open' | 'close') => {
    soundService.play(SoundEffect.BUTTON_CLICK);
    sendDoorCommand(action);
  };

  const handleEmergencyButtonClick = () => {
    soundService.play(SoundEffect.ALARM);
    sendEmergencyCommand(isEmergency ? 'deactivate' : 'activate');
  };

  const handleMaintenanceButtonClick = () => {
    soundService.play(SoundEffect.BUTTON_CLICK);
    sendMaintenanceCommand(isMaintenance ? 'deactivate' : 'activate');
  };

  return (
    <div className={`p-4 glass-panel ${className}`}>
      <h2 className="text-xl font-bold text-center mb-4 neon-text">Elevator Controls</h2>
      
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {/* Floor buttons */}
        <Button
          variant="outline"
          onClick={() => handleFloorButtonClick(3)}
          className={`cyber-button ${currentFloor === 3 ? 'bg-bitcoin-blue text-white' : ''} text-xs sm:text-sm`}
          disabled={isEmergency}
        >
          <ArrowUp className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> Floor 3
        </Button>
        
        <Button
          variant="outline"
          onClick={() => handleFloorButtonClick(2)}
          className={`cyber-button ${currentFloor === 2 ? 'bg-bitcoin-blue text-white' : ''} text-xs sm:text-sm`}
          disabled={isEmergency}
        >
          <ArrowUp className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> Floor 2
        </Button>
        
        <Button
          variant="outline"
          onClick={() => handleFloorButtonClick(1)}
          className={`cyber-button ${currentFloor === 1 ? 'bg-bitcoin-blue text-white' : ''} text-xs sm:text-sm`}
          disabled={isEmergency}
        >
          <ArrowDown className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> Floor 1
        </Button>
        
        {/* Door controls */}
        <Button
          variant="outline"
          onClick={() => handleDoorButtonClick('open')}
          className={`cyber-button ${isDoorOpen ? 'bg-bitcoin-blue text-white' : ''} text-xs sm:text-sm`}
          disabled={isEmergency}
        >
          <DoorOpen className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> Open
        </Button>
        
        <Button
          variant="outline"
          onClick={() => handleDoorButtonClick('close')}
          className={`cyber-button ${!isDoorOpen ? 'bg-bitcoin-blue text-white' : ''} text-xs sm:text-sm`}
          disabled={isEmergency}
        >
          <DoorClosed className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> Close
        </Button>
        
        {/* Emergency button */}
        <Button
          variant="outline"
          onClick={handleEmergencyButtonClick}
          className={`${isEmergency ? 'bg-red-500 text-white border-red-500' : 'border-red-500 text-red-500'} hover:bg-red-500 hover:text-white text-xs sm:text-sm`}
        >
          <ShieldAlert className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> {isEmergency ? 'Reset' : 'Emergency'}
        </Button>
        
        {/* Maintenance mode button */}
        <Button
          variant="outline"
          onClick={handleMaintenanceButtonClick}
          className={`col-span-3 ${isMaintenance ? 'bg-yellow-500 text-white border-yellow-500' : 'border-yellow-500 text-yellow-500'} hover:bg-yellow-500 hover:text-white text-xs sm:text-sm`}
          disabled={isEmergency}
        >
          <Timer className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> {isMaintenance ? 'Exit Maintenance' : 'Maintenance Mode'}
        </Button>
      </div>
    </div>
  );
};

export default ElevatorControls;
