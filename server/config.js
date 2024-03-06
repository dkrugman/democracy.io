/**
 * Server config import target, used to work around https://github.com/lorenwest/node-config/wiki/Strict-Mode
 *
 * pm2 sets a NODE_APP_INSTANCE that causes problems with config load. To workaround this,
 * move NODE_APP_INSTANCE aside during configuration loading
 */

process.env.NODE_APP_INSTANCE = 'production';
var config = require('config').get('SERVER');
// @ts-ignore
config.VERSION = require('./../package.json').version;

module.exports = config;
