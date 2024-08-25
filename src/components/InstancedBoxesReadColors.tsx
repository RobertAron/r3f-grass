import { MeshProps, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
const vertexShader = /*glsl*/ `
attribute float instanceIndex;
uniform sampler2D textureData;
uniform float textureWidth;
uniform float textureHeight;

varying vec4 vColor;

void main() {
  // Calculate UV based on instanceIndex
  float x = mod(instanceIndex, textureWidth) / textureWidth;
  float y = floor(instanceIndex / textureWidth) / textureHeight;
  vec2 uv = vec2(x, y);

  // Sample the texture data at this UV
  vec4 texData = texture2D(textureData, uv);
  vColor = texData;

  // Extract the RGB components for scaling factors
  float scaleX = texData.r * 5.0;
  float scaleY = texData.g * 5.0;
  float scaleZ = texData.b * 5.0;

  // Apply scaling based on the RGB values
  vec3 transformed = position;
  transformed *= vec3(scaleX,scaleY,scaleZ);

  // Offset the position based on instance index
  transformed.x += x * textureWidth - (textureWidth / 2.0);
  transformed.y += scaleY/2.0;
  transformed.z += y * textureHeight - (textureHeight / 2.0);

  // Usual model-view-projection calculations
  vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  vNormal = normalize( normalMatrix * normal );
}
`;

// https://github.com/mrdoob/three.js/blob/3e6ab2d9c7f2d8e8d798aa5e1f628e25149e808c/examples/jsm/shaders/ToonShader.js
// https://www.maya-ndljk.com/blog/threejs-basic-toon-shader
// Fragment Shader (simple pass-through)
const fragmentShader = /*glsl*/ `

varying vec4 vColor;  // Receive the color from the vertex shader

void main() {
  gl_FragColor = vColor;
}
`;

function Box(props: MeshProps) {
  // This reference will give us direct access to the mesh
  const meshRef = useRef<THREE.Mesh>(null!);
  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);
  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((_state, delta) => (meshRef.current.rotation.x += delta));
  // Return view, these are regular three.js elements expressed in JSX
  return (
    <mesh
      {...props}
      ref={meshRef}
      scale={active ? 1.5 : 1}
      onClick={(_event) => setActive(!active)}
      onPointerOver={(_event) => setHover(true)}
      onPointerOut={(_event) => setHover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
    </mesh>
  );
}

export function InstancedThing({ texture }: { texture: THREE.DataTexture }) {
  const count = texture.image.width * texture.image.height;
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Create an array with instance indices
  const instanceIndex = useMemo(
    () => new Float32Array(count).map((_, index) => index),
    [count],
  );

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
    <>
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <boxGeometry args={[0.3, 1, 0.3]}></boxGeometry>
        <primitive object={shaderMaterial} attach="material" />
      </instancedMesh>
      <Box />
    </>
  );
}
