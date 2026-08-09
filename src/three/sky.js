import * as THREE from 'three'

// A gradient dome with a warm bloom around the sun bearing, plus procedural
// stars that only surface in the night preset. Cheaper and calmer than a
// physical sky model, and it lets the four atmospheres be art-directed.

const VERT = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uTop;
  uniform vec3 uHorizon;
  uniform vec3 uGlow;
  uniform vec3 uSunDir;
  uniform float uGlowStrength;
  uniform float uStars;
  varying vec3 vDir;

  float hash(vec3 p) {
    p = fract(p * vec3(443.897, 441.423, 437.195));
    p += dot(p, p.yzx + 19.19);
    return fract((p.x + p.y) * p.z);
  }

  void main() {
    vec3 dir = normalize(vDir);
    float h = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);

    vec3 c = mix(uHorizon, uTop, pow(h, 0.85));

    // A tight core on the sun bearing plus a low band hugging the horizon.
    // Keeping both narrow is what stops the whole dome going orange.
    float sun = max(dot(dir, normalize(uSunDir)), 0.0);
    float horizonBand = pow(1.0 - abs(dir.y), 9.0);
    c += uGlow * pow(sun, 42.0) * uGlowStrength * 0.8;
    c += uGlow * pow(sun, 6.0) * horizonBand * uGlowStrength * 0.30;

    if (uStars > 0.001) {
      vec3 g = floor(dir * 260.0);
      float s = hash(g);
      float star = smoothstep(0.9975, 1.0, s) * smoothstep(-0.05, 0.35, dir.y);
      c += vec3(star) * uStars;
    }

    gl_FragColor = vec4(c, 1.0);
  }
`

export function buildSky() {
  const uniforms = {
    uTop: { value: new THREE.Color('#060a14') },
    uHorizon: { value: new THREE.Color('#2a3348') },
    uGlow: { value: new THREE.Color('#e0573a') },
    uSunDir: { value: new THREE.Vector3(1, 0.1, 0) },
    uGlowStrength: { value: 1 },
    uStars: { value: 0 },
  }

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(600, 32, 20),
    new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
    }),
  )
  mesh.name = 'sky'
  mesh.renderOrder = -1
  mesh.frustumCulled = false

  return { mesh, uniforms }
}
