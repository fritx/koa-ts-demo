import { completeUrlFull, safeUrlParse } from '../../lib/url'
import { ppPrefix } from '../config'

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
