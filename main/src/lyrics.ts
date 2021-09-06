import {
  Axis,
  InstancedMesh,
  Mesh,
  Node,
  Scene,
  Space,
  TransformNode,
  Vector3,
} from '@babylonjs/core'

const lyricsYOffset = 1.5
type LyricsConfig = {
  start: string
  name: string
}

type LyricsState = {
  start: number
  offset: number
  node: TransformNode
  aligned: boolean
}

const lyricsOffsets: Record<string, number> = {
  '01_BURN_IT': 0.37,
  '02_TINRUBNU': 0.76,
  '03_DRAWKCAB': 0.23,
  '04_ASH_TO_ASH': 0.71,
  '05_DUST_TO_TRASH': 0.08,
  '06_BURN_IT_BACKWARD': 0.67,
  '07_BACKWARD': 0.38,
  '08_UNBURN_IT': 0.38,
  '09_WORLDS_ALMOST_COOKED': 1.36,
  '10_ITS_ON_FIRE': 1.29,
  '11_MY_WORLDS_ON_FIRE': 1.4,
  '12_HOW_BOUT_YOURS': 1.4,
  '13_IVE_GOT_A_BAD_DESIRE': 1.26,
  '14_THAT_RING_OF_FIRE': 1.13,
  '15_OHOH_IM': 1.3,
  '16_BURNING': 1.16,
}

const lyricsConfigs: LyricsConfig[] = [
  { start: '0:13:880', name: '01_BURN_IT' },
  { start: '0:17:850', name: '02_TINRUBNU' },
  { start: '0:21:690', name: '01_BURN_IT' },
  { start: '0:25:500', name: '03_DRAWKCAB' },
  { start: '0:33:720', name: '04_ASH_TO_ASH' },
  { start: '0:37:680', name: '05_DUST_TO_TRASH' },
  { start: '0:41:650', name: '06_BURN_IT_BACKWARD' },
  { start: '0:45:620', name: '01_BURN_IT' },
  { start: '0:49:560', name: '07_BACKWARD' },
  { start: '0:53:550', name: '01_BURN_IT' },
  { start: '0:57:500', name: '07_BACKWARD' },
  { start: '1:02:850', name: '08_UNBURN_IT' },
  { start: '1:21:290', name: '09_WORLDS_ALMOST_COOKED' },
  { start: '1:25:190', name: '10_ITS_ON_FIRE' },
  { start: '1:29:000', name: '11_MY_WORLDS_ON_FIRE' },
  { start: '1:33:160', name: '12_HOW_BOUT_YOURS' },
  { start: '1:37:440', name: '13_IVE_GOT_A_BAD_DESIRE' },
  { start: '1:41:840', name: '14_THAT_RING_OF_FIRE' },
  { start: '1:45:370', name: '13_IVE_GOT_A_BAD_DESIRE' },
  { start: '1:49:180', name: '15_OHOH_IM' },
  { start: '1:53:060', name: '16_BURNING' },
  { start: '2:13:880', name: '04_ASH_TO_ASH' },
  { start: '2:17:836', name: '05_DUST_TO_TRASH' },
  { start: '2:21:820', name: '06_BURN_IT_BACKWARD' },
  { start: '2:25:780', name: '01_BURN_IT' },
  { start: '2:29:250', name: '02_TINRUBNU' },
  { start: '2:33:620', name: '01_BURN_IT' },
  { start: '2:37:140', name: '03_DRAWKCAB' },
  { start: '2:41:650', name: '01_BURN_IT' },
  { start: '2:44:620', name: '07_BACKWARD' },
  { start: '2:48:640', name: '01_BURN_IT' },
  { start: '2:52:560', name: '07_BACKWARD' },
  { start: '2:58:000', name: '08_UNBURN_IT' },
]

const lyricsTimeToSeconds = (time: string): number => {
  const parts = time.split(':')
  return (
    parseInt(parts[0], 10) * 60 +
    parseInt(parts[1], 10) +
    parseInt(parts[2], 10) / 1000
  )
}

const getNode = (name: string, scene: Scene): Node => {
  const node = scene.getNodeByName(name)
  if (!node) {
    throw Error(`Node ${name} not found!`)
  }
  return node
}

const cloneLyric = (node: Node): InstancedMesh => {
  const instance = (node as Mesh).createInstance(`${node.name}-instance`)
  instance.setEnabled(true)
  return instance
}

const resetLyrics = (
  lyrics: LyricsState[],
  startY: number,
  ratio: number
): void => {
  lyrics.forEach((lyric) => {
    const offset = startY - lyric.start * ratio - lyricsYOffset - lyric.offset
    lyric.node.position = new Vector3(0, offset, 0)
    lyric.node.rotation = new Vector3(Math.PI / 2, 0, 0)
    lyric.aligned = false
  })
}
export function initLyrics(
  startY: number,
  ratio: number,
  scene: Scene
): LyricsState[] {
  lyricsConfigs.forEach(({ name }) => getNode(name, scene).setEnabled(false))

  const lyrics = lyricsConfigs.map(({ start, name }) => ({
    start: lyricsTimeToSeconds(start),
    offset: lyricsOffsets[name],
    node: cloneLyric(getNode(name, scene)),
    aligned: false,
  }))

  resetLyrics(lyrics, startY, ratio)

  return lyrics
}

export const alignLyrics = (
  lyrics: LyricsState[],
  time: number,
  cameraAlpha: number
): void => {
  const state = lyrics.find(({ start, aligned }) => time >= start && !aligned)

  if (state) {
    const { node } = state

    node.rotate(Axis.Y, -cameraAlpha - Math.PI / 2, Space.WORLD)
    node.translate(Axis.Y, 1.0)

    state.aligned = true

    node.setEnabled(true)
  }
}
