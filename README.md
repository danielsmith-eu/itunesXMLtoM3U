# itunesXMLtoM3U
Convert iTunes XML library to an M3U playlist

## Usage

First, export your itunes library:

Go to iTunes, then menu option: File > Library > Export Library

Select the option to "Export as XML", and then run this app like this:

    node convert.js library.xml > library.m3u

You will then have an M3U file of your library called library.m3u.

The actual filenames are not used, instead they are anonymised into faux filenames using the album name etc.

## Why import iTunes Libraries?

You might want to move from Apple Music to Spotify or another platform.

## Why M3U?

This is a format supported by Soundiiz.

## What is Soundiiz?

It is a tool to move music metadata (tracks) between online music platforms.

For example, it allows you to login to Spotify and add a playlist of tracks from another platform, or in the case of Apple Music/iTunes, from a playlist.

If you want to move your whole library though, you will need to use this app to convert it.

Soundiiz is available here: <https://soundiiz.com/converter>

## Why not just use [my favourite tool] ?

I didn't find it in the 10 minutes I googled for a tool, and it didn't take me long to write this.


