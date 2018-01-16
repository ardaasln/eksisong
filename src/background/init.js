
import * as async from 'async';
import * as fs from 'fs';

import * as crawler from '../lib/crawl.js';
import * as youtube from '../lib/youtube.js';
import * as mongo from '../db/mongo.js';

let clientSecrets = '';

// No change so 'const'
const mainUrl = 'https://eksisozluk.com/su-anda-calan-sarki--2405586';

function backgroundTask() {
  /**
   * Connect to db
   */

  mongo.connect();

  /**
   * YouTube Auth & Crawling
   */

  async.series([
    (callback) => {
      fs.readFile('youtube_client.json', function processClientSecrets(err, content) {
        if (err) {
          console.log('Error loading client secret file: ' + err);
          return;
        }
        let parsedContent = JSON.parse(content);
        clientSecrets = parsedContent;
        youtube.authorize(parsedContent, callback);
      });
    },
    (callback) => {
      // Crawl once to get total page count
      crawler.crawl(mainUrl, callback);
    },
  ], (err, results) => {
    let elements = [];
    let url = mainUrl;
    for (let i = 2; i <= results[1]; i++) {
      elements.push(i);
    }
    async.forEachOfLimit(elements, 2, (elementVal, elementKey, callback) => {
      url = mainUrl + '?p=' + elementVal;
      crawler.crawl(url, callback);
    });
  });
}

export {backgroundTask, clientSecrets};
