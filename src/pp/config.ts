export let ppPrefix = process.env.PREFIX || '/--/'

export let ppParentPrefix = process.env.PARENT_PREFIX || ''

export let ppFullPrefix = `${ppParentPrefix}${ppPrefix}`

// sometimes Error: unexpected end of file
// at Zlib.zlibOnError [as onerror] (zlib.js:170:17)
// export let ppEncodingMode: PpEncodingMode = 'try-unzip'
export let ppEncodingMode: PpEncodingMode = 'disable-accept'
