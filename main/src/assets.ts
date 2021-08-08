import { AssetsManager, Scene, Sound } from '@babylonjs/core'
import introScene from './assets/SCENE_UPDATE.28.7.glb'
import center from './assets/1(CENTER)_ENTRY_26.07.21.mp3'
import left from './assets/2(LEFT)_ENTRY_26.07.21.mp3'
import right from './assets/3(RIGHT)_ENTRY_26.07.21.mp3'
import back from './assets/4(BACK)_ENTRY_26.07.21.mp3'
import hover from './assets/PLAY_HOVER.mp3'
import click from './assets/PLAY_CLICK.mp3'

const soundSources = { center, left, right, back, hover, click }

const matchExtension = /\.[0-9a-z]+$/i

const isSoundFile = (src: string): boolean => {
  const matches = src.match(matchExtension)
  return matches ? matches[0] === '.mp3' : false
}

const isSound = (asset: Sound | void): asset is Sound => !!asset

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
export default async function loadAssets(
  manager: AssetsManager,
  scene: Scene
): Promise<Sound[]> {
  const sounds = Object.entries(soundSources).map(([name, src]) =>
    loadAsset(name, src, scene, manager)
  )
  const mesh = loadAsset('introScene', introScene, scene, manager)
  manager.load()

  return (await Promise.all([...sounds, mesh])).filter(isSound)
}
