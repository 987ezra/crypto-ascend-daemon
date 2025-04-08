
import React from 'react';
import { Text } from '@react-three/drei';
import ElevatorCar from './ElevatorCar';

// Define types for shaft model props
interface ElevatorShaftModelProps {
  floors: number;
  elevatorPosition: number;
  doorOpen: boolean;
  isEmergency: boolean;
  isMaintenance: boolean;
  isOverload: boolean;
}

// Elevator shaft structure
const ElevatorShaftModel: React.FC<ElevatorShaftModelProps> = ({ 
  floors, 
  elevatorPosition, 
  doorOpen, 
  isEmergency, 
  isMaintenance, 
  isOverload 
}) => {
  return (
    <>
      {/* Shaft walls */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3, 12, 3]} />
        <meshStandardMaterial 
          color="#1A1F2C" 
          transparent={true}
          opacity={0.3}
          wireframe={true}
        />
      </mesh>
      
      {/* Base and top */}
      <mesh position={[0, -6, 0]}>
        <boxGeometry args={[3.2, 0.2, 3.2]} />
        <meshStandardMaterial color="#40BEFF" />
      </mesh>
      
      <mesh position={[0, 6, 0]}>
        <boxGeometry args={[3.2, 0.2, 3.2]} />
        <meshStandardMaterial color="#40BEFF" />
      </mesh>
      
      {/* Floor indicators */}
      {Array.from({ length: floors }).map((_, index) => {
        const floorPosition = -6 + (12 / (floors - 1)) * index;
        const currentFloor = Math.round(((elevatorPosition + 6) / 12) * (floors - 1)) + 1;
        const isCurrentFloor = floors - index === currentFloor;
        
        return (
          <group key={`floor-${index}`} position={[0, floorPosition, 0]}>
            <mesh>
              <boxGeometry args={[3.2, 0.05, 3.2]} />
              <meshStandardMaterial 
                color="#40BEFF" 
                transparent={true}
                opacity={0.5}
              />
            </mesh>
            <Text
              position={[-1.7, 0, 1.7]}
              fontSize={0.25}
              color="#40BEFF"
            >
              {`Floor ${floors - index}`}
            </Text>
            <mesh position={[1.5, 0, 1.5]}>
              <boxGeometry args={[0.1, 0.1, 0.1]} />
              <meshStandardMaterial 
                color={isCurrentFloor ? "#F97316" : "#1EAEDB"}
                emissive={isCurrentFloor ? "#F97316" : "#1EAEDB"}
                emissiveIntensity={0.5}
              />
            </mesh>
          </group>
        );
      })}
      
      {/* Circuit lines - decorative */}
      {Array.from({ length: 15 }).map((_, index) => (
        <mesh
          key={`circuit-${index}`}
          position={[
            (Math.random() - 0.5) * 2.5,
            (Math.random() - 0.5) * 11,
            (Math.random() - 0.5) * 2.5
          ]}
          rotation={[
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
          ]}
        >
          <boxGeometry args={[0.05, 0.05, Math.random() * 2 + 1]} />
          <meshStandardMaterial 
            color="#F97316" 
            emissive="#F97316"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
      
      {/* Add elevator car */}
      <ElevatorCar 
        position={elevatorPosition} 
        doorOpen={doorOpen}
        isEmergency={isEmergency}
        isMaintenance={isMaintenance}
        isOverload={isOverload}
      />
    </>
  );
};

export default ElevatorShaftModel;
