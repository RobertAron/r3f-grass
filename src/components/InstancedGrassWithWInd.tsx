import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import grassVert from "./grass_vert.glsl";
import { useGLTF } from "@react-three/drei";

export function InstancedThing2({ texture }: { texture: THREE.DataTexture }) {
  const count = texture.image.width * texture.image.height;
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Create an array with instance indices
  const instanceIndex = useMemo(
    () => new Float32Array(count).map((_, index) => index),
    [count],
  );
  const { nodes } = useGLTF("/grassblade.glb");
  const geometry = useMemo(() => {
    const sphere = nodes.Sphere;
    if (sphere === undefined) return null;
    if ("geometry" in sphere) return sphere.geometry as THREE.BufferGeometry;
    return null;
  }, [nodes]);

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
      emissiveIntensity: 0.1,
      roughness: 0.1, // Rougher surface to match the texture of grass
      metalness: 0, // No metalness for organic material
      flatShading: false,
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
        frustumCulled={false}
        ref={meshRef}
        args={[geometry === null ? undefined : geometry, undefined, count]}
        material={phongMaterial}
        position={[0, 0, 0]}
      />
    </>
  );
}
