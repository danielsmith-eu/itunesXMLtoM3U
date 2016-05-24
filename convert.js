'use strict'
var fs = require('fs')
var plist = require('plist')
var M3U = require('./m3u')

if (process.argv.length < 3) {
    console.log('Usage: node convert.js [INPUT XML FILE]')
    process.exit(1)
}

var playlist = M3U()
console.log(playlist.head())

var itunes = plist.parse(fs.readFileSync(process.argv[2], 'utf8'))
for (var trackID in itunes.Tracks) {
    var track = itunes.Tracks[trackID]
    console.log(playlist.add(trackID, track.Name , track.Artist, track.Album, track['Track Number']))
}


