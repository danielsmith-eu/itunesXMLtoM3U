'use strict'
var fs = require('fs')
var plist = require('plist')
var path = require('path')
const { spawnSync } = require('child_process');

// Check argument count
if (process.argv.length < 3) {
    console.log('Usage: node scan.js [presence (of files only)] [again] [continue] [INPUT XML FILE]')
    console.log('Scans file presence (and by default file integrity using ffmpeg) of given xml file.')    
    process.exit(1)
}

// Search path by media folder naming convention
const searchpath = 'iTunes Media'

var ipath = ''	// Input path
var rmode = 0	// Re-Evaluate
var cmode = 0	// Continue
var qmode = 0	// Presence only

// Parse arguments
for (var i=2; i<process.argv.length - 1; i++) {
	switch (process.argv[i]) {
		case 'presence': { qmode = 1; console.log('Only checking file presence.'); break; }
		case 'continue': { cmode = 1; console.log('Continueing previous (re)scan.'); break; }
		case 'again': { rmode = 1; cmode = 1; console.log('Re-evaluating known broken files.'); break; }
	}
}
ipath = process.argv[process.argv.length - 1];

// Notify if default mode
if (!rmode) { console.log('Scanning xml library for broken files.'); }

// Check ffmpeg presence if required
if (!qmode) {
	try {
		const res = spawnSync('which', [ 'ffmpeg' ]); if (res.status) { throw 'ffmpegnotfound'; }
	} catch (e) {
		console.log('Unable to find ffmpeg which is required for testing files.'); process.exit(2);
	}
}

// Determine base path
var basepath = path.dirname(ipath)
console.log('Base path: ' + basepath);

// Set up buffers and counters
var allsongs = []

var failedsongs = []

// Execute according to mode
try {
	if (cmode > 0) { plread(); }
	if (!rmode) { itcheck(); } else { plcheck(); }
} catch (e) {
	console.log('(Re)scan failed: ' + e);
	process.exit(3)
}
process.exit(0)

function itcheck() {

	// Load library and determine item count
	console.log('Loading library file...')
	var itunes = plist.parse(fs.readFileSync(ipath, 'utf8'))
	var allcount = Object.keys(itunes.Tracks).length
	console.log('Library loaded (' + allcount + ' tracks).')

	// Set up counters
	var curcount = 0
	var failedcount = 0
	var skipcount = allsongs.length
	if (skipcount) { curcount = skipcount; console.log('Skipping ' + skipcount + ' tracks.'); }
	console.log('')

	// Iterate over all tracks
	for (var trackID in itunes.Tracks) {
		if (skipcount) { skipcount--; continue; } // Skip in continue mode

		// Determine track path and process file if it is local
		var track = itunes.Tracks[trackID]
		var rpath = track.Location
		if (rpath && rpath.startsWith('file://')) {
			rpath = decodeURIComponent(track.Location); rpath = rpath.substring(rpath.lastIndexOf(searchpath));
			var tpath = path.join(basepath, rpath)

			// Check for presence
			if (!fs.existsSync(tpath)) {
				failedsongs.push(rpath); failedcount++;

			} else if (!qmode) {
				try { // Check for integrity failing on any kind of ffmpeg error
					const res = spawnSync('ffmpeg', ['-v', 'error', '-i', tpath, '-f',  'null', '-']);
					if (res.stderr.length) { throw res.stderr; }
				} catch (e) {
					failedsongs.push(rpath); failedcount++;
				}
			}
		}

		// Add to list of all items
		allsongs.push(rpath)

		// Count, notify status and flush regularly
		curcount++;
		if (curcount % 5 == 0) { dostatus(curcount, allcount, failedcount); }
		if (curcount % (100 + (qmode * 900)) == 0) { plflush(failedcount); }
	}

	// Final flush and report
	plflush(failedcount);
	doreport(allcount, failedcount);
}

function plcheck() {
	
	console.log('Rechecking ' + failedsongs.length + ' failed songs...')

	// Set up counters
	var allcount = failedsongs.length;
	var curcount = 0
	var failedcount = 0
	var newfailedsongs = []

	// Iterate over all tracks determined to be broken
	for (var i=0; i<failedsongs.length; i++) {
		
		var tpath = path.join(basepath, failedsongs[i])
		try {
			// Check for presence
			if (!fs.existsSync(tpath)) { throw 'File not found (' + tpath + ')'; }

			if (!qmode) { // Check for integrity
				const res = spawnSync('ffmpeg', ['-v', 'error', '-i', tpath, '-f',  'null', '-']); //, '2>&1'
				if (res && res.stderr.length) { throw res.stderr; }
			}
		} catch (e) {
			// Add to list of tracks that are still broken
			newfailedsongs.push(failedsongs[i])
			failedcount++
		}
		curcount++;
		if (curcount % 5 == 0) { dostatus(curcount, allcount, failedcount); }
	}

	// Update arrays, flush and report
	failedsongs = newfailedsongs
	plflush(failedcount);
	doreport(allcount, failedcount);
}

function dorelog(newlog) {
	process.stdout.clearLine(0); process.stdout.cursorTo(0); process.stdout.write(newlog);
}

function doreport(rall, rfailed) {
	console.log('');
	console.log('Found ' + rall + ' files, ' + rfailed + ' failed.')
}

function dostatus(rcur, rall, rfailed) {
	dorelog('Processed ' + rcur + ' of ' + rall + ' files, ' + rfailed + ' failed.');
}

function plflush(rfailed) {
	if (!rmode) {
		console.log(''); console.log('Writing all songs to ' + basepath + '/_all.m3u ...')
		fs.writeFileSync(path.join(basepath, '_all.m3u'), allsongs.join('\n') + '\n', { flag: 'w+' });
	}

	var failedpath = '_failed.m3u'; if (rmode) { failedpath = '_failedagain.m3u'; }
	if (rfailed) {
		console.log('Writing failed songs to ' + basepath + failedpath + ' ...')
		fs.writeFileSync(path.join(basepath, failedpath), failedsongs.join('\n') + '\n', { flag: 'w+' });
	} else if (fs.existsSync(path.join(basepath, failedpath))) {
		fs.unlinkSync(path.join(basepath, failedpath))
	}
}

function plread() {
	try {
		console.log('Reading existing scan...')
		if (!fs.existsSync(basepath + '/_all.m3u')) { return; }
		allsongs = fs.readFileSync(path.join(basepath, '_all.m3u'), {encoding: 'utf-8'}).split('\n');
		if (!allsongs[allsongs.length - 1].length) { allsongs.pop(); }
		
		if (!fs.existsSync(basepath + '/_failed.m3u')) { return; }
		failedsongs = fs.readFileSync(path.join(basepath, '_failed.m3u'), {encoding: 'utf-8'}).split('\n');
		if (!failedsongs[failedsongs.length - 1].length) { failedsongs.pop(); }
		
		console.log('Existing scan read (' + allsongs.length + ' all, ' + failedsongs.length + ' failed).')
	} catch (e) {
		console.log('Failed to read exisiting lists (' + e + ')')
		allsongs = []
		failedsongs = []
	}
}
