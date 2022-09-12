# itunesXMLtoM3U
Scan iTunes XML libraries for file presence and integrity and export them to M3U playlists.

## Usage

Verify that your itunes library xml file is up to date, which is commonly ensured by itunes.

If not, export it manually within itunes by calling the menu option File > Library > Export Library and selecting to "Export as XML" within the save file dialog.


To dump all library items as m3u with basic extended information, run:

    node convert.js /path/to/library.xml > library.m3u

You will then have an M3U file of your library called library.m3u.

To scan all library items and verify them by means of ffmpeg, run:

	node scan.js (presence) (again) (continue) /path/to/library.xml

    presence: Only check whether files exist
    continue: Continue interrupted scan
    again: Re-Scan files previously marked as broken

Following files are stored to the library's folder:

    _all.m3u: Contains all scanned files
    _failed.m3u / _failedagain.m3u: Contain files determined to be broken (again)

To export all of the library's playlists (including master playlists by media type) as simple m3u files to the library's folder, run:

    node export.js /path/to/library.xml


## Why M3U?

This is a format supported by Soundiiz.

## What is Soundiiz?

It is a tool to move music metadata (tracks) between online music platforms.

For example, it allows you to login to Spotify and add a playlist of tracks from another platform, or in the case of Apple Music/iTunes, from a playlist.

If you want to move your whole library though, you will need to use this app to convert it.

Soundiiz is available here: <https://soundiiz.com/converter>

## Why not just use [my favourite tool] ?

I didn't find it in the 10 minutes I googled for a tool, and it didn't take me long to write this.
