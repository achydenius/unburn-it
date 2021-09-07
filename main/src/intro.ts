import {
  AbstractMesh,
  ActionManager,
  Engine,
  MeshBuilder,
  Scene,
  ShaderMaterial,
  Sound,
  Vector3,
} from '@babylonjs/core'

import { Stage } from './stage'
import EnvironmentCamera from './camera'
import createWaterMaterial from './water'
import { loadAssets } from './assets'
import { ambientSounds, clickSounds, hoverSound, introScene } from './imports'
import { createButtonActions } from './common'

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
  onClick: (manager: ActionManager) => void
): void => {
  const plane = getWaterPlane(scene)
  plane.isPickable = false

  const mesh = scene.getMeshByID('play_start_text')
  if (!mesh) {
    throw Error('play_start_text mesh not found!')
  }

  createButtonActions(mesh, allSounds, positionalSounds, onClick)
}

export default class IntroStage extends Stage {
  config = config

  positionalSoundNames = ['ambient1', 'ambient2', 'ambient3', 'ambient4']

  onClick: (manager: ActionManager) => void

  constructor(engine: Engine, onClick: (manager: ActionManager) => void) {
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
