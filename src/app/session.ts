import Koa from 'koa'
import RedisStore from 'koa-redis'
import session from 'koa-session'
import { redis } from '../redis/redis'

// https://github.com/koajs/session#example
export function appSession(app: Koa): void {
  app.keys = [process.env.APP_SESSION_KEYS]

  const config = {
    store: RedisStore({ client: redis }),
    key: 'koa:sess' /** (string) cookie key (default is koa:sess) */,
    /** (number || 'session') maxAge in ms (default is 1 days) */
    /** 'session' will result in a cookie that expires when session/browser is closed */
    /** Warning: If a session cookie is stolen, this cookie will never expire */
    maxAge: 86400000,
    autoCommit: true /** (boolean) automatically commit headers (default true) */,
    overwrite: true /** (boolean) can overwrite or not (default true) */,
    httpOnly: true /** (boolean) httpOnly or not (default true) */,
    signed: true /** (boolean) signed or not (default true) */,
    rolling: false /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */,
    renew: false /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/,
  }

  app.use(session(config, app))
}
