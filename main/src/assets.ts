import { AssetsManager, Scene, Sound } from '@babylonjs/core'
import introScene from './assets/SCENE_1.COMPRESSED_TEXTURES.10.8.2021.glb'
import mainScene from './assets/MAINLEVEL_COMPRESSEDTEXTURES.10.8.2021.glb'
import center from './assets/1(CENTER)_ENTRY_26.07.21.mp3'
import left from './assets/2(LEFT)_ENTRY_26.07.21.mp3'
import right from './assets/3(RIGHT)_ENTRY_26.07.21.mp3'
import back from './assets/4(BACK)_ENTRY_26.07.21.mp3'
import hover from './assets/PLAY_HOVER.mp3'
import click1 from './assets/PLAY_CLICK1.mp3'
import click2 from './assets/PLAY_CLICK2.mp3'
import click3 from './assets/PLAY_CLICK3.mp3'
import click4 from './assets/PLAY_CLICK4.mp3'
import click5 from './assets/PLAY_CLICK5.mp3'
import unburn1 from './assets/V1_UNBURN_13.08.21.mp3'
import unburn2 from './assets/V2_UNBURN_13.08.21.mp3'
import unburn3 from './assets/V3_UNBURN_13.08.21.mp3'
import unburn4 from './assets/V4_UNBURN_13.08.21.mp3'

type SceneAssets = {
  name: string
  scene: string
  sounds: { [name: string]: string }
}

// eslint-disable-next-line
type SceneLoader = (manager: AssetsManager, scene: Scene) => Promise<Sound[]>

const introAssets = {
  name: 'intro',
  scene: introScene,
  sounds: {
    center,
    left,
    right,
    back,
    hover,
    click1,
    click2,
    click3,
    click4,
    click5,
  },
}

const mainAssets = {
  name: 'main',
  scene: mainScene,
  sounds: {
    unburn1,
    unburn2,
    unburn3,
    unburn4,
  },
}

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
const loadAssets = async (
  assets: SceneAssets,
  manager: AssetsManager,
  scene: Scene
): Promise<Sound[]> => {
  const sounds = Object.entries(assets.sounds).map(([name, src]) =>
    loadAsset(name, src, scene, manager)
  )
  const mesh = loadAsset(assets.name, assets.scene, scene, manager)
  manager.load()

  return (await Promise.all([...sounds, mesh])).filter(isSound)
}

export const loadIntroAssets: SceneLoader = (
  manager: AssetsManager,
  scene: Scene
): Promise<Sound[]> => loadAssets(introAssets, manager, scene)

export const loadMainAssets: SceneLoader = (
  manager: AssetsManager,
  scene: Scene
) => loadAssets(mainAssets, manager, scene)
