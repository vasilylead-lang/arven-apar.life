import * as THREE from 'three'
import gsap from 'gsap'
import { buildTerrain, altToY, WIDTH, DEPTH } from './terrain.js'
import { buildSky } from './sky.js'
import { buildBirds } from './birds.js'
import { ATMOSPHERES } from '../data/atmospheres.js'
import { LOCATIONS } from '../data/site.js'

// Camera poses, one per narrative beat. The page scrubs between neighbours.
const POSES = [
  { pos: [-38, 30, 78], tgt: [0, 5, 4] }, // 0 arrival
  { pos: [2, 64, 62], tgt: [0, 2, -2] }, // 1 the reserve — survey view
  { pos: [46, 19, 42], tgt: [-6, 8, -6] }, // 2 atmosphere — raking light
  { pos: [10, 36, 28], tgt: [6, 15, -10] }, // 3 the colony — up among the birds
  { pos: [30, 15, 26], tgt: [20, 7, 4] }, // 4 the settlement — close on Les Caches
  { pos: [0, 104, 10], tgt: [0, 0, 0] }, // 5 the collection — pull back to plan
  { pos: [-24, 27, 84], tgt: [0, 6, 0] }, // 6 enquire
]

const DEG = Math.PI / 180

export function createScene({ canvas, reducedMotion = false }) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
    alpha: false,
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.12
  renderer.shadowMap.enabled = !reducedMotion
  renderer.shadowMap.type = THREE.PCFShadowMap

  const scene = new THREE.Scene()
  const fog = new THREE.FogExp2('#101a2a', 0.0062)
  scene.fog = fog

  const camera = new THREE.PerspectiveCamera(38, 1, 0.5, 1400)
  camera.position.set(...POSES[0].pos)

  // --- contents -------------------------------------------------------------
  const sky = buildSky()
  scene.add(sky.mesh)

  const terrain = buildTerrain()
  terrain.mesh.castShadow = !reducedMotion
  terrain.mesh.receiveShadow = !reducedMotion
  scene.add(terrain.mesh)

  // Lac Noir. Position, level and radius all come from the carved basin, so
  // the water can never end up sitting proud of the rock.
  const water = new THREE.Mesh(
    new THREE.CircleGeometry(terrain.lake.radius, 56),
    new THREE.MeshStandardMaterial({
      color: '#33485c',
      roughness: 0.34,
      metalness: 0.08,
    }),
  )
  water.rotation.x = -Math.PI / 2
  water.position.set(terrain.lake.x, terrain.lake.level, terrain.lake.z)
  scene.add(water)

  const birds = buildBirds({ count: reducedMotion ? 36 : 96 })
  scene.add(birds.mesh)

  // --- lights ---------------------------------------------------------------
  const sun = new THREE.DirectionalLight('#ff7a45', 3.1)
  sun.castShadow = !reducedMotion
  sun.shadow.mapSize.set(2048, 2048)
  sun.shadow.bias = -0.0009
  sun.shadow.normalBias = 0.6
  const sc = sun.shadow.camera
  sc.near = 40
  sc.far = 420
  sc.left = -70
  sc.right = 70
  sc.top = 70
  sc.bottom = -70
  sc.updateProjectionMatrix()
  scene.add(sun)
  scene.add(sun.target)

  const ambient = new THREE.HemisphereLight('#3d5878', '#1c2733', 0.55)
  scene.add(ambient)

  // --- atmosphere -----------------------------------------------------------
  const state = {
    sunAz: ATMOSPHERES[0].sun.azimuth,
    sunEl: ATMOSPHERES[0].sun.elevation,
    snowline: altToY(ATMOSPHERES[0].snowline),
    treeline: altToY(ATMOSPHERES[0].treeline),
    birdSpeed: 1,
    birdOpacity: 0.85,
    stars: 0,
    exposure: 1.12,
  }

  function placeSun() {
    const r = 210
    const el = state.sunEl * DEG
    const az = state.sunAz * DEG
    sun.position.set(
      Math.cos(el) * Math.sin(az) * r,
      Math.max(Math.sin(el) * r, -40),
      Math.cos(el) * Math.cos(az) * r,
    )
    sky.uniforms.uSunDir.value.copy(sun.position).normalize()
  }
  placeSun()

  let current = ATMOSPHERES[0]

  function applyAtmosphere(id, { immediate = false } = {}) {
    const a = ATMOSPHERES.find((x) => x.id === id)
    if (!a) return
    current = a
    const d = immediate || reducedMotion ? 0 : 1.5
    const ease = 'power2.inOut'
    const tw = (target, vars) => gsap.to(target, { duration: d, ease, ...vars })

    tw(sun.color, colorTo(a.sun.color))
    tw(sun, { intensity: a.sun.intensity })
    tw(ambient.color, colorTo(a.ambient.color))
    tw(ambient, { intensity: a.ambient.intensity })
    tw(fog.color, colorTo(a.fog.color))
    tw(fog, { density: a.fog.density })
    tw(sky.uniforms.uTop.value, colorTo(a.sky.top))
    tw(sky.uniforms.uHorizon.value, colorTo(a.sky.horizon))
    tw(sky.uniforms.uGlow.value, colorTo(a.sky.glow))
    tw(terrain.uniforms.uRock.value, colorTo(a.palette.rock))
    tw(terrain.uniforms.uForest.value, colorTo(a.palette.forest))
    tw(terrain.uniforms.uSnow.value, colorTo(a.palette.snow))
    tw(birds.uniforms.uColor.value, colorTo(a.birds.color))
    tw(birds.uniforms.uFogColor.value, colorTo(a.fog.color))
    tw(terrain.uniforms.uSnowline, { value: altToY(a.snowline) })
    tw(terrain.uniforms.uTreeline, { value: altToY(a.treeline) })
    tw(birds.uniforms.uOpacity, { value: a.birds.opacity })
    tw(birds.uniforms.uFogDensity, { value: a.fog.density })
    tw(sky.uniforms.uGlowStrength, { value: a.glow ?? 1 })
    tw(state, {
      sunAz: a.sun.azimuth,
      sunEl: a.sun.elevation,
      birdSpeed: a.birds.speed,
      stars: a.id === 'nachtblau' ? 0.9 : 0,
      exposure: a.id === 'whiteout' ? 0.95 : a.id === 'nachtblau' ? 1.4 : 1.45,
      onUpdate: placeSun,
    })
    markDirty()
  }

  function colorTo(hex) {
    const c = new THREE.Color(hex)
    return { r: c.r, g: c.g, b: c.b }
  }

  // --- camera ---------------------------------------------------------------
  const pose = {
    pos: new THREE.Vector3(...POSES[0].pos),
    tgt: new THREE.Vector3(...POSES[0].tgt),
  }
  const parallax = { x: 0, y: 0 }
  const pointer = { x: 0, y: 0 }
  const orbit = { az: 0, el: 0 }
  const orbitTarget = { az: 0, el: 0 }
  const focus = { active: false, pos: new THREE.Vector3(), tgt: new THREE.Vector3() }

  const a3 = new THREE.Vector3()
  const b3 = new THREE.Vector3()

  function setPoseBlend(from, to, t) {
    const A = POSES[Math.max(0, Math.min(POSES.length - 1, from))]
    const B = POSES[Math.max(0, Math.min(POSES.length - 1, to))]
    const k = Math.max(0, Math.min(1, t))
    a3.set(...A.pos)
    b3.set(...B.pos)
    pose.pos.lerpVectors(a3, b3, k)
    a3.set(...A.tgt)
    b3.set(...B.tgt)
    pose.tgt.lerpVectors(a3, b3, k)
    markDirty()
  }

  function focusLocation(id) {
    const loc = LOCATIONS.find((l) => l.id === id)
    if (!loc) return
    const [x, z] = loc.anchor
    const y = terrain.sampleHeight(x, z)
    // Lean the survey camera toward the place rather than diving at it. Flying
    // right up to a slope fills the frame with featureless ground and throws
    // away the silhouette that makes the model readable in the first place.
    const survey = POSES[1]
    focus.tgt.set(x, y + 1.6, z)
    focus.pos.set(
      survey.pos[0] + x * 0.5,
      survey.pos[1] * 0.74 + y * 0.5,
      survey.pos[2] + z * 0.5,
    )
    focus.active = true
    markDirty()
  }

  function clearFocus() {
    focus.active = false
    markDirty()
  }

  // --- hotspots -------------------------------------------------------------
  const anchors = LOCATIONS.map((l) => {
    const [x, z] = l.anchor
    return { id: l.id, v: new THREE.Vector3(x, terrain.sampleHeight(x, z) + 1.1, z) }
  })
  let hotspotCb = null
  const proj = new THREE.Vector3()
  const ray = new THREE.Vector3()
  const probe = new THREE.Vector3()

  /** cheap ray-march against the height field so pins hide behind ridges */
  function occluded(target) {
    ray.copy(target).sub(camera.position)
    const len = ray.length()
    ray.divideScalar(len)
    for (let i = 0.25; i < 0.94; i += 0.09) {
      probe.copy(camera.position).addScaledVector(ray, len * i)
      if (Math.abs(probe.x) > WIDTH / 2 || Math.abs(probe.z) > DEPTH / 2) continue
      if (terrain.sampleHeight(probe.x, probe.z) > probe.y + 0.35) return true
    }
    return false
  }

  function emitHotspots(w, h) {
    if (!hotspotCb) return
    const out = []
    for (const a of anchors) {
      proj.copy(a.v).project(camera)
      const onScreen = proj.z > -1 && proj.z < 1 && Math.abs(proj.x) < 1.25 && Math.abs(proj.y) < 1.25
      out.push({
        id: a.id,
        x: (proj.x * 0.5 + 0.5) * w,
        y: (-proj.y * 0.5 + 0.5) * h,
        visible: onScreen && !occluded(a.v),
      })
    }
    hotspotCb(out)
  }

  // --- loop -----------------------------------------------------------------
  let width = 1
  let height = 1
  let fitScale = 1
  let running = false
  let dirty = true
  const timer = new THREE.Timer()
  let elapsed = 0

  function markDirty() {
    dirty = true
  }

  function resize() {
    const r = canvas.getBoundingClientRect()
    width = Math.max(1, r.width)
    height = Math.max(1, r.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    fitScale = camera.aspect < 1 ? Math.min(2.1, 1 + (1 / camera.aspect - 1) * 0.58) : 1
    markDirty()
  }

  function frame() {
    timer.update()

    if (!reducedMotion) {
      elapsed = timer.getElapsed()
      birds.uniforms.uSpeed.value = state.birdSpeed
      birds.update(elapsed)

      parallax.x += (pointer.x - parallax.x) * 0.045
      parallax.y += (pointer.y - parallax.y) * 0.045
      orbit.az += (orbitTarget.az - orbit.az) * 0.07
      orbit.el += (orbitTarget.el - orbit.el) * 0.07
      dirty = true
    }

    if (!dirty) return
    dirty = reducedMotion ? false : true

    renderer.toneMappingExposure = state.exposure
    sky.uniforms.uStars.value = state.stars
    sun.target.position.set(0, 4, 0)
    sun.target.updateMatrixWorld()

    const targetPos = focus.active ? focus.pos : pose.pos
    const targetTgt = focus.active ? focus.tgt : pose.tgt

    a3.copy(targetPos)
    // A portrait frustum is far narrower horizontally, which walks the camera
    // past the edge of the block and shows the cut face. Pull back to compensate
    // so the model always fills the frame at any aspect.
    if (fitScale !== 1) {
      a3.sub(targetTgt).multiplyScalar(fitScale).add(targetTgt)
    }
    // orbit drag rotates the camera around the model centre
    if (orbit.az || orbit.el) {
      const r = Math.hypot(a3.x, a3.z)
      const base = Math.atan2(a3.x, a3.z)
      a3.x = Math.sin(base + orbit.az) * r
      a3.z = Math.cos(base + orbit.az) * r
      a3.y = Math.max(6, a3.y + orbit.el * 40)
    }
    a3.x += parallax.x * 7
    a3.y += parallax.y * 4

    camera.position.lerp(a3, reducedMotion ? 1 : 0.075)
    b3.copy(targetTgt)
    b3.x += parallax.x * 2
    camera.lookAt(b3)

    renderer.render(scene, camera)
    emitHotspots(width, height)
  }

  // --- public ---------------------------------------------------------------
  function start() {
    if (running) return
    running = true
    timer.reset()
    renderer.setAnimationLoop(frame)
  }

  function stop() {
    running = false
    renderer.setAnimationLoop(null)
  }

  function setPointer(nx, ny) {
    if (reducedMotion) return
    pointer.x = nx
    pointer.y = ny
  }

  function setOrbit(az, el) {
    if (reducedMotion) return
    orbitTarget.az = Math.max(-0.85, Math.min(0.85, az))
    orbitTarget.el = Math.max(-0.35, Math.min(0.5, el))
  }

  function dispose() {
    stop()
    scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose()
      if (o.material) {
        const mats = Array.isArray(o.material) ? o.material : [o.material]
        mats.forEach((m) => m.dispose())
      }
    })
    renderer.dispose()
  }

  resize()
  applyAtmosphere(ATMOSPHERES[0].id, { immediate: true })

  return {
    start,
    stop,
    resize,
    dispose,
    setPointer,
    setOrbit,
    setPoseBlend,
    focusLocation,
    clearFocus,
    applyAtmosphere,
    onHotspots: (cb) => {
      hotspotCb = cb
    },
    get atmosphere() {
      return current
    },
    poseCount: POSES.length,
  }
}
