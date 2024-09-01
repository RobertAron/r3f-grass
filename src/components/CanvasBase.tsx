import { Canvas } from "@react-three/fiber";
import React from "react";

export function CanvasBase({ children }: { children?: React.ReactNode }) {
  return (
    <div className="h-[1000px] w-[1000px] border">
      <Canvas
        style={{ background: "#000000" }}
        camera={{ near: 0.001, far: 10000 }}
      >
        <ambientLight intensity={0.5} color={"white"} />
        <pointLight
          position={[5, 5, 5]}
          intensity={100}
          decay={0}
          color="white"
          args={[undefined, undefined, 1000]}
        />
        {/* <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          decay={0}
          intensity={Math.PI}
        />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} /> */}
        {/* <directionalLight
          color={"#005F00"}
          intensity={10}
          position={[1,1,1]}
        /> */}
        {/* <directionalLight
          color={"#5f005f"}
          intensity={10}
          position={[1, 1, 0]}
        /> */}
        {/* <directionalLight
          color={"#5f005f"}
          intensity={10}
          position={[1, 1, 0]}
        /> */}
        {children}
        <mesh position={[0,10,0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={"orange"} />
        </mesh>
      </Canvas>
    </div>
  );
}
