import {
  AbstractMesh,
  ActionManager,
  Axis,
  Color3,
  ExecuteCodeAction,
  InterpolateValueAction,
  RefractionPostProcess,
  Scene,
  Sound,
  Space,
  Vector3,
} from '@babylonjs/core'

import EnvironmentCamera from './camera'
import { Stage } from './stage'
import { loadAssets } from './assets'
import displacement from '../assets/main/displacement-blur.jpg'
import { initLyrics, alignLyrics } from './lyrics'
import {
  ambientSounds,
  interactiveSounds,
  lyricsScene,
  mainScene,
  mainSounds,
} from './imports'

const cameraStartY = 20.0
const cameraEndY = -115.0
const refractionDepth = 0.1
const endSoundsIncrement = 0.0001

const config = {
  scenes: {
    mainScene,
    lyricsScene,
  },
  sounds: {
    ...mainSounds,
    ...ambientSounds,
    ...interactiveSounds,
  },
  textures: {
    displacement,
  },
}

const getMesh = (name: string, scene: Scene): AbstractMesh => {
  const mesh = scene.getMeshByName(name)
  if (!mesh) {
    throw Error(`Mesh ${name} not found!`)
  }
  return mesh
}

const pickRandom = <T>(items: T[]): T =>
  items[Math.floor(Math.random() * items.length)]

const initInteraction = (
  mesh: AbstractMesh,
  sounds: Sound[],
  scene: Scene
): void => {
  mesh.actionManager = new ActionManager(scene)
  mesh.actionManager.registerAction(
    new InterpolateValueAction(
      ActionManager.OnPointerOverTrigger,
      mesh.material,
      'emissiveColor',
      new Color3(1.0, 1.0, 1.0),
      100
    )
  )
  mesh.actionManager.registerAction(
    new InterpolateValueAction(
      ActionManager.OnPointerOutTrigger,
      mesh.material,
      'emissiveColor',
      new Color3(0, 0, 0),
      100
    )
  )
  mesh.actionManager.registerAction(
    new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
      const sound = pickRandom(sounds)
      sound.play()
    })
  )
}

const initInteractions = (scene: Scene, sounds: Sound[]): void => {
  const fishes = [
    'FISH_1',
    'FISH_2',
    'FISH_3',
    'fishie_3.001',
    'FISH_5',
    'FISH_6',
    'FISH_7',
    'FISH_8',
    'FISH_9',
    'FISH_10',
    'FISH_11',
  ].map((name) => getMesh(name, scene))

  const gans = [
    'GAN_1',
    'GAN_2',
    'GAN_3',
    'GAN_4',
    'GAN_5',
    'GAN_6',
    'GAN_7',
    'GAN_8',
    'GAN_9',
    'GAN_10',
    'GAN_11',
    'GAN_12',
    'GAN_13',
  ].map((name) => getMesh(name, scene))

  const mines = [
    'WATER_MINE_1',
    'WATER_MINE_2',
    'WATER_MINE_3',
    'WATER_MINE_4',
    'WATER_MINE_5',
    'WATER_MINE_6',
    'WATER_MINE_7',
    'WATER_MINE_8',
    'WATER_MINE_9',
  ].map((name) => getMesh(name, scene))

  const plastics = [
    'PLASTIC_1',
    'PLASTIC_2',
    'PLASTIC_3',
    'PLASTIC_4',
    'PLASTIC_5',
    'PLASTIC_6',
    'PLASTIC_8',
    'PLASTIC_9',
    'PLASTIC_10',
    'PLASTIC_11',
    'PLASTIC_12',
    'PLASTIC_13',
    'PLASTIC_14',
    'PLASTIC_15',
    'PLASTIC_16',
  ].map((name) => getMesh(name, scene))

  const fishSounds = sounds.filter(({ name }) => name.startsWith('fish'))
  fishes.forEach((fish) => {
    initInteraction(fish, fishSounds, scene)
  })

  const ganSounds = sounds.filter(({ name }) => name.startsWith('gan'))
  gans.forEach((gan) => {
    initInteraction(gan, ganSounds, scene)
  })

  const mineSounds = sounds.filter(({ name }) => name.startsWith('mine'))
  mines.forEach((mine) => {
    initInteraction(mine, mineSounds, scene)
  })

  const plasticSounds = sounds.filter(({ name }) => name.startsWith('plastic'))
  plastics.forEach((plastic) => {
    initInteraction(plastic, plasticSounds, scene)
  })
}

const getUnitsPerSecond = (sound: Sound): number => {
  const buffer = sound.getAudioBuffer()
  if (!buffer) {
    throw Error('Audio buffer not defined!')
  }
  return (cameraStartY - cameraEndY) / buffer.duration
}

export default class MainStage extends Stage {
  config = config

  positionalSoundNames = ['unburn1', 'unburn2', 'unburn3', 'unburn4']

  async loadAssets(): Promise<Sound[]> {
    return loadAssets(this.config, this.manager, this.scene)
  }

  async initialize(
    allSounds: Sound[],
    positionalSounds: Sound[]
  ): Promise<void> {
    const radius = 1.0

    const endSounds = allSounds.filter(({ name }) =>
      ['ambient1', 'ambient2', 'ambient3', 'ambient4'].includes(name)
    )

    const camera = new EnvironmentCamera(
      radius,
      new Vector3(0, cameraStartY, 0),
      Math.PI / 2,
      positionalSounds,
      this.scene,
      this.canvas
    )
    camera.light.intensity = 100.0

    new RefractionPostProcess(
      'Refraction',
      displacement,
      new Color3(1.0, 1.0, 1.0),
      refractionDepth,
      0,
      1.0,
      camera.camera
    )

    const unitsPerSecond = getUnitsPerSecond(positionalSounds[0])

    const lyrics = initLyrics(cameraStartY, unitsPerSecond, this.scene)

    initInteractions(this.scene, allSounds)

    const cameraSpeed = unitsPerSecond / 60.0
    let yPosition = cameraStartY
    let endSoundsVolume = 0
    let isEndSoundsPlaying = false
    this.scene.registerBeforeRender(() => {
      const { currentTime } = positionalSounds[0]
      alignLyrics(lyrics, currentTime, camera.camera.alpha)

      camera.camera.target.y = yPosition
      camera.camera.radius = radius
      camera.updateLight()

      // Move camera until bottom of the scene
      if (yPosition > cameraEndY) {
        yPosition -= this.scene.getAnimationRatio() * cameraSpeed
        // At the bottom move the last lyrics up
      } else {
        lyrics[lyrics.length - 1].node.translate(
          Axis.Y,
          this.scene.getAnimationRatio() * cameraSpeed,
          Space.WORLD
        )

        // Initialize end sounds
        if (!isEndSoundsPlaying) {
          camera.positionalSounds = endSounds
          camera.masterVolume = 0
          camera.applyPositionalSounds((sound) => {
            sound.loop = true
            sound.setVolume(0)
            sound.play()
          })
          isEndSoundsPlaying = true
          // Fade in end sounds
        } else {
          camera.masterVolume = endSoundsVolume
          endSoundsVolume += endSoundsIncrement
          if (endSoundsVolume > 1.0) {
            endSoundsVolume = 1.0
          }
        }
      }
    })
  }

  render(): void {
    this.scene.render()
  }
}
