import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";

const vertexShader = /*glsl*/ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
const fragmentShader = /*glsl*/ `
uniform vec2 u_resolution;
uniform float u_time;
varying vec2 vUv;

// 2D Random
float random(in vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// 2D Noise based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise(in vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);

  // Four corners in 2D of a tile
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));

  // Smooth Interpolation
  vec2 u = f * f * (3.0 - 2.0 * f);

  // Mix 4 corners percentages
  return mix(a, b, u.x) +
          (c - a) * u.y * (1.0 - u.x) +
          (d - b) * u.x * u.y;
}

void main() {
  vec2 st = vUv * u_resolution.xy;

  // Scale the coordinate system
  vec2 pos = st * 5.0;

  // Introduce a small, non-uniform, time-dependent distortion
  vec2 timeDistortion = vec2(
      noise(pos + vec2(u_time * 0.3, u_time * 0.5)),
      noise(pos + vec2(u_time * 0.6, u_time * 0.4))
  ) * 0.5;  // Small distortion factor

  pos += timeDistortion;

  // Use the noise function
  float n = noise(pos);

  gl_FragColor = vec4(vec3(n), 1.0);
}
`;

export function NoiseViewer() {
  const shaderMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.DoubleSide,
        uniforms: {
          u_time: { value: 0.0 },
          u_resolution: { value: new THREE.Vector2(1, 1) }, // Initialize with default values
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
      }),
    [],
  );
  useFrame(({ clock }) => {
    shaderMaterial.uniforms.u_time.value = clock.getElapsedTime();
    shaderMaterial.needsUpdate = true;
  });
  return (
    <mesh material={shaderMaterial}>
      <planeGeometry args={[5, 5]} />
    </mesh>
  );
}
