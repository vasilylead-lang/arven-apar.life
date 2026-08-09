import * as THREE from 'three'

// The living layer: choughs working the thermals over the block. Silhouettes
// only — they read as birds because of how they move, not how they are shaded.
// Flapping happens in the vertex shader; the flock path is stepped on the CPU,
// which is comfortably cheap at this count.

const VERT = /* glsl */ `
  attribute float aWing;
  attribute float aPhase;
  attribute float aFlap;
  uniform float uTime;
  uniform float uSpeed;
  varying float vFog;

  void main() {
    vec3 p = position;
    float wing = abs(aWing);
    if (wing > 0.001) {
      float beat = sin(uTime * aFlap * uSpeed + aPhase);
      p.y += beat * 0.42 * wing;
      p.x *= 1.0 - 0.16 * wing * (1.0 - beat * 0.5);
    }
    vec4 mv = modelViewMatrix * instanceMatrix * vec4(p, 1.0);
    vFog = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  uniform vec3 uFogColor;
  uniform float uFogDensity;
  uniform float uOpacity;
  varying float vFog;

  void main() {
    float f = 1.0 - exp(-uFogDensity * uFogDensity * vFog * vFog);
    vec3 c = mix(uColor, uFogColor, clamp(f, 0.0, 1.0));
    gl_FragColor = vec4(c, uOpacity * (1.0 - clamp(f, 0.0, 1.0) * 0.85));
  }
`

function birdGeometry() {
  // nose, tail, two swept wingtips — a classic gliding silhouette
  // A slight dihedral on the wingtips: flat triangles read as paper darts,
  // a shallow V reads as a bird from almost any angle.
  const positions = new Float32Array([
    // left wing triangle: nose, left tip, tail
    0, 0, 0.9, -1.0, 0.2, -0.25, 0, 0, -0.7,
    // right wing triangle: nose, tail, right tip
    0, 0, 0.9, 0, 0, -0.7, 1.0, 0.2, -0.25,
  ])
  const wing = new Float32Array([0, 1, 0, 0, 0, 1])

  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  g.setAttribute('aWing', new THREE.BufferAttribute(wing, 1))
  return g
}

export function buildBirds({ count = 150 } = {}) {
  const geometry = birdGeometry()

  const phase = new Float32Array(count)
  const flap = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    phase[i] = Math.random() * Math.PI * 2
    flap[i] = 5.5 + Math.random() * 4.5
  }
  geometry.setAttribute('aPhase', new THREE.InstancedBufferAttribute(phase, 1))
  geometry.setAttribute('aFlap', new THREE.InstancedBufferAttribute(flap, 1))

  const uniforms = {
    uTime: { value: 0 },
    uSpeed: { value: 1 },
    uColor: { value: new THREE.Color('#0b0e10') },
    uFogColor: { value: new THREE.Color('#101a2a') },
    uFogDensity: { value: 0.0062 },
    uOpacity: { value: 0.85 },
  }

  const material = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  })

  const mesh = new THREE.InstancedMesh(geometry, material, count)
  mesh.frustumCulled = false
  mesh.name = 'colony'

  // per-bird thermal: an ellipse it turns on, at its own altitude and rate
  const flock = []
  for (let i = 0; i < count; i++) {
    const cluster = i % 3
    const cx = [-18, 8, 26][cluster] + (Math.random() - 0.5) * 34
    const cz = [10, -14, 2][cluster] + (Math.random() - 0.5) * 34
    flock.push({
      cx,
      cz,
      rx: 6 + Math.random() * 22,
      rz: 5 + Math.random() * 18,
      y: 21 + Math.random() * 22,
      bob: 0.7 + Math.random() * 2.2,
      rate: (0.06 + Math.random() * 0.13) * (Math.random() < 0.35 ? -1 : 1),
      off: Math.random() * Math.PI * 2,
      // the block is 100 units across; anything near 1 unit reads as an aircraft
      scale: 0.22 + Math.random() * 0.36,
    })
  }

  const dummy = new THREE.Object3D()

  function update(t) {
    for (let i = 0; i < count; i++) {
      const b = flock[i]
      const a = t * b.rate + b.off
      const x = b.cx + Math.cos(a) * b.rx
      const z = b.cz + Math.sin(a) * b.rz
      const y = b.y + Math.sin(t * 0.5 + b.off) * b.bob

      // heading is the tangent of the ellipse
      const dx = -Math.sin(a) * b.rx * b.rate
      const dz = Math.cos(a) * b.rz * b.rate

      dummy.position.set(x, y, z)
      dummy.rotation.set(0, Math.atan2(dx, dz), 0)
      dummy.rotateZ(Math.sign(b.rate) * 0.34)
      dummy.scale.setScalar(b.scale)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
    uniforms.uTime.value = t
  }

  update(0)

  return { mesh, material, uniforms, update }
}
