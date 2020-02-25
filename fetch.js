const request = require('request-promise-native');

class UberflipSource {
  constructor(grant_type, client_id, client_secret) {

    this._grant_type = grant_type;
    this._client_id = client_id;
    this._client_secret = client_secret;

    this.baseURL = 'https://v2.api.uberflip.com';
  }

  async getAccessToken() {
    const url = `${this.baseURL}/authorize?grant_type=${this._grant_type}&client_id=${this._client_id}&client_secret=${this._client_secret}`;
    const data = await request.post(url);
    return JSON.parse(data)
  }

  async getStreams(access_token) {
    const url = `${this.baseURL}/streams/`;
    const data = await request.get(url, {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    return JSON.parse(data)
  }

  async getStreamItems(access_token) {
    const url = `${this.baseURL}/streams/5722346/items`;
    const data = await request.get(url, {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    return JSON.parse(data)
  }

}

module.exports = {
  UberflipSource
};