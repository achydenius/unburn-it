import { Howl } from 'howler'
import center from './assets/1(CENTER)_ENTRY_26.07.21.mp3'
import left from './assets/2(LEFT)_ENTRY_26.07.21.mp3'
import right from './assets/3(RIGHT)_ENTRY_26.07.21.mp3'
import back from './assets/4(BACK)_ENTRY_26.07.21.mp3'

const loadSound = async (src: string): Promise<Howl> =>
  new Promise((resolve, reject) => {
    const howl = new Howl({
      src,
      preload: false,
    })
    howl.once('load', () => resolve(howl))
    howl.once('loaderror', () => reject(howl))
    howl.load()
  })

export default async function loadSounds(): Promise<Howl[]> {
  const files = [center, left, right, back]
  return Promise.all(files.map((file) => loadSound(file)))
}
