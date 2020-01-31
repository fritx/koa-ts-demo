import { bufferStringReplace } from '../../lib/buffer'

export let wrapScript = (str: string) => {
  // @experimental
  // @fixme use let window=_window
  str = str.replace(/window\.location/g, 'location')
  str = `
    with (__fakedWindow) {
      ${str}
    }
  `
  return str
}

export let rulesReplaceJs: PpRule[] = [
  {
    match: ctx => {
      return Boolean(
        ctx.response.is(['application/javascript', 'application/x-javascript'])
      )
    },
    transform: (req, res) => {
      let buf = res._ppBody
      buf = bufferStringReplace(buf, wrapScript)
      res._ppBody = buf
    },
  },
]
