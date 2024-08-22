import { OrbitControls } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
import { CanvasBase } from "./CanvasBase";
import { InstancedThing } from "./InstancedBoxesReadColors";
import { RGB, RGBTHing } from "./RgbColorPicker";

const xMax = 10;
const yMax = 10;
const size = xMax * yMax;
export function EditableTexturePlane() {
  const [texture] = useState<THREE.DataTexture>(() => {
    const data = new Uint8Array(4 * size);
    const color = new THREE.Color(0xffffff);
    const r = Math.floor(color.r * 255);
    const g = Math.floor(color.g * 255);
    const b = Math.floor(color.b * 255);

    for (let i = 0; i < size; i++) {
      const stride = i * 4;
      data[stride] = r;
      data[stride + 1] = g;
      data[stride + 2] = b;
      data[stride + 3] = 255;
    }
    // used the buffer to create a DataTexture
    const texture = new THREE.DataTexture(data, xMax, yMax);
    texture.needsUpdate = true;
    return texture;
  });
  const lastEdited = useRef<{ x: number; y: number } | null>(null);

  const [color, setColor] = useState<RGB>("red");
  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    // uv goes 0-1
    const uv = event.uv!;
    const x = Math.floor(uv.x * xMax);
    const y = Math.floor(uv.y * yMax); // No inversion of y here
    if (lastEdited.current?.x === x && lastEdited.current?.y === y) return;
    // Calculate the texture index without needing to flip
    const textureIndex = x * 4 + y * 4 * 10;

    const data = texture.image.data;
    data[textureIndex] = color === "red" ? 255 : 0;
    data[textureIndex + 1] = color === "green" ? 255 : 0;
    data[textureIndex + 2] = color === "blue" ? 255 : 0;
    data[textureIndex + 3] = 255;
    lastEdited.current = { x, y };

    texture.needsUpdate = true; // Mark texture for update
  };

  return (
    <>
      <RGBTHing color={color} setColor={setColor} />
      <CanvasBase>
        <mesh onPointerMove={handlePointerDown}>
          <planeGeometry args={[5, 5]} />
          <meshBasicMaterial map={texture} />
        </mesh>
      </CanvasBase>
      <CanvasBase>
        <OrbitControls autoRotate />
        <mesh onPointerMove={handlePointerDown}>
          <planeGeometry args={[5, 5]} />
          <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
        </mesh>
      </CanvasBase>
      <CanvasBase>
        <InstancedThing texture={texture} />
      </CanvasBase>
    </>
  );
}
