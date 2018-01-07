/**
 * Module dependencies.
 */

import request from 'request';
import cheerio from 'cheerio';
import * as async from 'async';

let jsonSongArray = [{'songName': '', 'artist': ''}];

/**
 * Crawl function.
 */

function findSongFromYoutubeUrl(url, callback) {
  request(url, function(error, response, html) {
    if (!error) {
      let $ = cheerio.load(html);

      let songName;
      let artist;
      console.log('test2');
      $('.title.style-scope.ytd-video-primary-info-renderer').filter(function() {
        console.log('test3');
        let data = $(this);
        let title = data.text();
        let splittedSong = title.split(/[ ]+[-]+[ ]+/);
        artist = splittedSong[0];
        songName = splittedSong[1];
        console.log(artist);
        jsonSongArray.push({'songName': songName, 'artist': artist});
        callback();
      });
    }
  });
};

function crawl(url) {
  request(url, function(error, response, html) {
    if (!error) {
      let $ = cheerio.load(html);
      async.series([
        function(callback) {
          let filteredHTML = $('.url').filter(function() {
            let data = $(this);
            console.log('masdf');
            return data;
          });
          let pattern = /youtube/i;
          let elements = [];
          for (let i = 0; i < filteredHTML.length; i++) {
             elements.push(i);
          }
          async.forEachOf(elements, function(elementVal, elementKey, callback2) {
            if (pattern.test(filteredHTML[elementVal].attribs.href)) {
              findSongFromYoutubeUrl(filteredHTML[elementVal].attribs.href, callback2);
            } else {
              return callback2();
            }
          }, function(result) {
              return callback();
          });
        },
        function(callback) {
          for (const song of jsonSongArray) {
            console.log(song.songName + ' ' + song.artist);
            console.log('asdf');
          }
          callback();
        },
      ]);
    }
  });
}


/**
 * Exports.
 */

export {crawl};
