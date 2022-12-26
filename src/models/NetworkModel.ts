import { https } from "follow-redirects";
import { IncomingMessage } from "http";

class NetworkModel {

  /**
   * Formats a json object for including as
   * parameters in a web request
   * @param json 
   */
  formatJson(json: Object): string {
    return Object.entries(json).map(value => value.join("=")).join("&");
  }

  /**
   * @param url The url to get
   * @returns The response object from the url
   */
  async get(url: string): Promise<IncomingMessage> {
    return new Promise((resolve, reject) => {
      const req = https.get(url, resolve);
      req.on("error", err => reject(err.message));
    });
  }

  /**
   * Fetches JSON data from the given URL
   *
   * @param url The url to fetch from
   * @returns THe parsed JSON data from the URL
   */
  async fetch<T>(url: string): Promise<T> {
    return new Promise(async (resolve, reject) => {
      const res = await this.get(url);

      let data = "";
      res.on("data", chunk => (data += chunk));
      res.on("end", () => resolve(JSON.parse(data)));
    });
  }
}

export default new NetworkModel();
