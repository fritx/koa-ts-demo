import { bufferStringReplace } from '../../lib/buffer'
import { ppify } from '../url/ppify'

export let replaceCssUrl = (str: string, ctx: PpCtx) => {
  return str.replace(/url\((.+?)\)/g, ($0, $1) => {
    return `url(${ppify($1, ctx)})`
  })
}

export let rulesReplaceCss: PpRule[] = [
  {
    match: ctx => {
      return Boolean(ctx.response.is('text/css'))
    },
    transform: (req, res) => {
      let buf = res._ppBody
      buf = bufferStringReplace(buf, str => {
        return replaceCssUrl(str, res._ppCtx)
      })
      res._ppBody = buf
    },
  },
]
