import { Application, Sprite, WRAP_MODES, filters, Loader } from 'pixi.js'
import './styles.css'
import BackgroundImage from './unburn1M-CVWingren-scaled.jpg'
import DisplacementImage from './displacement.jpg'

const width = window.innerWidth
const height = window.innerHeight
const app = new Application({ width, height })
const { stage, view, ticker } = app

const createBackgroundSprite = (texture) => {
  const sprite = Sprite.from(texture)

  const ratio = Math.max(
    width / sprite.texture.width,
    height / sprite.texture.height
  )
  sprite.position.set(width / 2, height / 2)
  sprite.scale.set(ratio)
  sprite.anchor.set(0.5)

  return sprite
}

const createDisplacementSprite = (texture) => {
  const sprite = Sprite.from(texture)
  sprite.texture.baseTexture.wrapMode = WRAP_MODES.REPEAT
  sprite.scale.x = 0.25
  sprite.scale.y = 0.25
  return sprite
}

const loader = new Loader()
loader.add('background', BackgroundImage).add('displacement', DisplacementImage)
loader.load((_, { background, displacement }) => {
  const bgSprite = createBackgroundSprite(background.texture)
  stage.addChild(bgSprite)

  const dispSprite = createDisplacementSprite(displacement.texture)
  stage.addChild(dispSprite)

  const filter = new filters.DisplacementFilter(dispSprite)

  let time = 0
  ticker.add(() => {
    stage.filters = [filter]
    dispSprite.x = -time
    dispSprite.y = time
    time++
  })

  document.body.appendChild(view)
})
