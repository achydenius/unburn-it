import {
  ArcRotateCamera,
  AssetsManager,
  Color4,
  Engine,
  Scene,
  Sound,
} from '@babylonjs/core'
import { AssetConfig, loadAssets } from './assets'

export default abstract class Level {
  abstract readonly config: AssetConfig

  abstract readonly positionalSoundNames: string[]

  scene: Scene

  sounds: Sound[] | undefined

  assetsManager: AssetsManager

  camera: ArcRotateCamera | undefined

  constructor(engine: Engine) {
    this.scene = this.createScene(engine)
    this.assetsManager = this.createAssetsManager(this.scene)
  }

  async loadAssets(): Promise<void> {
    this.sounds = await loadAssets(this.config, this.assetsManager, this.scene)
  }

  abstract init(): void

  protected getPositionalSounds(): Sound[] {
    if (!this.sounds) {
      throw Error('Sounds not defined!')
    }

    return this.sounds.filter(({ name }) =>
      this.positionalSoundNames.includes(name)
    )
  }

  private createScene = (engine: Engine): Scene => {
    const scene = new Scene(engine)
    scene.clearColor = new Color4(0, 0, 0, 1.0)
    return scene
  }

  private createAssetsManager = (scene: Scene): AssetsManager => {
    const manager = new AssetsManager(scene)
    manager.useDefaultLoadingScreen = false
    manager.autoHideLoadingUI = false
    return manager
  }
}
