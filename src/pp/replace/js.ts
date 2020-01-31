import { wrapScript } from './common'

export let rulesReplaceJs: PpRule[] = [
  {
    match: ctx => {
      return Boolean(
        ctx.response.is(['application/javascript', 'application/x-javascript'])
      )
    },
    transform: (req, res) => {
      let s = res._ppBody
      s = wrapScript(s)
      res._ppBody = s
    },
  },
]
