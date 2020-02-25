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

    const promiseArray = []

    streamData.data.map(stream => {
      promiseArray.push(fetcher.getStreamItems(tokenInfo.access_token, stream.id))
    })

    log(`
      ${chalk.blue('info')} fetched from Uberflip API:
      ${chalk.bold(streamData.data.length)} streams
    `);

    await Promise.all(promiseArray).then(async (streams) => {
      streams.map(items => {
        items.data.map(item => {
        console.log('item !!!!!!!!', item)
        const boardDigest = crypto.createHash(`md5`).update(JSON.stringify(item.id)).digest(`hex`);
        createNode({
          id: 'Uberflip__Stream__'+item.id,
          name: item.title,
          title: item.title,
          description: item.description,
          url: item.url,
          thumbnail_url: item.thumbnail_url,
          parent_stream: item.stream.id,
          internal: {
            type: 'UberflipStream',
            contentDigest: boardDigest
          }
        });
      })
      })
    })

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};