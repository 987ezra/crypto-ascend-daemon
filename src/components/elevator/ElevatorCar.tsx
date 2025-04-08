
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Torus, Text } from '@react-three/drei';
import * as THREE from 'three';

// Define types for the elevator car props
interface ElevatorCarProps {
  position: number;
  doorOpen: boolean;
  isEmergency: boolean;
  isMaintenance: boolean;
  isOverload: boolean;
}

// Elevator car 3D component
const ElevatorCar: React.FC<ElevatorCarProps> = ({ 
  position, 
  doorOpen, 
  isEmergency, 
  isMaintenance, 
  isOverload 
}) => {
  const carRef = useRef<THREE.Group>(null);
  
  // Elevator car colors based on state
  const carColor = isEmergency 
    ? "#ff4444" 
    : isMaintenance 
      ? "#ffcc00" 
      : "#40BEFF";
  
  useFrame(() => {
    if (carRef.current) {
      // Add subtle floating animation
      carRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group position={[0, position, 0]} ref={carRef}>
      {/* Main elevator car */}
      <mesh>
        <boxGeometry args={[2, 1.5, 1.5]} />
        <meshStandardMaterial 
          color={carColor}
          transparent={true}
          opacity={0.7}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Doors */}
      <group>
        {/* Left door */}
        <mesh position={[-0.5 - (doorOpen ? 0.5 : 0), 0, 0.8]}>
          <boxGeometry args={[0.98, 1.45, 0.1]} />
          <meshStandardMaterial 
            color="#1A1F2C"
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
        
        {/* Right door */}
        <mesh position={[0.5 + (doorOpen ? 0.5 : 0), 0, 0.8]}>
          <boxGeometry args={[0.98, 1.45, 0.1]} />
          <meshStandardMaterial 
            color="#1A1F2C"
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
      </group>
      
      {/* Bitcoin logo */}
      <mesh position={[0, 0, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.1, 16, 32]} />
        <meshStandardMaterial 
          color="#F97316" 
          emissive="#F97316"
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Status indicators */}
      {isOverload && (
        <Text
          position={[0, -0.7, 0.8]}
          fontSize={0.2}
          color="#ff4444"
        >
          OVERLOAD
        </Text>
      )}
    </group>
  );
};

export default ElevatorCar;
