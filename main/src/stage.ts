import { AssetsManager, Color4, Engine, Scene, Sound } from '@babylonjs/core'
import { AssetConfig } from './assets'

export type SceneContainer = {
  scene: Scene
  manager: AssetsManager
}

export const createSceneContainer = (engine: Engine): SceneContainer => {
  const scene = new Scene(engine)
  scene.clearColor = new Color4(0, 0, 0, 1.0)

  const manager = new AssetsManager(scene)
  manager.useDefaultLoadingScreen = false
  manager.autoHideLoadingUI = false

  return {
    scene,
    manager,
  }
}

export abstract class Stage {
  abstract readonly config: AssetConfig

  abstract readonly positionalSoundNames: string[]

  readonly engine: Engine

  readonly scene: Scene

  readonly manager: AssetsManager

  readonly canvas: HTMLCanvasElement

  constructor(engine: Engine) {
    const { scene, manager } = createSceneContainer(engine)
    this.engine = engine
    this.scene = scene
    this.manager = manager

    const canvas = this.scene.getEngine().getRenderingCanvas()
    if (!canvas) {
      throw Error('Canvas not defined!')
    }
    this.canvas = canvas
  }

  async loadAndInit(): Promise<void> {
    const sounds = await this.loadAssets()
    const positionalSounds = sounds.filter(({ name }) =>
      this.positionalSoundNames.includes(name)
    )
    this.initialize(sounds, positionalSounds)

    // Start playing background sounds when the first frame is rendered
    this.scene.registerBeforeRender(() => {
      if (!positionalSounds[0].isPlaying) {
        positionalSounds.forEach((sound) => {
          sound.play()
        })
      }
    })
  }

  abstract render(): void

  protected abstract loadAssets(): Promise<Sound[]>

  protected abstract initialize(
    allSounds: Sound[],
    positionalSounds: Sound[]
  ): Promise<void>
}
