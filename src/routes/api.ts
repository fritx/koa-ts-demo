import koaBody from 'koa-body'
import Router from 'koa-router'

const router: MyRouter = new Router()

router.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    const status = err.status || 500
    console.error(`[api error] status=${status}`, 'err=', err)
    ctx.status = status
    ctx.body = { status, error: String(err) }
  }
})

router.all('/error', async () => {
  throw new Error('test')
})

router.get('/session', koaBody(), async (ctx) => {
  const lastRand = ctx.session.rand
  const currRand = Math.random()
  ctx.session.rand = currRand
  ctx.body = { lastRand, currRand }
})

router.post('/login', koaBody(), async (ctx) => {
  ctx.session.userId = Math.random()
  ctx.status = 204
})

router.post('/logout', async (ctx) => {
  ctx.session = null
  ctx.status = 204
})

router.get('/get', async (ctx) => {
  ctx.body = {
    query: ctx.query,
  }
})

router.post('/post', koaBody(), async (ctx) => {
  ctx.body = {
    query: ctx.query,
    body: ctx.request.body,
  }
})

export const apiRoutes = router.routes()
