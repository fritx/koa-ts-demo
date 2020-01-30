import { Context } from 'koa'
import { safeUrlParse } from '../lib/url'
import { ppPrefix } from './config'

let setCookieRewriteEach = (s: string, ctx: Context) => {
  let urlObj = safeUrlParse(ctx.originalUrl)
  let ppPath = ppPrefix

  try {
    let targetOrigin = urlObj.pathname
      .replace(ppPrefix, '')
      .match(/^((https?:)?\/\/)?([^/]+)/i)[0]
    ppPath = `${ppPrefix}${targetOrigin}`
  } catch (err) {
    console.error(['cookie ppPath err', err])
  }

  // remove `secure`
  s = s.replace(/;\s*secure\s*/gi, '')

  // remove `domain`
  s = s.replace(/;\s*domain=[^;]*\s*/gi, '')

  // mutates `path`
  if (/;\s*path=.*?(;|$)/i.test(s)) {
    s = s.replace(
      /;\s*path=.*?(;|$)/g,
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
