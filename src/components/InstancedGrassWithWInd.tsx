import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import grassVert from "./grass_vert.glsl";

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
    const material = new THREE.MeshStandardMaterial({
      color: 0x228b22, // Grass-like green color
      emissive: 0x1a682e, // Dark green emissive color to simulate light passing through
      emissiveIntensity:.1,
      roughness: 0.1, // Rougher surface to match the texture of grass
      metalness: 0, // No metalness for organic material
      // transparent: true, // Enable transparency
      
      opacity: 0.95, // Slightly transparent to allow light to pass through
    });

    material.onBeforeCompile = (shader) => {
      console.log(shader.vertexShader);
      shaderRef.current = shader;
      shader.vertexShader = grassVert;

      shader.uniforms.uTime = { value: 0 };
      shader.uniforms.textureData = { value: texture };
      shader.uniforms.textureWidth = { value: texture.image.width };
      shader.uniforms.textureHeight = { value: texture.image.height };
      shader.uniforms.shininess = { value: 30 };
      return shader;
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
        material={phongMaterial}
        position={[0, 2.5, 0]}
      >
        <cylinderGeometry args={[1, 1, 5, 30, 30]} />
      </instancedMesh>
    </>
  );
}
