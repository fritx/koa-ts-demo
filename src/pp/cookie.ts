import { Context } from 'koa'
import { safeUrlParse } from '../lib/url'
import { ppPrefix } from './config'

let setCookieRewriteEach = (s: string, ctx: Context) => {
  let urlObj = safeUrlParse(ctx.originalUrl)
  let ppPath = '/'

  try {
    ppPath = urlObj.pathname
      .replace(ppPrefix, '')
      .match(/^((https?:)?\/\/)?([^/]+)/i)[3]
  } catch (err) {
    console.error(['ppPath err', err])
  }

  // remove `secure`
  s = s.replace(/;\s*secure\s*/gi, '')

  // remove `domain`
  s = s.replace(/;\s*domain=[^;]*\s*/gi, '')

  // mutates `path`
  if (/;\s*path=.*?(;|$)/i.test(s)) {
    s = s.replace(
      /;\s*path=(.*?)(;|$)/g,
      `; path=${ppPath}$1`.replace(/\/+$/, '')
    )
  } else {
    s += `; path=${ppPath}`
  }
  return s
}

export let setCookieRewrite = (v: string | string[], ctx: Context) => {
  if (Array.isArray(v)) {
    return v.map(s => {
      return setCookieRewriteEach(s, ctx)
    })
  }
  return setCookieRewriteEach(v, ctx)
}
