import { ppParentPrefix, ppPrefix } from '../config'

// let urlDomainRegex = /((?:https?:)?\/\/)?([a-z0-9\-\.]+\.[a-z0-9\-\.]+)/i

// todo keep sync with ppify in config.ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let ppify = (v: any, ppCtx: PpCtx) => {
  if (typeof v !== 'string') return v
  let nv = v
  let targetOrigin = ppCtx.origin
  let { ppUrlObj } = ppCtx.state

  let ppOrigin = `${ppUrlObj.protocol}//${ppUrlObj.host}`
  let ppEntry = `${ppOrigin}${ppParentPrefix}${ppPrefix}`
  if (/^https?:\/\//i.test(v)) {
    if (!v.startsWith(ppEntry)) {
      nv = `${ppEntry}${v}`
    }
  } else if (v.startsWith('//')) {
    let _entry = ppEntry.replace(/^https?:/, '')
    if (!v.startsWith(_entry)) {
      nv = `${_entry}${v}` // keep original ^//
    }
  } else if (v.startsWith('/')) {
    let _path = `${ppParentPrefix}${ppPrefix}`
    if (!v.startsWith(_path)) {
      nv = `${_path}${targetOrigin}${v}`
    }
  }
  return nv
}
