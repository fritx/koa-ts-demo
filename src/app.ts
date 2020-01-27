import './sourcemap-polyfill'
import * as Koa from 'koa'
import * as helmet from 'koa-helmet'
import * as ratelimit from 'koa-ratelimit'
import { redis } from './redis'
import { routes } from './routes'
import { ppRoutes } from './pp/routes'

let port = process.env.PORT || 3000
let app = new Koa()

app.on('error', err => {
  // lintError(err)
  const status = err.status || 500
  // tslint:disable-next-line no-console
  console.error(`[koa error] status=${status}`, 'err=', err)
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

app.use(helmet())

app.use(routes)

app.use(ppRoutes)

app.listen(port, () => {
  console.log('[koa] listening at port', port)
})
