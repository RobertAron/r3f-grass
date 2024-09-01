import { OrbitControls } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
import { CanvasBase } from "./CanvasBase";
import { InstancedThing } from "./InstancedBoxesReadColors";
import { RGB, RGBTHing } from "./RgbColorPicker";
import { NoiseViewer } from "./NoiseTexture";
import { InstancedThing2 } from "./InstancedGrassWithWInd";
import { useLoader } from "@react-three/fiber";
import wall from "./wall.jpg";

const xMax = 50;
const yMax = 50;
const size = xMax * yMax;
const initColor = new THREE.Color(0xaaffaa);
const PlaneDefault = () => {
  const colorMap = useLoader(THREE.TextureLoader, wall);
  const planeMaterial = new THREE.MeshStandardMaterial({});
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} material={planeMaterial}>
      <meshStandardMaterial map={colorMap} />
      <planeGeometry args={[xMax * 2, yMax * 2, 20, 20]} />
    </mesh>
  );
};

export function EditableTexturePlane() {
  const [texture] = useState<THREE.DataTexture>(() => {
    const data = new Uint8Array(4 * size);
    const r = initColor.r * 255;
    const g = initColor.g * 255;
    const b = initColor.b * 255;

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

  const [color, setColor] = useState<RGB>({
    r: initColor.r,
    g: initColor.g,
    b: initColor.b,
  });
  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    // uv goes 0-1
    const uv = event.uv!;
    const x = Math.floor(uv.x * xMax);
    const y = Math.floor(uv.y * yMax); // No inversion of y here
    if (lastEdited.current?.x === x && lastEdited.current?.y === y) return;
    // Calculate the texture index without needing to flip
    const textureIndex = x * 4 + y * 4 * xMax;

    const data = texture.image.data;
    data[textureIndex] = color.r * 255;
    data[textureIndex + 1] = color.g * 255;
    data[textureIndex + 2] = color.b * 255;
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
        <OrbitControls />
        <InstancedThing texture={texture} />
        <PlaneDefault />
      </CanvasBase>
      <CanvasBase>
        <OrbitControls autoRotate />
        <NoiseViewer />
        <PlaneDefault />
      </CanvasBase>
      <CanvasBase>
        <OrbitControls />
        <InstancedThing2 texture={texture} />
        <PlaneDefault />
      </CanvasBase>
    </>
  );
}
