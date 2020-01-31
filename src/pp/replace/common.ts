export let safeInterpolate = /'%%{{(.+?)}}'/g // safer

export let tagAttrsArr = [
  ['a', 'href'],
  ['area', 'href'],
  ['base', 'href'],
  ['form', 'action'],
  ['img', 'src'],
  ['frame', 'src'],
  ['iframe', 'src'],
  ['script', 'src'],
  ['link', 'href'],
]

export let wrapScript = (v: string | Buffer) => {
  let isBuffer = Buffer.isBuffer(v)
  v = isBuffer ? v.toString() : (v as string)

  // @experimental
  // @fixme use let window=_window
  v = v.replace(/window\.location/g, 'location')
  v = `
    with (__fakedWindow) {
      ${v}
    }
  `
  if (isBuffer) v = Buffer.from(v)
  return v
}
