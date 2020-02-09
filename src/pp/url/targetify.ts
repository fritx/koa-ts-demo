import { completeUrlFull, safeUrlParse } from '../../lib/url'
import { ppPrefix } from '../config'

let getTargetUrlRaw = (url: string) => {
  let urlObj = safeUrlParse(url, null)
  let targetUrlRaw = urlObj.path.replace(ppPrefix, '')
  return targetUrlRaw
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let targetifyFull = (v: any, protocol?: UrlProtocol) => {
  if (typeof v !== 'string') return v
  let targetUrlRaw = getTargetUrlRaw(v)
  let targetUrlFull = completeUrlFull(targetUrlRaw, protocol)
  return targetUrlFull
  // let s0 = url.match(/^((https?:)?\/\/)?/)[0]
  // let isPath = !s0 && url.startsWith('/')
  // if (isPath) return target.path
  // return `${s0}${target.origin}${target.path}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let targetifyFit = (v: any, targetUrlFull: string) => {
  if (typeof v !== 'string') return v
  let urlObj = safeUrlParse(v)
  let targetUrlObj = safeUrlParse(targetUrlFull)
  let cut = targetUrlFull

  if (['', '/'].includes(urlObj.path)) {
    let { protocol, host } = targetUrlObj
    let targetOrigin = `${protocol}//${host}`
    if (v.endsWith('/')) targetOrigin += '/'
    cut = targetOrigin
  }

  if (/^https?:\/\//i.test(v)) return cut
  if (/^\/\//i.test(v)) return cut.replace(/^https?:/, '')
  if (/^\//i.test(v)) return targetUrlObj.path
  return cut.replace(/^https?:\/\//, '')
}
