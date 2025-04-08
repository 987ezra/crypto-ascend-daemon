
import React, { useEffect, useState } from 'react';
import { useMqtt } from '@/contexts/MqttContext';
import { soundService, SoundEffect } from '@/services/sound';
import ElevatorScene from './elevator/ElevatorScene';

interface ElevatorShaftProps {
  className?: string;
}

const ElevatorShaft: React.FC<ElevatorShaftProps> = ({ className }) => {
  const { status } = useMqtt();
  const [elevatorPosition, setElevatorPosition] = useState<number>(0);
  const [doorOpen, setDoorOpen] = useState<boolean>(false);
  const [moving, setMoving] = useState<boolean>(false);
  const [prevFloor, setPrevFloor] = useState<number>(1);
  
  // Total floors
  const totalFloors = 3;
  
  // Calculate the position of the elevator based on current floor
  useEffect(() => {
    if (!status) return;
    
    const currentFloor = status.floor;
    const elevatorState = status.state;
    const doorState = status.door;

    // Play sound effects for different states
    if (elevatorState === 'moving_up' || elevatorState === 'moving_down') {
      soundService.play(SoundEffect.ELEVATOR_MOVE);
      setMoving(true);
    } else if (prevFloor !== currentFloor) {
      soundService.play(SoundEffect.ELEVATOR_ARRIVE);
      setMoving(false);
    }

    if (doorState === 'open' && !doorOpen) {
      soundService.play(SoundEffect.DOOR_OPEN);
      setDoorOpen(true);
    } else if (doorState === 'closed' && doorOpen) {
      soundService.play(SoundEffect.DOOR_CLOSE);
      setDoorOpen(false);
    }

    // Convert floor position to 3D position in the shaft (from -6 to 6)
    // Floor 1 (bottom) = -6, Floor 3 (top) = 6
    const newPosition = -6 + ((currentFloor - 1) / (totalFloors - 1)) * 12;
    setElevatorPosition(newPosition);
    
    setPrevFloor(currentFloor);
  }, [status, prevFloor, doorOpen]);

  // Get status info
  const isEmergency = status?.emergency || false;
  const isMaintenance = status?.maintenance || false;
  const isOverload = status?.overload || false;

  return (
    <div className={`relative w-full h-96 overflow-hidden rounded-lg ${className}`}>
      <ElevatorScene
        floors={totalFloors}
        elevatorPosition={elevatorPosition}
        doorOpen={doorOpen}
        isEmergency={isEmergency}
        isMaintenance={isMaintenance}
        isOverload={isOverload}
        isMoving={moving}
      />
    </div>
  );
};

export default ElevatorShaft;
