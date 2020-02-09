import { bufferStringReplace } from '../../lib/buffer'

export let wrapScript = (str: string) => {
  // @experimental
  // use let window=_window instead √
  // str = str.replace(/window\.location/g, 'location')
  if (str) {
    str = `
    with (__fakedWindow) {
      let window = __fakedWindow
      let parent = __fakedWindow
      let self = __fakedWindow
      let top = __fakedWindow
      ;${str}
    }
  `
  }
  return str
}
export let ppifyScript = wrapScript

// against ppifyScript
export let targetifyScript = (str: string) => {
  if (str) {
    let mat = str.match(/__fakedWindow\s*;([\s\S]*)\s*\}\s*/)
    if (mat) str = mat[1]
  }
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
