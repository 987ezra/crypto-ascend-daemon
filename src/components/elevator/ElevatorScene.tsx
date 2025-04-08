
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import ElevatorShaftModel from './ElevatorShaftModel';

interface ElevatorSceneProps {
  floors: number;
  elevatorPosition: number;
  doorOpen: boolean;
  isEmergency: boolean;
  isMaintenance: boolean;
  isOverload: boolean;
  isMoving: boolean;
}

const ElevatorScene: React.FC<ElevatorSceneProps> = ({
  floors,
  elevatorPosition,
  doorOpen,
  isEmergency,
  isMaintenance,
  isOverload,
  isMoving
}) => {
  return (
    <Canvas camera={{ position: [5, 0, 5], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} color="#40BEFF" intensity={0.5} />
      
      <ElevatorShaftModel 
        floors={floors} 
        elevatorPosition={elevatorPosition}
        doorOpen={doorOpen}
        isEmergency={isEmergency}
        isMaintenance={isMaintenance}
        isOverload={isOverload}
      />
      
      <OrbitControls 
        enablePan={false}
        enableZoom={true}
        maxDistance={15}
        minDistance={4}
        autoRotate={!isMoving}
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
};

export default ElevatorScene;
