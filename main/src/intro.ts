import {
  AbstractMesh,
  ActionManager,
  Color3,
  CombineAction,
  Engine,
  ExecuteCodeAction,
  InterpolateValueAction,
  MeshBuilder,
  PlaySoundAction,
  Scene,
  ShaderMaterial,
  Sound,
  StopSoundAction,
  Vector3,
} from '@babylonjs/core'

import { Stage } from './stage'
import EnvironmentCamera from './camera'
import createWaterMaterial from './water'
import { loadAssets } from './assets'
import { ambientSounds, clickSounds, hoverSound, introScene } from './imports'

const config = {
  scenes: {
    introScene,
  },
  sounds: {
    ...ambientSounds,
    hoverSound,
    ...clickSounds,
  },
  textures: {},
}

const getHoverSound = (sounds: Sound[]): Sound => {
  const sound = sounds.find(({ name }) => name === 'hoverSound')
  if (sound) {
    return sound
  }
  throw Error('Hover sound not found!')
}

const getClickSounds = (sounds: Sound[]): Sound[] =>
  sounds.filter(({ name }) => name.startsWith('click'))

const getWaterPlane = (scene: Scene): AbstractMesh => {
  const plane = scene.getMeshByID('Plane')
  if (plane) {
    return plane
  }
  throw Error('Water plane not found!')
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

const initPlayButton = (
  scene: Scene,
  allSounds: Sound[],
  positionalSounds: Sound[],
  onClick: () => void
): void => {
  const plane = getWaterPlane(scene)
  plane.isPickable = false

  const mesh = scene.getMeshByID('play_start_text')
  if (!mesh) {
    throw Error('play_start_text mesh not found!')
  }

  const hover = getHoverSound(allSounds)
  const clicks = getClickSounds(allSounds)

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

  let clickIndex = 0
  const manager = mesh.actionManager
  mesh.actionManager.registerAction(
    new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
      if (clickIndex >= 0) {
        clicks[clickIndex].stop()
      }
      clickIndex = (clickIndex + 1) % clicks.length
      clicks[clickIndex].play()

      hover.stop()
      positionalSounds.forEach((sound) => sound.stop())
      manager.actions.forEach((action) => manager.unregisterAction(action))
      onClick()
    })
  )
}

export default class IntroStage extends Stage {
  config = config

  positionalSoundNames = ['ambient1', 'ambient2', 'ambient3', 'ambient4']

  onClick: () => void

  constructor(engine: Engine, onClick: () => void) {
    super(engine)
    this.onClick = onClick
  }

  async loadAssets(): Promise<Sound[]> {
    return loadAssets(this.config, this.manager, this.scene)
  }

  async initialize(
    allSounds: Sound[],
    positionalSounds: Sound[]
  ): Promise<void> {
    const camera = new EnvironmentCamera(
      20.0,
      new Vector3(0, 0, 0),
      Math.PI / 2.5,
      positionalSounds,
      this.scene,
      this.canvas
    )
    camera.light.intensity = 1000.0
    camera.applyPositionalSounds((sound: Sound) => {
      sound.loop = true
    })

    const waterMaterial = createWater(this.scene)

    initPlayButton(this.scene, allSounds, positionalSounds, this.onClick)

    let time = 0
    this.scene.registerBeforeRender(() => {
      // Update water
      time += this.scene.getEngine().getDeltaTime() * 0.0005
      waterMaterial.setFloat('time', time)
      camera.updateLight()
    })
  }

  render(): void {
    this.scene.render()
  }
}
