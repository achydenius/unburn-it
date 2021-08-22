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

const getHoverSound = (sounds: Sound[]): Sound =>
  sounds.find(({ name }) => name === 'hover')!

const getClickSounds = (sounds: Sound[]): Sound[] =>
  sounds.filter(({ name }) => name.startsWith('click'))

const getPositionalSounds = (sounds: Sound[]): Sound[] =>
  sounds.filter(({ name }) =>
    ['center', 'left', 'right', 'back'].includes(name)
  )

let clickIndex = -1
const initPlayButton = (
  scene: Scene,
  sounds: Sound[],
  onClick: () => void
): void => {
  const plane = scene.getMeshByID('Plane')
  plane!.isPickable = false

  const mesh = scene.getMeshByID('play_start_text')
  if (!mesh) {
    throw Error('play_start_text mesh not found!')
  }

  const hoverSound = getHoverSound(sounds)
  const clickSounds = getClickSounds(sounds)
  const positionalSounds = getPositionalSounds(sounds)

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
      new PlaySoundAction(ActionManager.NothingTrigger, hoverSound),
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
      new StopSoundAction(ActionManager.NothingTrigger, hoverSound),
    ])
  )

  mesh.actionManager.registerAction(
    new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
      if (clickIndex >= 0) {
        clickSounds[clickIndex].stop()
      }
      clickIndex = (clickIndex + 1) % clickSounds.length
      clickSounds[clickIndex].play()

      hoverSound.stop()
      positionalSounds.forEach((sound) => sound.stop())
      mesh.actionManager!.actions.forEach((action) =>
        mesh.actionManager!.unregisterAction(action)
      )
      onClick()
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

export default function createScene(
  scene: Scene,
  sounds: Sound[],
  onClick: () => void
): void {
  scene.clearColor = new Color4(0, 0, 0, 1.0)

  createCamera(
    20.0,
    new Vector3(0, 0, 0),
    Math.PI / 2.5,
    getPositionalSounds(sounds),
    scene,
    scene.getEngine().getRenderingCanvas()!
  )
  new HemisphericLight('Light', new Vector3(0, 1.0, 0), scene)
  const waterMaterial = createWater(scene)

  initPlayButton(scene, sounds, onClick)

  let time = 0
  scene.registerBeforeRender(() => {
    // Update water
    time += scene.getEngine().getDeltaTime() * 0.0005
    waterMaterial.setFloat('time', time)
  })
}
