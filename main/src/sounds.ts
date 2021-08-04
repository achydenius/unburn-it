import { Howl } from 'howler'
import center from './assets/1(CENTER)_ENTRY_26.07.21.mp3'
import left from './assets/2(LEFT)_ENTRY_26.07.21.mp3'
import right from './assets/3(RIGHT)_ENTRY_26.07.21.mp3'
import back from './assets/4(BACK)_ENTRY_26.07.21.mp3'
import hover from './assets/PLAY_HOVER.mp3'
import click from './assets/PLAY_CLICK.mp3'

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

type Sounds = { [id: string]: Howl }

export default class SoundLoader {
  private files = { center, left, right, back, hover, click }

  public sounds: Sounds | undefined

  async load(): Promise<void> {
    const sounds = await Promise.all(
      Object.values(this.files).map((src) => loadSound(src))
    )

    this.sounds = Object.keys(this.files).reduce<Sounds>((acc, id, i) => {
      acc[id] = sounds[i]
      return acc
    }, {})
  }

  getSound(id: string): Howl {
    if (!this.sounds) {
      throw Error('Sounds not loaded – call load() first!')
    }

    if (!this.sounds[id]) {
      throw Error(`Sound ${id} not defined!`)
    }

    return this.sounds[id]
  }

  getBackgroundSounds(): Howl[] {
    return ['center', 'left', 'right', 'back'].map((id) => this.getSound(id))
  }
}
