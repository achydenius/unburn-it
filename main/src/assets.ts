import { AssetsManager, Scene, Sound } from '@babylonjs/core'

export type AssetConfig = {
  name: string
  scene: string
  sounds: { [name: string]: string }
}

const matchExtension = /\.[0-9a-z]+$/i

const isSoundFile = (src: string): boolean => {
  const matches = src.match(matchExtension)
  return matches ? matches[0] === '.mp3' : false
}

const isSound = (asset: Sound | void): asset is Sound => !!asset

// TODO: Can some of this be simplified with onFinish or onTasksDoneObservable?
const loadAsset = async (
  name: string,
  src: string,
  scene: Scene,
  manager: AssetsManager
): Promise<Sound | void> =>
  new Promise((resolve, reject) => {
    if (isSoundFile(src)) {
      const task = manager.addBinaryFileTask(name, src)
      task.onSuccess = ({ data }): void => {
        const sound = new Sound(name, data, scene, () => {
          resolve(sound)
        })
      }
      task.onError = (_, message): void => reject(message)
    } else {
      const task = manager.addMeshTask(name, '', '', src)
      task.onSuccess = (): void => resolve()
      task.onError = (_, message): void => reject(message)
    }
  })

// Load all assets and return sounds as these can't be accessed via scene
export async function loadAssets(
  config: AssetConfig,
  manager: AssetsManager,
  scene: Scene
): Promise<Sound[]> {
  const sounds = Object.entries(config.sounds).map(([name, src]) =>
    loadAsset(name, src, scene, manager)
  )
  const mesh = loadAsset(config.name, config.scene, scene, manager)
  manager.load()

  return (await Promise.all([...sounds, mesh])).filter(isSound)
}
