'use strict'
var fs = require('fs')

var plist = require('plist')
var path = require('path')
const { spawnSync } = require('child_process');

if (process.argv.length < 3) {
    console.log('Usage: node export.js [INPUT XML FILE]')
    console.log('Outputs all available playlists as simple m3u to the folder of the xml file.')
    process.exit(1)
}

var dolog = 1
var ipath = ''
var searchpath = 'iTunes Media'

// Determine input and base path
ipath = process.argv[process.argv.length - 1];
var basepath = path.dirname(ipath)
console.log('Base path: ' + basepath);

// Load library and determine item count
console.log('Loading library file...')
var itunes = plist.parse(fs.readFileSync(ipath, 'utf8'))
var allcount = Object.keys(itunes.Playlists).length
console.log('Library loaded (' + allcount + ' playlists). Exporting playlists relative to ' + basepath + ' .')

// Iterate over all playlists
for (var plId in itunes.Playlists) {

	try {
		// Determine playlist (file) name
		var pl = itunes.Playlists[plId];
		var plfile = pl.Name.replace(/[/\\?%*:|"<>]/g, ' ') + '.m3u';
		var curpl = [];

		// Iterate over all playlist items if present
		if (pl['Playlist Items'] && pl['Playlist Items'].length) {
			console.log('Exporting ' + pl.Name + ' with ' + pl['Playlist Items'].length + ' items (' + plfile + ')');
			for (var i = 0; i < pl['Playlist Items'].length; i++) {

				// Determine playlist item track id
				var trID = pl['Playlist Items'][i]['Track ID'];
				if (trID) {
					// Determine playlist item track path and store to array
					var trLoc = trLocation(trID);
					if (trLoc && trLoc.length) { curpl.push(trLoc); }
				}

			}

			// Flush playlist array as simple m3u
			fs.writeFileSync(path.join(basepath, plfile), curpl.join('\n') + '\n', { flag: 'w+' });
		} else {
			console.log('Skipping playlist ' + pl.Name + ' as it is empty');
		}
	} catch (e) {
		console.log('Failed to export playlist (' + e + ')');
	}
}

console.log('Exports completed.')
process.exit(0)

function trLocation(trID) {

	// Unescape track location if it is a local file
	var rpath = itunes.Tracks[trID].Location;
	if (rpath && rpath.length && rpath.startsWith('file://')) {
		rpath = decodeURIComponent(rpath);
		rpath = rpath.substring(rpath.lastIndexOf(searchpath));
	}
	//console.log('	' + trID + ':' + rpath);
	return rpath;

}
