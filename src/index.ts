import {
  Scene,
  Engine,
  ArcRotateCamera,
  Color4,
  Vector3,
  HemisphericLight,
  SceneLoader,
  MeshBuilder,
} from '@babylonjs/core'
import '@babylonjs/loaders'
import '@babylonjs/inspector'
import { Howl } from 'howler'
import introScene from './assets/intro.glb'
import createWaterMaterial from './water'
import loadSounds from './sounds'

const maxBetaChange = 0.225

const createScene = async (
  engine: Engine,
  canvas: HTMLCanvasElement,
  sounds: Howl[]
): Promise<Scene> => {
  const scene = new Scene(engine)
  scene.clearColor = new Color4(0, 0, 0, 1.0)

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
  const initialCameraBeta = camera.beta

  new HemisphericLight('Light', new Vector3(0, 1, 0), scene)

  await SceneLoader.AppendAsync('', introScene, scene)

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

  let time = 0
  scene.registerBeforeRender(() => {
    // Update water
    time += engine.getDeltaTime() * 0.0005
    waterMaterial.setFloat('time', time)

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

    // Set sound volume
    // TODO: Add a limit to update frequency in order to avoid distortion/cracking
    const volume = (Math.sin(camera.alpha) + 1.0) * 0.5
    if (volume !== sounds[0].volume()) {
      sounds[0].volume(volume)
    }
  })

  return scene
}

const inspectorRequested = (): boolean => {
  const param = window.location.search.split('?')[1] as string | undefined
  const pair = param?.split('=')
  return pair !== undefined && pair[0] === 'inspector' && pair[1] === 'true'
}

window.addEventListener('load', async () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement
  const engine = new Engine(canvas, true)

  const sounds = await loadSounds()
  sounds[0].volume(0)
  sounds[0].play()

  const scene = await createScene(engine, canvas, sounds)

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
