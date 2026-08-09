import * as THREE from 'three'

// Lac Noir.
//
// The surface is a radial grid laid over the same outline the rock basin was
// carved from, and every vertex carries the water depth under it, sampled off
// the height field. That does two things a flat disc cannot: the colour runs
// from silt at the margin to near-black over the deep, and the shoreline is
// the true rock/water intersection rather than the edge of a circle — so it
// comes out irregular, for free, and always matches the rock.

const VERT = /* glsl */ `
  attribute float aDepth;
  varying float vDepth;
  varying vec3 vWorld;
  varying float vFog;

  void main() {
    vDepth = aDepth;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vec4 mv = viewMatrix * world;
    vFog = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const FRAG = /* glsl */ `
  precision highp float;

  uniform vec3 uDeep;
  uniform vec3 uShallow;
  uniform vec3 uSheen;
  uniform vec3 uSky;
  uniform vec3 uFogColor;
  uniform vec3 uCamera;
  uniform vec3 uSunDir;
  uniform float uFogDensity;
  uniform float uTime;
  uniform float uSunUp;

  varying float vDepth;
  varying vec3 vWorld;
  varying float vFog;

  void main() {
    // anything the rock already rises above is not water
    if (vDepth <= 0.015) discard;

    // silt and stones show through the shallows; the middle goes black
    float deep = smoothstep(0.05, 1.15, vDepth);
    vec3 base = mix(uShallow, uDeep, deep);

    // ripples tilt the normal only — the surface itself stays flat
    float r1 = sin(vWorld.x * 2.3 + uTime * 0.45);
    float r2 = sin(vWorld.z * 3.1 - uTime * 0.33);
    float r3 = sin((vWorld.x + vWorld.z) * 1.4 + uTime * 0.2);
    vec3 n = normalize(vec3((r1 + r3) * 0.05, 1.0, (r2 + r3) * 0.05));

    vec3 viewDir = normalize(uCamera - vWorld);
    vec3 sunDir = normalize(uSunDir);
    // NB: "half" is a reserved word in GLSL and will not link
    vec3 halfDir = normalize(sunDir + viewDir);

    float glint = pow(max(dot(n, halfDir), 0.0), 260.0);
    float sheen = pow(max(dot(n, halfDir), 0.0), 16.0) * 0.09;
    // still water throws the sky back at you at grazing angles
    float fresnel = pow(1.0 - max(dot(n, viewDir), 0.0), 5.0);

    vec3 c = base;
    c += uSheen * (glint * 1.6 + sheen) * uSunUp;
    // grazing angles show the sky, not the sun — this is what stops a dark
    // tarn reading as a hole cut in the rock
    c = mix(c, uSky, fresnel * 0.55);
    // the margin catches a little more light, as wet stone does
    c += uShallow * (1.0 - deep) * 0.12;

    float f = 1.0 - exp(-uFogDensity * uFogDensity * vFog * vFog);
    gl_FragColor = vec4(mix(c, uFogColor, clamp(f, 0.0, 1.0)), 1.0);
  }
`

export function buildWater({ lake, sampleHeight, rings = 44, segments = 128 }) {
  const positions = []
  const depths = []
  const indices = []

  const smoothstep = (a, b, x) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
    return t * t * (3 - 2 * t)
  }

  const OUTER = 1.18

  const push = (dx, dz, t) => {
    const y = sampleHeight(lake.x + dx, lake.z + dz)
    // Taper the depth to nothing at the outer ring. Where the rock already
    // rises above the surface it decides the shoreline; where it doesn't, this
    // fades the water out instead of leaving a cut edge at the mesh boundary.
    const fade = 1 - smoothstep(OUTER * 0.78, OUTER, t)
    positions.push(dx, 0, dz)
    depths.push((lake.level - y) * fade)
  }

  push(0, 0, 0) // centre

  for (let i = 1; i <= rings; i++) {
    const t = (i / rings) * OUTER
    for (let j = 0; j < segments; j++) {
      const theta = (j / segments) * Math.PI * 2
      const [dx, dz] = lake.boundary(theta, t)
      push(dx, dz, t)
    }
  }

  const ringStart = (i) => 1 + (i - 1) * segments

  for (let j = 0; j < segments; j++) {
    indices.push(0, ringStart(1) + ((j + 1) % segments), ringStart(1) + j)
  }
  for (let i = 1; i < rings; i++) {
    const a = ringStart(i)
    const b = ringStart(i + 1)
    for (let j = 0; j < segments; j++) {
      const k = (j + 1) % segments
      indices.push(a + j, b + k, b + j)
      indices.push(a + j, a + k, b + k)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('aDepth', new THREE.Float32BufferAttribute(depths, 1))
  geometry.setIndex(indices)
  geometry.computeBoundingSphere()

  const uniforms = {
    uDeep: { value: new THREE.Color('#070d12') },
    uShallow: { value: new THREE.Color('#243039') },
    uSheen: { value: new THREE.Color('#ff8a52') },
    uSky: { value: new THREE.Color('#2a3348') },
    uFogColor: { value: new THREE.Color('#16233a') },
    uCamera: { value: new THREE.Vector3() },
    uSunDir: { value: new THREE.Vector3(0, 1, 0) },
    uFogDensity: { value: 0.0055 },
    uTime: { value: 0 },
    uSunUp: { value: 1 },
  }

  const material = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms,
    fog: false,
    // a flat surface only ever needs one face, but the radial fan's winding is
    // easy to get backwards and costs nothing to make moot
    side: THREE.DoubleSide,
  })

  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(lake.x, lake.level, lake.z)
  mesh.name = 'lac-noir'
  mesh.renderOrder = 1

  return { mesh, material, uniforms }
}
