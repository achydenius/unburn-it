import {
  Scene,
  Engine,
  ArcRotateCamera,
  Color4,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  ActionManager,
  Color3,
  InterpolateValueAction,
  CombineAction,
  AssetsManager,
  ShaderMaterial,
  Sound,
  PlaySoundAction,
  StopSoundAction,
  ExecuteCodeAction,
} from '@babylonjs/core'
import '@babylonjs/loaders'
import '@babylonjs/inspector'
import createWaterMaterial from './water'
import loadAssets from './assets'

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

let clickIndex = -1
const initPlayButton = (scene: Scene, hover: Sound, clicks: Sound[]): void => {
  const plane = scene.getMeshByID('Plane')
  plane!.isPickable = false

  const mesh = scene.getMeshByID('play_start_text')
  if (!mesh) {
    throw Error('play_start_text mesh not found!')
  }

  mesh.actionManager = new ActionManager(scene)

  mesh.actionManager.registerAction(
    new CombineAction(ActionManager.OnPointerOverTrigger, [
      new InterpolateValueAction(
        ActionManager.NothingTrigger,
        mesh.material,
        'emissiveColor',
        new Color3(1.0, 1.0, 1.0),
        250
      ),
      new PlaySoundAction(ActionManager.NothingTrigger, hover),
    ])
  )

  mesh.actionManager.registerAction(
    new CombineAction(ActionManager.OnPointerOutTrigger, [
      new InterpolateValueAction(
        ActionManager.NothingTrigger,
        mesh.material,
        'emissiveColor',
        new Color3(0, 0, 0),
        250
      ),
      new StopSoundAction(ActionManager.NothingTrigger, hover),
    ])
  )

  mesh.actionManager.registerAction(
    new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
      if (clickIndex >= 0) {
        clicks[clickIndex].stop()
      }
      clickIndex = (clickIndex + 1) % clicks.length
      clicks[clickIndex].play()
    })
  )
}

const createCamera = (
  scene: Scene,
  canvas: HTMLCanvasElement
): ArcRotateCamera => {
  const camera = new ArcRotateCamera(
    'Camera',
    -Math.PI / 2,
    Math.PI / 2.5,
    20.0,
    new Vector3(0, 0, 0),
    scene
  )
  camera.attachControl(canvas, true)
  camera.inputs.removeByType('ArcRotateCameraKeyboardMoveInput')
  camera.inputs.removeByType('ArcRotateCameraMouseWheelInput')

  return camera
}

const createWater = (scene: Scene): ShaderMaterial => {
  const plane = MeshBuilder.CreateGround(
    'Plane',
    { width: 1000, height: 1000 },
    scene
  )
  const waterMaterial = createWaterMaterial(
    scene,
    scene.meshes.filter((mesh) => mesh.id !== 'Plane')
  )
  plane.material = waterMaterial

  return waterMaterial
}

let time = 0
let lastRotation = -1
const createBeforeRender =
  (
    engine: Engine,
    camera: ArcRotateCamera,
    water: ShaderMaterial,
    initialCameraBeta: number,
    backgroundSounds: Sound[]
  ) =>
  (): void => {
    // Update water
    time += engine.getDeltaTime() * 0.0005
    water.setFloat('time', time)

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
      backgroundSounds.forEach((sound, i) => {
        sound.setVolume(volumes[i])
      })
    }
    lastRotation = rotation
  }

const initBackgroundSounds = (sounds: Sound[]): void => {
  sounds.forEach((sound) => {
    sound.setVolume(0)
    sound.loop = true
    sound.play()
  })
}

const initScene = (scene: Scene, sounds: Sound[]): void => {
  scene.clearColor = new Color4(0, 0, 0, 1.0)

  const camera = createCamera(scene, scene.getEngine().getRenderingCanvas()!)
  new HemisphericLight('Light', new Vector3(0, 1.0, 0), scene)
  const waterMaterial = createWater(scene)

  const backgroundSounds = sounds.filter(({ name }) =>
    ['center', 'left', 'right', 'back'].includes(name)
  )
  initBackgroundSounds(backgroundSounds)
  initPlayButton(
    scene,
    sounds.filter(({ name }) => name === 'hover')[0],
    sounds.filter(({ name }) => name.startsWith('click'))
  )

  scene.registerBeforeRender(
    createBeforeRender(
      scene.getEngine(),
      camera,
      waterMaterial,
      camera.beta,
      backgroundSounds
    )
  )
}

const inspectorRequested = (): boolean => {
  const param = window.location.search.split('?')[1] as string | undefined
  const pair = param?.split('=')
  return pair !== undefined && pair[0] === 'inspector' && pair[1] === 'true'
}

window.addEventListener('load', async () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement
  const engine = new Engine(canvas, true)
  const scene = new Scene(engine)
  const manager = new AssetsManager(scene)

  const sounds = await loadAssets(manager, scene)
  initScene(scene, sounds)

  if (inspectorRequested()) {
    scene.debugLayer.show()
  }

  engine.runRenderLoop(() => {
    scene.render()
  })

  window.addEventListener('resize', () => {
    engine.resize()
  })
})
