require('./sourcemap-polyfill') // first

import * as Koa from 'koa'
// import * as helmet from 'koa-helmet'
import * as ratelimit from 'koa-ratelimit'
import { redis } from './lib/redis'
import { ppRoutes } from './pp/routes'

let host = process.env.HOST || 'localhost'
let port = +process.env.PORT || 3000
let app = new Koa()

process.on('uncaughtException', err => {
  console.error(['process.uncaughtException', err.stack])
  debugger
})

app.on('error', (err, ctx) => {
  // lintError(err)
  const status = err.status || 500
  // tslint:disable-next-line no-console
  console.error(`[koa error] status=${status}`, 'err=', err, ctx)

  // todo TypeError [ERR_UNESCAPED_CHARACTERS]: Request path contains unescaped characters
  // debugger
})

if (process.env.NODE_ENV === 'production') {
  app.use(
    ratelimit({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      db: redis as any, // fixme
      disableHeader: false,
      duration: 1000 * 10,
      errorMessage: 'Sometimes You Just Have to Slow Down.',
      headers: {
        remaining: 'Rate-Limit-Remaining',
        reset: 'Rate-Limit-Reset',
        total: 'Rate-Limit-Total',
      },
      id: ctx => ctx.ip,
      max: 20,
    })
  )
}

// app.use(helmet()) // 影响baidu登录?

app.use(ppRoutes)

app.listen(port, host, () => {
  console.log('[koa] listening at port', port, host)
})
