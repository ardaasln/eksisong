/**
 * Module dependencies.
 */

import request from 'request';
import cheerio from 'cheerio';
import * as async from 'async';
import * as youtube from './youtube.js';
import * as www from '../bin/www.js';

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
  let pageCount;
  console.log(url);
  request(url, (error, response, html) => {
    if (!error) {
      let $ = cheerio.load(html);
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
          if (url.includes('?p=')) {
            return mainCallback();
          }
          let pageCountFilter = $('.pager').filter( () => {
            let data = $(this);
            return data;
          });
          return mainCallback(null, pageCountFilter[0].attribs['data-pagecount']);
        });
    } else {
      console.log('error : ' + error);
      return mainCallback();
    }
  });
}

/**
 * Exports.
 */

export {crawl};
