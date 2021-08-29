import { AssetsManager, Scene, Sound } from '@babylonjs/core'

export type AssetConfig = {
  scenes: { [name: string]: string }
  sounds: { [name: string]: string }
  textures: { [name: string]: string }
}

const isSound = (asset: Sound | void): asset is Sound => !!asset

const loadMeshAsset = (
  name: string,
  src: string,
  manager: AssetsManager
): Promise<void> =>
  new Promise((resolve, reject) => {
    const task = manager.addMeshTask(name, '', '', src)
    task.onSuccess = (): void => resolve()
    task.onError = (_, message): void => reject(message)
  })

const loadSoundAsset = (
  name: string,
  src: string,
  scene: Scene,
  manager: AssetsManager
): Promise<Sound> =>
  new Promise((resolve, reject) => {
    const task = manager.addBinaryFileTask(name, src)
    task.onSuccess = ({ data }): void => {
      const sound = new Sound(name, data, scene, () => {
        resolve(sound)
      })
      task.onError = (_, message): void => reject(message)
    }
  })

const loadTextureAsset = (
  name: string,
  src: string,
  manager: AssetsManager
): Promise<void> =>
  new Promise((resolve, reject) => {
    const task = manager.addTextureTask(name, src)
    task.onSuccess = ({ texture }): void => {
      texture.name = name
      resolve()
    }
    task.onError = (_, message): void => reject(message)
  })

// Load all assets and return sounds as these can't be accessed via scene
export async function loadAssets(
  config: AssetConfig,
  manager: AssetsManager,
  scene: Scene
): Promise<Sound[]> {
  const sounds = Object.entries(config.sounds).map(([name, src]) =>
    loadSoundAsset(name, src, scene, manager)
  )
  const meshes = Object.entries(config.scenes).map(([name, src]) =>
    loadMeshAsset(name, src, manager)
  )
  const textures = Object.entries(config.textures).map(([name, src]) =>
    loadTextureAsset(name, src, manager)
  )
  manager.load()

  const promises: Promise<Sound | void>[] = [...sounds, ...textures, ...meshes]
  return (await Promise.all(promises)).filter(isSound)
}
