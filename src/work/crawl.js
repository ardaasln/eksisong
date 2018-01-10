/**
 * Module dependencies.
 */

import request from 'request';
import cheerio from 'cheerio';
import * as async from 'async';
import * as youtube from './youtube.js';
import * as www from '../bin/www.js';


let jsonSongArray = [{'songName': '', 'artist': ''}];

/**
 * Crawling YouTube.
 */

function findSongFromYoutubeUrl(url, callback) {
  // Getting id field from url
  let splittedUrl = url.split(/[=]+/);
  let id = splittedUrl[1];

  // Authorize a client with the loaded credentials, then call the YouTube API.
  youtube.authorize(www.clientSecrets, {'params': {'id': id,
                                        'part': 'snippet',
                                        'fields': 'items/snippet'}},
                                        youtube.videosListById,
                                        callback);
};

/**
 * Main crawl function.
 */

function crawl(url, mainCallback) {
  request(url, (error, response, html) => {
    if (!error) {
      let $ = cheerio.load(html);
      async.series([
        (callback) => {
          let filteredHTML = $('.url').filter( () => {
            let data = $(this);
            return data;
          });
          let pattern = /youtube/i;
          let elements = [];
          for (let i = 0; i < filteredHTML.length; i++) {
             elements.push(i);
          }
          async.forEachOf(elements, (elementVal, elementKey, callback2) => {
            if (pattern.test(filteredHTML[elementVal].attribs.href)) {
              findSongFromYoutubeUrl(filteredHTML[elementVal].attribs.href, callback2);
            } else {
              return callback2();
            }
          }, (result) => {
              return callback();
          });
        },
        (callback) => {
          for (const song of jsonSongArray) {
            console.log(song.songName + ' ' + song.artist);
          }
          callback();
        },
      ]);
    }
    mainCallback();
  });
}

/**
 * Exports.
 */

export {crawl};
