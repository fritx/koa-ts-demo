import { ppPrefix } from './config'
import { Context } from 'koa'
import { safeUrlParse, completeUrlFull } from '../lib/url'

let getTargetUrlRaw = (url: string) => {
  let urlObj = safeUrlParse(url, null)
  let targetUrlRaw = urlObj.path.replace(ppPrefix, '')
  return targetUrlRaw
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let deppify = (v: any, protocol?: UrlProtocol) => {
  if (typeof v !== 'string') return v
  let targetUrlRaw = getTargetUrlRaw(v)
  let targetUrlFull = completeUrlFull(targetUrlRaw, protocol)
  return targetUrlFull
  // let s0 = url.match(/^((https?:)?\/\/)?/)[0]
  // let isPath = !s0 && url.startsWith('/')
  // if (isPath) return target.path
  // return `${s0}${target.origin}${target.path}`
}

// let urlDomainRegex = /((?:https?:)?\/\/)?([a-z0-9\-\.]+\.[a-z0-9\-\.]+)/i

// todo keep sync with ppify in config.ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let ppify = (v: any, ppCtx: Context) => {
  if (typeof v !== 'string') return v
  let nv = v
  // let domainMatched = false
  // nv = v.replace(urlDomainRegex, ($0, $1, $2) => {
  //   domainMatched = true
  //   let prefix = ''
  //   if ($1) {
  //     // `https?://` or `//`
  //     if (/^https?:\/\//i.test($1)) {
  //       prefix = ppCtx.origin
  //     } else if ($1.startsWith('//')) {
  //       prefix = ppCtx.origin.replace(/^https?:/, '')
  //     }
  //   } else {
  //     prefix = ppCtx.host
  //   }
  //   if (prefix) return `${prefix}${ppPrefix}${$2}`
  //   return $0
  // })
  // if (!domainMatched) {
  //   // let originalPathname = ppCtx.originalUrl.replace(ppCtx.search, '')
  //   let originalPathname = ppCtx.originalUrl.replace(/\?.*/, '')
  //   if (/^\/([^/]|$)/.test(v)) {
  //     nv = `${originalPathname.replace(/\/+$/, '')}${v}`
  //   }
  // }

  // let originalPathname = ppCtx.originalUrl.replace(ppCtx.search, '')
  let ppPathname = ppCtx.originalUrl.replace(/\?.*/, '')
  let ppEntry = `${ppCtx.origin}${ppPrefix}`
  // todo ^//
  if (/^https?:\/\//i.test(v)) {
    if (!v.startsWith(ppEntry)) {
      nv = `${ppEntry}${v}`
    }
  } else if (v.startsWith('//')) {
    let _entry = ppEntry.replace(/^https?:/, '')
    if (!v.startsWith(_entry)) {
      // nv = `${_entry}${v.replace(/^\/\//, '')}`
      nv = `${_entry}${v}` // keep original ^//
    }
  } else if (v.startsWith('/')) {
    let _path =
      ppPrefix +
      ppPathname.replace(ppPrefix, '').match(/^(?:(?:https?:)?\/\/)?.+?\//)[0]
    if (!v.startsWith(_path)) {
      nv = `${_path.replace(/\/+$/, '')}${v}`
    }
  }
  return nv
}
