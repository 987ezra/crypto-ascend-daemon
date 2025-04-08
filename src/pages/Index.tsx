
import React from 'react';
import Dashboard from '@/components/Dashboard';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-voltage-dark to-black text-white pb-20">
      {/* PCB-inspired background */}
      <div className="fixed inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-black" 
             style={{
               backgroundImage: `
                 linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)),
                 repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(30, 174, 219, 0.05) 20px, rgba(30, 174, 219, 0.05) 21px),
                 repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(30, 174, 219, 0.05) 20px, rgba(30, 174, 219, 0.05) 21px)`,
             }}></div>
        <div className="absolute h-full w-full">
          {Array.from({ length: 30 }).map((_, i) => (
            <div 
              key={`circuit-path-${i}`} 
              className="absolute bg-voltage-blue/10"
              style={{
                height: `${Math.random() * 30 + 1}px`,
                width: `${Math.random() * 200 + 50}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 360}deg)`,
                borderRadius: '2px',
              }}
            />
          ))}
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={`circuit-node-${i}`} 
              className="absolute bg-voltage-orange/20 rounded-full"
              style={{
                height: `${Math.random() * 12 + 8}px`,
                width: `${Math.random() * 12 + 8}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Main content */}
      <div className="relative z-10">
        <Dashboard />
      </div>
    </div>
  );
};

export default Index;
