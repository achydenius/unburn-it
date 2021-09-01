import { AbstractMesh, Axis, Scene, Space } from '@babylonjs/core'
import burnIt from './assets/main/01_BURN_IT.glb'
import tInrubnu from './assets/main/02_TINRUBNU.glb'
import drawkcab from './assets/main/03_DRAWKCAB.glb'
import ashToAsh from './assets/main/04_ASH_TO_ASH.glb'
import dustToTrash from './assets/main/05_DUST_TO_TRASH.glb'
import burnItBackward from './assets/main/06_BURN_IT_BACKWARD.glb'
import backward from './assets/main/07_BACKWARD.glb'
import unburnIt from './assets/main/08_UNBURN_IT.glb'
import worldsAlmostCooked from './assets/main/09_WORLDS_ALMOST_COOKED.glb'
import itsOnFire from './assets/main/10_ITS_ON_FIRE.glb'
import myWorldsOnFire from './assets/main/11_MY_WORLDS_ON_FIRE.glb'
import howBoutYours from './assets/main/12_HOW_BOUT_YOURS.glb'
import iveGotABadDesire from './assets/main/13_IVE_GOT_A_BAD_DESIRE.glb'
import thatRingOfFire from './assets/main/14_THAT_RING_OF_FIRE.glb'
import ohohIm from './assets/main/15_OHOH_IM.glb'
import burning from './assets/main/16_BURNING.glb'

const lyricsYOffset = 1.5

const lyricsTimeToSeconds = (time: string): number => {
  const parts = time.split(':')
  return (
    parseInt(parts[0], 10) * 60 +
    parseInt(parts[1], 10) +
    parseInt(parts[2], 10) / 1000
  )
}

type LyricsConfig = { start: string; name: string }

type LyricsState = { start: number; name: string; isVisible: boolean }

const lyricsConfigs: LyricsConfig[] = [
  { start: '0:13:880', name: 'burnIt' },
  { start: '0:17:850', name: 'tInrubnu' },
  { start: '0:21:690', name: 'burnIt' },
  { start: '0:25:500', name: 'drawkcab' },
  { start: '0:33:720', name: 'ashToAsh' },
  { start: '0:37:680', name: 'dustToTrash' },
  { start: '0:41:650', name: 'burnItBackward' },
  { start: '0:45:620', name: 'burnIt' },
  { start: '0:49:560', name: 'backward' },
  { start: '0:53:550', name: 'burnIt' },
  { start: '0:57:500', name: 'backward' },
  { start: '1:02:850', name: 'unburnIt' },
  { start: '1:21:290', name: 'worldsAlmostCooked' },
  { start: '1:25:190', name: 'itsOnFire' },
  { start: '1:29:000', name: 'myWorldsOnFire' },
  { start: '1:33:160', name: 'howBoutYours' },
  { start: '1:37:440', name: 'iveGotABadDesire' },
  { start: '1:41:840', name: 'thatRingOfFire' },
  { start: '1:45:370', name: 'iveGotABadDesire' },
  { start: '1:49:180', name: 'ohohIm' },
  { start: '1:53:060', name: 'burning' },
  { start: '2:13:880', name: 'ashToAsh' },
  { start: '2:17:836', name: 'dustToTrash' },
  { start: '2:21:820', name: 'burnItBackward' },
  { start: '2:25:780', name: 'burnIt' },
  { start: '2:29:250', name: 'tInrubnu' },
  { start: '2:33:620', name: 'burnIt' },
  { start: '2:37:140', name: 'drawkcab' },
  { start: '2:41:650', name: 'burnIt' },
  { start: '2:44:620', name: 'backward' },
  { start: '2:48:640', name: 'burnIt' },
  { start: '2:52:560', name: 'backward' },
  { start: '2:58:000', name: 'unburnIt' },
]

const lyricsStates: LyricsState[] = lyricsConfigs.map(({ start, name }) => ({
  start: lyricsTimeToSeconds(start),
  name,
  isVisible: false,
}))

const getMesh = (name: string, scene: Scene): AbstractMesh => {
  const mesh = scene.getMeshByName(name)
  if (!mesh) {
    throw Error(`Mesh ${name} not found!`)
  }
  return mesh
}

export const lyricsMeshes = {
  burnIt,
  tInrubnu,
  drawkcab,
  ashToAsh,
  dustToTrash,
  burnItBackward,
  backward,
  unburnIt,
  worldsAlmostCooked,
  itsOnFire,
  myWorldsOnFire,
  howBoutYours,
  iveGotABadDesire,
  thatRingOfFire,
  ohohIm,
  burning,
}

export const hideAllLyrics = (scene: Scene): void => {
  lyricsConfigs.forEach(({ name }) =>
    scene.getMeshByName(name)?.setEnabled(false)
  )
}

export const handleLyricsVisibility = (
  scene: Scene,
  time: number,
  cameraY: number,
  cameraAlpha: number
): void => {
  let state: LyricsState | undefined
  for (let i = 0; i < lyricsStates.length; i++) {
    const { start, isVisible } = lyricsStates[i]
    if (time >= start && !isVisible) {
      state = lyricsStates[i]
      break
    }
  }

  if (state) {
    const mesh = getMesh(state.name, scene)

    // Rotate lyrics locally to correct position and translate and rotate to front of camera
    mesh.rotate(Axis.Y, -cameraAlpha - Math.PI / 2, Space.WORLD)
    mesh.translate(Axis.Z, 1.0).translate(Axis.Y, cameraY - lyricsYOffset)
    mesh.rotate(Axis.X, Math.PI / 2).rotate(Axis.Y, Math.PI)

    mesh.setEnabled(true)
    state.isVisible = true
  }
}
