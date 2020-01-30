export let rulesReplaceCss: PpRule[] = [
  {
    match: ctx => {
      return Boolean(ctx.response.is('text/css'))
    },
    transform: (req, res) => {
      res._ppBody = res._ppBody
    },
  },
]
