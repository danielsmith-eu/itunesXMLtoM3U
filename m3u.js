'use strict'
module.exports = function() {
    var head = function() {
        return "#EXTM3U"
    }

    var add = function(id, track, artist, album, number) {
        return "#EXTINF:" + id + "," + track + " - " + artist + "\nfile:///music/" + artist + (album ? "/" + album : "") + "/" + (number ? number : "0") + ". " + track + ".mp3"
    }

    return {
        head: head,
        add: add,
    }
}
