#define PHONG

attribute float instanceIndex;
uniform sampler2D textureData;
uniform float textureWidth;
uniform float textureHeight;
uniform float uTime;
varying vec4 vColor;
varying vec3 vViewPosition;

#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

float random(in vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

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

float remap(float inputValue, float inputMin, float inputMax, float outputMin, float outputMax) {
  return outputMin + (inputValue - inputMin) * (outputMax - outputMin) / (inputMax - inputMin);
}

void main() {
    // Calculate UV based on instanceIndex
  float x = mod(instanceIndex, textureWidth) / textureWidth;
  float y = floor(instanceIndex / textureWidth) / textureHeight;
  vec2 uv = vec2(x, y);
  vec2 pos = vec2(x, y) * 5.0;

  // Time-dependent distortion
  vec2 timeDistortion = vec2(noise(pos + vec2(uTime * 0.3, uTime * 0.5)), noise(pos + vec2(uTime * 0.6, uTime * 0.4))) * 0.5;  // Small distortion factor
  pos += timeDistortion;

  float n = noise(pos) - 0.5;
  vec4 texData = texture2D(textureData, uv);
  // vColor = texData;

  vec3 transformed = position;

  // offset based on texture position
  float xOffset = remap(x, 0.0, 1.0, -4.0, 4.0);
  float zOffset = remap(y, 0.0, 1.0, -4.0, 4.0);
  transformed.x += xOffset;
  transformed.z += zOffset;

  transformed.x += transformed.y * n;
  transformed.z += transformed.y * n;

  // Standard vertex shader processing
  #include <uv_vertex>
  #include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
  #include <morphnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  #include <defaultnormal_vertex>
  #include <normal_vertex>
  // #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <skinning_vertex>
  #include <displacementmap_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  vViewPosition = -mvPosition.xyz;
  #include <worldpos_vertex>
  #include <envmap_vertex>
  #include <shadowmap_vertex>
  #include <fog_vertex>
}