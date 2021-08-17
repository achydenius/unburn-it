import {
  Scene,
  Color4,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  ActionManager,
  Color3,
  InterpolateValueAction,
  CombineAction,
  ShaderMaterial,
  Sound,
  PlaySoundAction,
  StopSoundAction,
  ExecuteCodeAction,
} from '@babylonjs/core'
import createCamera from './camera'
import createWaterMaterial from './water'

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

export default function init(scene: Scene, sounds: Sound[]): void {
  scene.clearColor = new Color4(0, 0, 0, 1.0)

  const positionalSounds = sounds.filter(({ name }) =>
    ['center', 'left', 'right', 'back'].includes(name)
  )

  createCamera(
    20.0,
    new Vector3(0, 0, 0),
    Math.PI / 2.5,
    positionalSounds,
    scene,
    scene.getEngine().getRenderingCanvas()!
  )
  new HemisphericLight('Light', new Vector3(0, 1.0, 0), scene)
  const waterMaterial = createWater(scene)

  initPlayButton(
    scene,
    sounds.filter(({ name }) => name === 'hover')[0],
    sounds.filter(({ name }) => name.startsWith('click'))
  )

  let time = 0
  scene.registerBeforeRender(() => {
    // Update water
    time += scene.getEngine().getDeltaTime() * 0.0005
    waterMaterial.setFloat('time', time)
  })
}
