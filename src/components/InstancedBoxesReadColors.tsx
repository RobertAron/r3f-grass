import { OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const vertexShader = /*glsl*/ `
attribute float instanceIndex;
uniform sampler2D textureData;
uniform float textureWidth;
uniform float textureHeight;

varying vec4 vColor;  // Varying variable to pass color to fragment shader

void main() {
  // Calculate UV based on instanceIndex
  // scaled from 0-1
  float x = mod(instanceIndex, textureWidth) / textureWidth;
  float y = floor(instanceIndex / textureWidth) / textureHeight;
  vec2 uv = vec2(x, y);

  // Sample the texture data at this UV
  vec4 texData = texture2D(textureData, uv);
  vColor = texData;

  // Use the texture data to offset the position
  vec3 transformed = position;
  transformed.x += x*textureWidth-(textureWidth/2.0);
  transformed.y += y*textureHeight-(textureHeight/2.0);

  // Usual model-view-projection calculations
  vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
  gl_Position = projectionMatrix * mvPosition;
}
`;

// Fragment Shader (simple pass-through)
const fragmentShader = /*glsl*/ `

varying vec4 vColor;  // Receive the color from the vertex shader

void main() {
  gl_FragColor = vColor;
}
`;

const tempColor = new THREE.Color();
const niceColors = ["#69d2e7", "#a7dbd8", "#e0e4cc", "#f38630", "#fa6900"];
const data = Array.from({ length: 1000 }, () => ({
  color: niceColors[Math.floor(Math.random() * 5)],
  scale: 1,
}));
const colorArray = Float32Array.from(
  new Array(1000)
    .fill(null)
    .flatMap((_, i) => tempColor.set(data[i].color).toArray()),
);
export function InstancedThing({ texture }: { texture: THREE.DataTexture }) {
  const count = 100;
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Create an array with instance indices
  const instanceIndex = useMemo(() => {
    const indexArray = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      indexArray[i] = i;
    }
    return indexArray;
  }, [count]);

  useEffect(() => {
    if (meshRef.current === null) return;
    meshRef.current.geometry.setAttribute(
      "instanceIndex",
      new THREE.InstancedBufferAttribute(instanceIndex, 1),
    );
  }, [instanceIndex]);
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        textureData: { value: texture },
        textureWidth: { value: texture.image.width },
        textureHeight: { value: texture.image.height },
      },
    });
  }, [texture]);
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[0.3, 0.3, 0.3]}>
        <instancedBufferAttribute
          attach="attributes-color"
          args={[colorArray, 3]}
        />
      </boxGeometry>
      <OrbitControls />
      <primitive object={shaderMaterial} attach="material" />
    </instancedMesh>
  );
}
