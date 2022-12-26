import fs from "fs";
import path from "path";

import { ProgressCallback } from "../types";

import NetworkModel from "./NetworkModel";

class FileModel {

  /**
   * Downloads a file to the given file
   * 
   * @param url URL to download from
   * @param file Path to the downloaded file
   * @param onProgress A progress callback
   */
  async downloadFile(
    url: string,
    file: string,
    onProgress?: ProgressCallback
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const dir = path.dirname(file);

      await this.createDirectory(dir);

      const res = await NetworkModel.get(url);

      const stream = fs.createWriteStream(file);
      res.pipe(stream);

      const total = parseInt(res.headers["content-length"] || "0");
      let progress = 0;

      res.on("data", chunk => {
        progress += chunk.length;
        if (onProgress) onProgress(progress, total);
      });

      stream.on("error", err => reject(err.message));
      stream.on("finish", resolve);

    });
  }
  
  /**
   * Writes some string content to a file
   * 
   * @param file The path to the file
   * @param content The contents to write
   */
  async writeFile(file: string, content: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.writeFile(file, content, err => {
        if (err) reject(err.message);
        else resolve();
      });
    });
  }

  /**
   * Creates the given directories recursively
   * 
   * @param path_ The path to create
   * @returns true if any directories were created, false otherwise
   */
  async createDirectory(path_: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (fs.existsSync(path_)) {
        resolve(false);
        return;
      }

      fs.mkdir(path_, { recursive: true }, err => {
        if (err) {
          reject(err.message);
          return;
        }

        resolve(true);
      });
    });
  }
}

export default new FileModel();
