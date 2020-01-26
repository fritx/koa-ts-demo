import { ppPrefix } from './config'
import { Context } from 'koa'

let urlDomainRegex = /((?:https?:)?\/\/)?([a-z0-9\-\.]+\.[a-z0-9\-\.]+)/i

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let ppify = (v: any, ppCtx: Context) => {
  if (typeof v === 'string') {
    return v.replace(urlDomainRegex, ($0, $1, $2) => {
      let prefix = ''
      if ($1) {
        // `https?://` or `//`
        if ($1.startsWith('http')) {
          prefix = ppCtx.origin
        } else if ($1.startsWith('//')) {
          prefix = ppCtx.origin.replace(/^https?:/, '')
        }
      } else {
        prefix = ppCtx.host
      }
      if (prefix) return `${prefix}${ppPrefix}${$2}`
    })
  }
  return v
}
