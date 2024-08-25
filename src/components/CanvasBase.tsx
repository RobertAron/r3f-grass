import { Canvas } from "@react-three/fiber";
import React from "react";

export function CanvasBase({ children }: { children?: React.ReactNode }) {
  return (
    <div className="h-96 w-96 border">
      <Canvas
        style={{ background: "#000000" }}
        camera={{ near: 0.001, far: 10000 }}
      >
        <ambientLight intensity={Math.PI / 2} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          decay={0}
          intensity={Math.PI}
        />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
        {children}
      </Canvas>
    </div>
  );
}
