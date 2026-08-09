import * as THREE from 'three'
import { createNoise2D, ridged } from './noise.js'

// The reserve is presented as a physical scale model: a cut block of terrain
// floating in the dark, with visible rock faces on its four sides. Everything
// is generated in the browser — the site ships no heightmap.

export const WIDTH = 100
export const DEPTH = 76
export const MAX_H = 18
export const BASE_H = 7 // depth of the slab below the valley floor

export const ALT_MIN = 1780
export const ALT_MAX = 3240

/** Real metres above sea level -> model units on the Y axis. */
export function altToY(metres) {
  return ((metres - ALT_MIN) / (ALT_MAX - ALT_MIN)) * MAX_H
}

function smoothstep(a, b, x) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/**
 * Height field in model units.
 * u, v are normalised across the block; v = 0 is the far (high) edge.
 */
// Lac Noir. Sited on a bench at roughly 2,300 m rather than on the valley
// floor: ridged noise only makes peaks, so a hollow has to be cut deliberately
// and given a lip, the way a real cirque holds its tarn.
const LAKE_U = 0.84
const LAKE_V = 0.38
const LAKE_R = 0.115 // radius in the warped distance metric below
const LAKE_XS = 1.32 // x is stretched, so the basin comes out roughly round
const LAKE_DEPTH = 2.1 // model units from surface to floor
const RIM_LIFT = 2.6 // how far the surrounding lip is raised

/**
 * The tarn outline, as a radius multiplier at a given bearing. Periodic in
 * theta so it closes cleanly. Both the rock basin and the water surface are
 * built from this, which is what keeps them agreeing — a circular lake in an
 * irregular bowl reads instantly as a pasted-on disc.
 */
export function lakeShape(theta) {
  return (
    1 +
    0.2 * Math.sin(theta * 3 + 0.7) +
    0.11 * Math.sin(theta * 5 - 1.9) +
    0.06 * Math.sin(theta * 8 + 2.6)
  )
}

function lakeDist(u, v) {
  const dx = (u - LAKE_U) * LAKE_XS
  const dz = v - LAKE_V
  const d = Math.sqrt(dx * dx + dz * dz)
  if (d < 1e-6) return 0
  return d / lakeShape(Math.atan2(dz, dx))
}

function makeHeightFn(seed) {
  const noise = createNoise2D(seed)
  const warp = createNoise2D(seed + 977)

  /** The mountain before the tarn is carved into it. */
  function baseHeight(u, v) {
    // domain warp keeps the ridges from looking like plain fBm
    const wx = warp(u * 1.7, v * 1.7) * 0.09
    const wy = warp(u * 1.7 + 5.2, v * 1.7 + 1.3) * 0.09

    // fewer, larger landforms — six octaves at this scale reads as gravel
    let h = ridged(noise, (u + wx) * 2.35 + 11.3, (v + wy) * 1.85 + 4.7, 5)
    h = Math.pow(Math.max(h, 0), 1.24)

    // the massif climbs toward the far edge
    const tilt = 1 - v
    h *= 0.3 + 0.92 * smoothstep(-0.15, 1.05, tilt)

    // a sinuous valley carved through the block
    const valleyX = 0.44 + 0.15 * Math.sin(v * 3.3 + 0.4)
    const valley = smoothstep(0.02, 0.19, Math.abs(u - valleyX))
    h *= 0.14 + 0.86 * valley

    return Math.max(0, h)
  }

  // Fix the water surface just under the local ground, then hang the floor
  // below it. Everything downstream reads these two numbers, so the lake can
  // never end up above its own shoreline.
  const siteH = baseHeight(LAKE_U, LAKE_V) * MAX_H
  const level = siteH - 0.4
  const floor = Math.max(0.6, level - LAKE_DEPTH)

  function height(u, v) {
    let h = baseHeight(u, v) * MAX_H
    const d = lakeDist(u, v)

    // the lip of the cirque: a soft annulus just outside the shore. It picks up
    // the irregular outline from lakeDist, so it never reads as a ring
    const lip = Math.exp(-Math.pow((d - LAKE_R * 1.4) / (LAKE_R * 0.62), 2))
    h += lip * RIM_LIFT

    const bowl = smoothstep(LAKE_R, LAKE_R * 0.3, d)
    return Math.max(0, h * (1 - bowl) + floor * bowl)
  }

  height.lakeFloor = floor
  height.lakeLevel = level
  return height
}

export function buildTerrain({ seed = 7, segX = 216, segZ = 164 } = {}) {
  const height = makeHeightFn(seed)

  const sampleHeight = (x, z) => {
    const u = x / WIDTH + 0.5
    const v = z / DEPTH + 0.5
    return height(Math.min(1, Math.max(0, u)), Math.min(1, Math.max(0, v)))
  }

  const cols = segX + 1
  const rows = segZ + 1

  const positions = []
  const sides = [] // 0 = top surface, 1 = cut face
  const indices = []

  // --- top surface ---------------------------------------------------------
  for (let j = 0; j < rows; j++) {
    const v = j / segZ
    const z = (v - 0.5) * DEPTH
    for (let i = 0; i < cols; i++) {
      const u = i / segX
      const x = (u - 0.5) * WIDTH
      positions.push(x, height(u, v), z)
      sides.push(0)
    }
  }
  for (let j = 0; j < segZ; j++) {
    for (let i = 0; i < segX; i++) {
      const a = j * cols + i
      const b = a + 1
      const c = a + cols
      const d = c + 1
      indices.push(a, c, b, b, c, d)
    }
  }

  // --- cut faces on the four sides ----------------------------------------
  const addWall = (edge, flip) => {
    const start = positions.length / 3
    for (let k = 0; k < edge.length; k++) {
      const [x, y, z] = edge[k]
      positions.push(x, y, z, x, -BASE_H, z)
      sides.push(1, 1)
    }
    for (let k = 0; k < edge.length - 1; k++) {
      const t0 = start + k * 2
      const b0 = t0 + 1
      const t1 = t0 + 2
      const b1 = t1 + 1
      if (flip) indices.push(t0, b0, t1, t1, b0, b1)
      else indices.push(t0, t1, b0, b0, t1, b1)
    }
  }

  const topAt = (i, j) => {
    const o = (j * cols + i) * 3
    return [positions[o], positions[o + 1], positions[o + 2]]
  }

  const north = [] // j = 0
  const south = [] // j = segZ
  for (let i = 0; i < cols; i++) {
    north.push(topAt(i, 0))
    south.push(topAt(i, segZ))
  }
  const west = [] // i = 0
  const east = [] // i = segX
  for (let j = 0; j < rows; j++) {
    west.push(topAt(0, j))
    east.push(topAt(segX, j))
  }
  addWall(north, true)
  addWall(south, false)
  addWall(west, false)
  addWall(east, true)

  // --- bottom --------------------------------------------------------------
  const bStart = positions.length / 3
  const hw = WIDTH / 2
  const hd = DEPTH / 2
  positions.push(-hw, -BASE_H, -hd, hw, -BASE_H, -hd, -hw, -BASE_H, hd, hw, -BASE_H, hd)
  sides.push(1, 1, 1, 1)
  indices.push(bStart, bStart + 1, bStart + 2, bStart + 2, bStart + 1, bStart + 3)

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('aSide', new THREE.Float32BufferAttribute(sides, 1))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()

  // --- material ------------------------------------------------------------
  const uniforms = {
    uSnowline: { value: altToY(2450) },
    uTreeline: { value: altToY(2180) },
    uRock: { value: new THREE.Color('#6a6259') },
    uForest: { value: new THREE.Color('#20302c') },
    uSnow: { value: new THREE.Color('#e8e4dc') },
    uCut: { value: new THREE.Color('#14181c') },
    uContour: { value: new THREE.Color('#e0573a') },
    uContourStep: { value: MAX_H / 26 },
    uContourStrength: { value: 0.13 },
  }

  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.96,
    metalness: 0,
    flatShading: false,
  })

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
         attribute float aSide;
         varying float vSide;
         varying vec3 vWPos;
         varying vec3 vONormal;`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
         vSide = aSide;
         vONormal = normal;
         vWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`,
      )

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
         varying float vSide;
         varying vec3 vWPos;
         varying vec3 vONormal;
         uniform float uSnowline;
         uniform float uTreeline;
         uniform vec3 uRock;
         uniform vec3 uForest;
         uniform vec3 uSnow;
         uniform vec3 uCut;
         uniform vec3 uContour;
         uniform float uContourStep;
         uniform float uContourStrength;`,
      )
      .replace(
        'vec4 diffuseColor = vec4( diffuse, opacity );',
        `float alt = vWPos.y;
         float slope = clamp(vONormal.y, 0.0, 1.0);

         float snowAmt = smoothstep(uSnowline - 1.7, uSnowline + 1.7, alt);
         snowAmt *= smoothstep(0.30, 0.70, slope);

         float forestAmt = 1.0 - smoothstep(uTreeline - 2.4, uTreeline + 0.5, alt);
         forestAmt *= smoothstep(0.40, 0.78, slope);
         forestAmt *= smoothstep(0.15, 1.2, alt);

         vec3 surf = uRock;
         surf = mix(surf, uForest, forestAmt);
         surf = mix(surf, uSnow, snowAmt);

         // survey contours, drawn only on the top surface
         float band = alt / uContourStep;
         float bw = fwidth(band);
         float f = abs(fract(band) - 0.5);
         float line = 1.0 - smoothstep(0.0, max(bw, 0.0001) * 1.2, f);
         surf = mix(surf, uContour, line * uContourStrength * (1.0 - vSide));

         // the cut faces read as sawn rock so the block reads as an object
         surf = mix(surf, uCut, vSide);

         vec4 diffuseColor = vec4( surf, opacity );`,
      )
  }
  material.customProgramCacheKey = () => 'arven-terrain'

  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = 'reserve-model'

  // Where the water sits, plus the outline the surface mesh is built on.
  // `boundary` returns an offset from the lake centre in world units, so the
  // water grid can be laid out over exactly the same shape as the basin.
  const lake = {
    x: (LAKE_U - 0.5) * WIDTH,
    z: (LAKE_V - 0.5) * DEPTH,
    level: height.lakeLevel,
    boundary(theta, t = 1) {
      const r = LAKE_R * lakeShape(theta) * t
      return [((Math.cos(theta) * r) / LAKE_XS) * WIDTH, Math.sin(theta) * r * DEPTH]
    },
  }

  return { mesh, geometry, material, uniforms, sampleHeight, lake }
}
