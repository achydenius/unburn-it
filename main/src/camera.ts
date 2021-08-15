import { ArcRotateCamera, Scene, Sound, Vector3 } from '@babylonjs/core'

const maxBetaChange = 0.225

const mapRange = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number => ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin

// Map angle defined in radians between 0..1
const mapRotation = (angle: number): number => {
  const remainder = angle % (2 * Math.PI)
  const wrapped = remainder < 0 ? 2 * Math.PI + remainder : remainder
  return wrapped / (2 * Math.PI)
}

const getVolume = (phase: number, rampLength: number): number => {
  if (phase < rampLength) {
    return mapRange(phase, 0, rampLength, 1.0, 0)
  }
  if (phase >= 1.0 - rampLength) {
    return mapRange(phase, 1.0 - rampLength, 1.0, 0, 1.0)
  }
  return 0
}

const initPositionalSounds = (sounds: Sound[]): void => {
  sounds.forEach((sound) => {
    sound.setVolume(0)
    sound.loop = true
    sound.play()
  })
}

const limitCameraBeta = (
  camera: ArcRotateCamera,
  initialCameraBeta: number
): void => {
  // Clamp camera beta
  const maxBeta = initialCameraBeta + maxBetaChange
  const minBeta = initialCameraBeta - maxBetaChange

  if (camera.beta > maxBeta) {
    camera.beta = maxBeta
  }
  if (camera.beta < minBeta) {
    camera.beta = minBeta
  }

  // Lock camera target
  camera.target.set(0, 0, 0)
}

let lastRotation = -1
const crossfadeSounds = (camera: ArcRotateCamera, sounds: Sound[]): void => {
  // Crossfade between sounds
  // TODO: Add a limit to update frequency in order to avoid distortion/cracking
  // TODO: Use positional sound instead?
  const soundRotationOffset = Math.PI / 2
  const rotation = mapRotation(camera.alpha + soundRotationOffset)
  if (rotation !== lastRotation) {
    const volumes = [
      getVolume(rotation, 0.25),
      getVolume((rotation + 0.75) % 1.0, 0.25),
      getVolume((rotation + 0.5) % 1.0, 0.25),
      getVolume((rotation + 0.25) % 1.0, 0.25),
    ]
    sounds.forEach((sound, i) => {
      sound.setVolume(volumes[i])
    })
  }
  lastRotation = rotation
}

export default function createCamera(
  radius: number,
  target: Vector3,
  positionalSounds: Sound[],
  scene: Scene,
  canvas: HTMLCanvasElement
): ArcRotateCamera {
  const camera = new ArcRotateCamera(
    'Camera',
    -Math.PI / 2,
    Math.PI / 2.5,
    radius,
    target,
    scene
  )
  camera.attachControl(canvas, true)
  camera.inputs.removeByType('ArcRotateCameraKeyboardMoveInput')
  camera.inputs.removeByType('ArcRotateCameraMouseWheelInput')

  const initialCameraBeta = camera.beta

  initPositionalSounds(positionalSounds)

  scene.registerBeforeRender(() => {
    limitCameraBeta(camera, initialCameraBeta)
    crossfadeSounds(camera, positionalSounds)
  })

  return camera
}
