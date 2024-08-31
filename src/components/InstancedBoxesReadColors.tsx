import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
const vertexShader = /*glsl*/ `
attribute float instanceIndex;
uniform sampler2D textureData;
uniform float textureWidth;
uniform float textureHeight;
varying vec3 vNormal;
varying vec3 vViewDir;

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
  float scaleX = 1.0;//texData.r * 5.0;
  float scaleY = 1.0;//texData.g * 5.0;
  float scaleZ = 1.0;//texData.b * 5.0;

  // Apply scaling based on the RGB values
  vec3 transformed = position;
  transformed *= vec3(scaleX,scaleY,scaleZ);

  // Offset the position based on instance index
  transformed.x += x * textureWidth - (textureWidth / 2.0);
  transformed.y += scaleY/2.0;
  transformed.z += y * textureHeight - (textureHeight / 2.0);

  // Usual model-view-projection calculations
  vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 clipPosition = projectionMatrix * viewPosition;
  gl_Position = projectionMatrix * mvPosition;
  vViewDir = normalize(-viewPosition.xyz);
  vNormal = normalize(normalMatrix * normal);
}
`;

// https://github.com/mrdoob/three.js/blob/3e6ab2d9c7f2d8e8d798aa5e1f628e25149e808c/examples/jsm/shaders/ToonShader.js
// https://www.maya-ndljk.com/blog/threejs-basic-toon-shader
// Fragment Shader (simple pass-through)
const fragmentShader = /*glsl*/ `
// https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/lights_pars_begin.glsl.js
#include <common>
#include <lights_pars_begin>

uniform vec3 uColor;
uniform float uGlossiness;

varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
  float NdotL = dot(vNormal, directionalLights[0].direction);
  float lightIntensity = smoothstep(0.0, 0.01, NdotL);
  vec3 directionalLight = directionalLights[0].color * lightIntensity;

  // specular reflection
  vec3 halfVector = normalize(directionalLights[0].direction + vViewDir);
  float NdotH = dot(vNormal, halfVector);

  float specularIntensity = pow(NdotH * lightIntensity, 1000.0 / uGlossiness);
  float specularIntensitySmooth = smoothstep(0.05, 0.1, specularIntensity);

  vec3 specular = specularIntensitySmooth * directionalLights[0].color;

  // rim lighting
  float rimDot = 1.0 - dot(vViewDir, vNormal);
  float rimAmount = 0.3;

  float rimThreshold = 0.002;
  float rimIntensity = rimDot * pow(NdotL, rimThreshold);
  rimIntensity = smoothstep(rimAmount - 0.01, rimAmount + 0.01, rimIntensity);

  vec3 rim = rimIntensity * directionalLights[0].color;

  gl_FragColor = vec4(uColor * (directionalLight + ambientLightColor + specular + rim), 1.0);
}
`;

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
      lights: true,
      uniforms: {
        ...THREE.UniformsLib.lights,
        uColor: { value: new THREE.Color("#6495ED") },
        uGlossiness: { value: 1 },
        textureData: { value: texture },
        textureWidth: { value: texture.image.width },
        textureHeight: { value: texture.image.height },
      },
    });
  }, [texture]);
  return (
    <>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, count]}
        castShadow
      >
        <cylinderGeometry args={[0.1, 0.5, 5, 10, 10]} />
        {/* [radiusTop?: number | undefined, radiusBottom?: number | undefined, height?: number | undefined, radialSegments?: number | undefined, heightSegments?: number | undefined, openEnded?: boolean | undefined, thetaStart?: number | undefined, thetaLength?: number | undefined] */}
        <primitive object={shaderMaterial} attach="material" />
      </instancedMesh>
    </>
  );
}
