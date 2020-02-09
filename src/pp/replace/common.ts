export let safeInterpolate = /'%%{{(.+?)}}'/g // safer

export let tagAttrsArr = [
  ['a', 'href'],
  ['area', 'href'],
  ['base', 'href'],
  ['form', 'action'],
  // https://www.jianshu.com/p/8c6c47f0eac6 data-original-src
  // ['img', 'src', 'data-src', 'data-original-src'],
  ['img', 'src', 'data-src'],
  ['frame', 'src'],
  ['iframe', 'src'],
  ['script', 'src', 'data-src'],
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
