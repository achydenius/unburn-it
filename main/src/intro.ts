import {
  AbstractMesh,
  ActionManager,
  Color3,
  CombineAction,
  Engine,
  ExecuteCodeAction,
  HemisphericLight,
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

import introScene from '../assets/intro/SCENE_1.COMPRESSED_TEXTURES.10.8.2021.glb'
import hover from '../assets/intro/PLAY_HOVER.mp3'
import click1 from '../assets/intro/PLAY_CLICK1.mp3'
import click2 from '../assets/intro/PLAY_CLICK2.mp3'
import click3 from '../assets/intro/PLAY_CLICK3.mp3'
import click4 from '../assets/intro/PLAY_CLICK4.mp3'
import click5 from '../assets/intro/PLAY_CLICK5.mp3'
import ambientSounds from './common'

const config = {
  scenes: {
    introScene,
  },
  sounds: {
    ...ambientSounds,
    hover,
    click1,
    click2,
    click3,
    click4,
    click5,
  },
  textures: {},
}

const getHoverSound = (sounds: Sound[]): Sound => {
  const sound = sounds.find(({ name }) => name === 'hover')
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

  const hoverSound = getHoverSound(allSounds)
  const clickSounds = getClickSounds(allSounds)

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

  let clickIndex = 0
  const manager = mesh.actionManager
  mesh.actionManager.registerAction(
    new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
      if (clickIndex >= 0) {
        clickSounds[clickIndex].stop()
      }
      clickIndex = (clickIndex + 1) % clickSounds.length
      clickSounds[clickIndex].play()

      hoverSound.stop()
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
    camera.applyPositionalSounds((sound: Sound) => {
      sound.loop = true
    })

    new HemisphericLight('Light', new Vector3(0, 1.0, 0), this.scene)
    const waterMaterial = createWater(this.scene)

    initPlayButton(this.scene, allSounds, positionalSounds, this.onClick)

    let time = 0
    this.scene.registerBeforeRender(() => {
      // Update water
      time += this.scene.getEngine().getDeltaTime() * 0.0005
      waterMaterial.setFloat('time', time)
    })
  }

  render(): void {
    this.scene.render()
  }
}
