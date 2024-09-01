import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
const vertexShader = /*glsl*/ `
attribute float instanceIndex;
uniform sampler2D textureData;
uniform float textureWidth;
uniform float textureHeight;
varying vec3 vNormal;
varying vec3 vViewDir;
uniform float uTime;
varying vec4 vColor;

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
  // Calculate UV based on instanceIndex
  float x = mod(instanceIndex, textureWidth) / textureWidth;
  float y = floor(instanceIndex / textureWidth) / textureHeight;
  vec2 uv = vec2(x, y);
  vec2 pos = vec2(x,y) * 5.0;

  // Introduce a small, non-uniform, time-dependent distortion
  vec2 timeDistortion = vec2(
      noise(pos + vec2(uTime * 0.3, uTime * 0.5)),
      noise(pos + vec2(uTime * 0.6, uTime * 0.4))
  ) * 0.5;  // Small distortion factor

  pos += timeDistortion;

  // Use the noise function
  float n = noise(pos) - 0.5;


  // Sample the texture data at this UV
  vec4 texData = texture2D(textureData, uv);
  vColor = texData;

  // Extract the RGB components for scaling factors
  float yCentered = position.y + 2.5;
  float scaleX = (1.0-(yCentered/5.0)) * 1.0;//texData.r * 5.0;
  float scaleY = 1.0;//texData.g * 5.0;
  float scaleZ = (1.0-(yCentered/5.0)) * 1.0;//texData.b * 5.0;

  // Apply scaling based on the RGB values
  vec3 transformed = position;
  transformed *= vec3(scaleX,scaleY,scaleZ);

  // Offset the position based on instance index
  transformed.x += x * textureWidth - (textureWidth / 2.0);
  transformed.y += scaleY/2.0;
  transformed.z += y * textureHeight - (textureHeight / 2.0);

  transformed.x += yCentered * n;
  transformed.z += yCentered * n;

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
#include <common>
#include <lights_phong_pars_fragment>
#include <map_pars_fragment>
#include <normal_pars_fragment>
#include <fog_pars_fragment>

varying vec3 vNormal;
varying vec3 vViewDir;
varying vec4 vColor;

uniform float shininess;

void main() {
    // Normalize the normal and view direction
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewDir);

    // Initialize the lighting components
    vec3 diffuse = vec3(0.0);
    vec3 specular = vec3(0.0);
    vec3 ambient = vec3(0.0);

    #if NUM_DIR_LIGHTS > 0
        for (int i = 0; i < NUM_DIR_LIGHTS; i++) {
            vec3 lightDir = normalize(directionalLights[i].direction);
            float diff = max(dot(normal, lightDir), 0.0);
            diffuse += directionalLights[i].color * diff * vColor.rgb;

            // Specular component (Phong reflection model)
            vec3 reflectDir = reflect(-lightDir, normal);
            float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
            specular += spec * directionalLights[i].color;
        }
    #endif

    // Ambient lighting
    ambient += ambientLightColor * vColor.rgb;

    // Combine the lighting components
    vec3 finalColor = ambient + diffuse + specular;

    gl_FragColor = vec4(finalColor, vColor.a);
}
`;

export function InstancedThing2({ texture }: { texture: THREE.DataTexture }) {
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

  const shaderRef = useRef<THREE.WebGLProgramParametersWithUniforms>();

  const phongMaterial = useMemo(() => {
    const material = new THREE.MeshPhongMaterial({
      color: 'green',
    });

    material.onBeforeCompile = (shader) => {
      console.log(shader.vertexShader)
      shaderRef.current = shader;
      shader.vertexShader = /*glsl */`
      attribute float instanceIndex;
      uniform sampler2D textureData;
      uniform float textureWidth;
      uniform float textureHeight;
      uniform float uTime;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      varying vec4 vColor;
      varying vec3 vViewPosition;
      
      // 2D Random
      float random(in vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }
      
      // 2D Noise
      float noise(in vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) +
          (c - a) * u.y * (1.0 - u.x) +
          (d - b) * u.x * u.y;
      }
      
      void main() {
        // Calculate UV based on instanceIndex
        float x = mod(instanceIndex, textureWidth) / textureWidth;
        float y = floor(instanceIndex / textureWidth) / textureHeight;
        vec2 uv = vec2(x, y);
        vec2 pos = vec2(x, y) * 5.0;
      
        // Time-dependent distortion
        vec2 timeDistortion = vec2(
            noise(pos + vec2(uTime * 0.3, uTime * 0.5)),
            noise(pos + vec2(uTime * 0.6, uTime * 0.4))
        ) * 0.5;  // Small distortion factor
      
        pos += timeDistortion;
      
        float n = noise(pos) - 0.5;
        vec4 texData = texture2D(textureData, uv);
        vColor = texData;
      
        float yCentered = position.y + 2.5;
        float scaleX = (1.0 - (yCentered / 5.0)) * 1.0;
        float scaleY = 1.0;
        float scaleZ = (1.0 - (yCentered / 5.0)) * 1.0;
      
        vec3 transformed = position;
        transformed *= vec3(scaleX, scaleY, scaleZ);
      
        transformed.x += x * textureWidth - (textureWidth / 2.0);
        transformed.y += scaleY / 2.0;
        transformed.z += y * textureHeight - (textureHeight / 2.0);
      
        transformed.x += yCentered * n;
        transformed.z += yCentered * n;
      
        vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
        gl_Position = projectionMatrix * mvPosition;
      
        // Pass the view-space position to the fragment shader
        vViewPosition = mvPosition.xyz;
      
        // Calculate view direction and normal
        vViewDir = normalize(-mvPosition.xyz);
        vNormal = normalize(normalMatrix * normal);
      }      
      `;

      shader.uniforms.uTime = { value: 0 };
      shader.uniforms.textureData = { value: texture };
      shader.uniforms.textureWidth = { value: texture.image.width };
      shader.uniforms.textureHeight = { value: texture.image.height };
      shader.uniforms.shininess = { value: 30 };
    };

    return material;
  }, [texture]);
  useFrame(({ clock }) => {

    if (shaderRef.current)
      shaderRef.current.uniforms.uTime.value = clock.getElapsedTime();
  });
  return (
    <>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, count]}
        castShadow
        position={[0, 2, 0]}
        material={phongMaterial}
      >
        <boxGeometry args={[1, 5, 1, 5, 5, 5]} />
      </instancedMesh>
    </>
  );
}
