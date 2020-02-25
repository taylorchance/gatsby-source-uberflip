const { UberflipSource } = require('./fetch.js');
const crypto = require('crypto');
const chalk = require('chalk');
const log = message => console.log('\n', message);

let _grant_type;
let _client_id;
let _client_secret;

exports.sourceNodes = async ({ boundActionCreators }, {
  grant_type,
  client_id,
  client_secret,
}) => {
  const { createNode } = boundActionCreators;
  _grant_type = grant_type;
  _client_id = client_id;
  _client_secret = client_secret;

  try {
    const fetcher = new UberflipSource(_grant_type, _client_id, _client_secret);

    const tokenInfo = await fetcher.getAccessToken(_grant_type, _client_id, _client_secret);
    const streamData = await fetcher.getStreams(tokenInfo.access_token);
    const streamItemData = await fetcher.getStreamItems(tokenInfo.access_token);

    log(`
      ${chalk.blue('info')} fetched from Uberflip API:
      ${chalk.bold(streamData.data.length)} streams,
      ${chalk.bold(streamItemData.data.length)} stream items for 5722346,
    `);

    streamItemData.data.map(stream => {
      const boardDigest = crypto.createHash(`md5`).update(JSON.stringify(stream.id)).digest(`hex`);
      createNode({
        id: 'Uberflip__Stream__'+stream.id,
        name: stream.title,
        title: stream.title,
        description: stream.description,
        thumbnail_url: stream.thumbnail_url,
        internal: {
          type: 'UberflipStream',
          contentDigest: boardDigest
        }
      });
    })
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};