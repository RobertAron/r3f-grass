import { Sky } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import React, { useRef } from "react";
import { PointLight } from "three";

function Lights() {
  const pointLight = useRef<PointLight>(null!);
  useFrame(({ clock }) => {
    if (pointLight.current === null) return;
    const x = Math.sin(clock.getElapsedTime()) * 10;
    const z = Math.cos(clock.getElapsedTime()) * 10;
    pointLight.current.position.x = x;
    pointLight.current.position.z = z;
  });
  return (
    <>
      {/* <ambientLight intensity={0.5} color={"white"} /> */}

      {/* <spotLight
        position={[2, 10, 2]}
        angle={1}
        penumbra={1}
        decay={0}
        intensity={10}
      /> */}
      <Sky
        sunPosition={[100, 20, 100]} // Position of the sun in the sky
        turbidity={8} // Amount of particles in the air
        rayleigh={6} // Atmospheric scattering
        mieCoefficient={0.005} // How much light is scattered by dust
        mieDirectionalG={0.7} // Sun glare intensity
      />

      {/* Lights to enhance the outdoor environment */}
      <directionalLight position={[5, 2, 1]} intensity={.8} castShadow />
      <ambientLight intensity={.5} />
    </>
  );
}

export function CanvasBase({ children }: { children?: React.ReactNode }) {
  return (
    <div className="h-[1000px] w-[1000px] border">
      <Canvas
        style={{ background: "#000000" }}
        camera={{ near: 0.001, far: 10000, position: [0, 8, 30] }}
      >
        {children}
        <Lights />
        <mesh position={[0, 8, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={"white"} emissive={'white'} />
        </mesh>
        <pointLight
          position={[0, 8, 0]}
          intensity={1000}
          decay={3}
          color="white"
        />
      </Canvas>
    </div>
  );
}
