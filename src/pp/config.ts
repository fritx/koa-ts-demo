export let ppPrefix = process.env.PREFIX || '/--/'

// sometimes Error: unexpected end of file
// at Zlib.zlibOnError [as onerror] (zlib.js:170:17)
// export let ppEncodingMode: PpEncodingMode = 'try-unzip'
export let ppEncodingMode: PpEncodingMode = 'disable-accept'
