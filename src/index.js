/*** Import Libraries ***/
const fs = require('fs');
const yaml = require('js-yaml');
const winston = require('winston');
const request = require('request');
const cheerio = require('cheerio');

/**
 * Winston logger configuration
 * @global
 * @type {winston.Logger}
 */
const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
          winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss.SSS'}),
          winston.format.printf((info) => {
            return info.timestamp + " " + info.level.toUpperCase() + "\t" + info.message;
          }))
    })
  ]
});

/**
 * Stores information
 * @global
 * @type {*[]}
 */
let stores = [];

/**
 * Wish items information
 * @global
 * @type {*[]}
 */
let items = [];

/**
 * Load stores information form src/stores.yaml
 * @function
 */
const loadStores = () => {
  try {
    logger.info("Loading stores information...");
    let fileContents = fs.readFileSync('./src/stores.yaml', 'utf8');
    stores = yaml.safeLoadAll(fileContents)[0];
    logger.info(JSON.stringify(stores));
  } catch (e) {
    logger.error(e);
  }
};

/**
 * Load items information form src/items.yaml
 * @function
 */
const loadItems = () => {
  try {
    logger.info("Loading items information...");
    let fileContents = fs.readFileSync('./src/items.yaml', 'utf8');
    items = yaml.safeLoadAll(fileContents);
    logger.info(JSON.stringify(items));
  } catch (e) {
    logger.error(e);
  }
};

/**
 * Check each wish items
 */
const makeWish = () => {

  items.forEach(item => {
    logger.info(item.name);

    item.stores.forEach(data => {
      const store = stores[data.store];
      logger.info("... Store: " + store.name);

      const payload = {
        url: data.url,
        headers: {
          "Accept": "application/json, text/plain, */*",
          "User-Agent": "axios/0.18.0"
        }
      };

      request(payload, (error, response, body) => {
        const $ = cheerio.load(body);
        const status = $(store.status_css_selector).text().trim();
        logger.info("...... Status: " + status);
      });
    });
  });
};

/**
 *  Doesn't work very well. Due to the web page has too many ajax calls to
 *  retrieve a lot of item's information. So the response data is not very
 *  accurate. So give up web crawler way. Use api parsing instead.
 */
loadStores();
loadItems();
makeWish();

