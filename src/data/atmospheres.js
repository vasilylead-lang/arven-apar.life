// The atmosphere presets. These drive both the toggle UI and every light,
// colour and fog value in the WebGL scene, so the two can never disagree.
// Snowline and treeline are given in real metres and converted to model
// units by the terrain module.

export const ATMOSPHERES = [
  {
    id: 'alpenglow',
    name: 'Alpenglow',
    time: '05:40',
    blurb:
      'The ten minutes before sunrise, when the summits are already burning and the valley has not started. It moves down the mountain at about a metre a second.',
    metrics: [
      ['Air temperature', '−7 °C'],
      ['Visibility', '40 km'],
      ['Wind', '4 km/h, still'],
    ],
    sun: { azimuth: 120, elevation: 13, color: '#ff8a52', intensity: 3.9 },
    ambient: { color: '#5b7ba6', intensity: 1.75 },
    fog: { color: '#16233a', density: 0.0055 },
    sky: { top: '#060a14', horizon: '#2a3348', glow: '#e0573a' },
    snowline: 2450,
    treeline: 2060,
    glow: 1.0,
    palette: { rock: '#8a7e6e', forest: '#31463b', snow: '#f2ece2' },
    birds: { color: '#0b0e10', opacity: 0.85, speed: 1 },
  },
  {
    id: 'foehn',
    name: 'Föhn',
    time: '14:20',
    blurb:
      'The dry wind off the Italian side. It lifts the cloud, drops the humidity through the floor and pushes visibility out to eighty kilometres. The air shakes.',
    metrics: [
      ['Air temperature', '+11 °C'],
      ['Visibility', '80 km'],
      ['Wind', '64 km/h, gusting'],
    ],
    sun: { azimuth: 214, elevation: 44, color: '#fff2dc', intensity: 3.4 },
    ambient: { color: '#93a9bf', intensity: 1.15 },
    fog: { color: '#9fb2c4', density: 0.0022 },
    sky: { top: '#2f5f92', horizon: '#c3d3de', glow: '#ffd9a8' },
    snowline: 2700,
    treeline: 2060,
    glow: 0.45,
    palette: { rock: '#8d8377', forest: '#2c4034', snow: '#fbfaf6' },
    birds: { color: '#141a1e', opacity: 0.7, speed: 1.9 },
  },
  {
    id: 'whiteout',
    name: 'Whiteout',
    time: '11:00',
    blurb:
      'Snow and cloud at exactly the same luminance. The horizon stops existing, you lose the ground under your own boots, and the choughs go quiet.',
    metrics: [
      ['Air temperature', '−13 °C'],
      ['Visibility', '15 m'],
      ['Wind', '38 km/h, drifting'],
    ],
    sun: { azimuth: 180, elevation: 62, color: '#dfe6ec', intensity: 1.15 },
    ambient: { color: '#c9d2d8', intensity: 1.5 },
    fog: { color: '#cdd5da', density: 0.0175 },
    sky: { top: '#c2ccd3', horizon: '#dde3e7', glow: '#eef2f4' },
    snowline: 1900,
    treeline: 2060,
    glow: 0.12,
    palette: { rock: '#9aa0a3', forest: '#4a5751', snow: '#ffffff' },
    birds: { color: '#5a656c', opacity: 0.35, speed: 0.55 },
  },
  {
    id: 'nachtblau',
    name: 'Nachtblau',
    time: '22:15',
    blurb:
      'Midsummer, and the blue never fully leaves the sky. A Bortle 2 reading — the Milky Way throws a shadow on fresh snow, which most people have never seen.',
    metrics: [
      ['Air temperature', '−2 °C'],
      ['Visibility', '60 km'],
      ['Sky brightness', 'Bortle 2'],
    ],
    sun: { azimuth: 340, elevation: -9, color: '#7fa0d8', intensity: 0.85 },
    ambient: { color: '#24395c', intensity: 0.78 },
    fog: { color: '#070c16', density: 0.0078 },
    sky: { top: '#02040a', horizon: '#0e1b33', glow: '#3d6ea8' },
    snowline: 2450,
    treeline: 2060,
    glow: 0.55,
    palette: { rock: '#474f5a', forest: '#18262a', snow: '#b9c7d6' },
    birds: { color: '#05070a', opacity: 0.9, speed: 0.75 },
  },
]

export const DEFAULT_ATMOSPHERE = 'alpenglow'
