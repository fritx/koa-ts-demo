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

export let wrapScript = (str: string) => {
  // @experimental
  // @fixme use let window=_window
  str = str.replace(/window\.location/g, 'location')
  str = `
    with (__fakedWindow) {
      ${str}
    }
  `
  return str
}
