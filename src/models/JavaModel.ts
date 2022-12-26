import { exec } from "child_process";
import { URL_OPENJDK } from "../constants";
import { Installer, OpenJDK } from "../types/OpenJDK";
import { formatQuery } from "../utils";
import NetworkModel from "./NetworkModel";

const URL_OPENJDK_RELEASES = "https://adoptium.net/releases.html";

class JavaModel {

  /**
   * Fetches a download URL for a JRE (if available)
   * for the host system. If a JRE was not found,
   * the equivalent JDK is returned.
   * @param version The required major version of the JRE
   */
  async fetchDownloadUrl(version: number): Promise<Installer | undefined> {
    
    let json = {
      os: process.platform,
      architecture: process.arch,
      version: version
    };

    let url = URL_OPENJDK + `${version}/hotspot?${NetworkModel.formatJson(json)}`;    
    let data: OpenJDK[] = await NetworkModel.fetch(url)

    let jre = 
      data.find(v => v.binary.image_type == "jre") ||
      data.find(v => v.binary.image_type == "jdk"); // Fallback if JRE only is not found
    
    if (!jre) return;

    return jre.binary.package;
  }


  /**
   * Finds the verion of java as
   * returned by 'java -version'
   *
   * NOTE: I'm not sure if this is a perfectly cross-platform solution
   *
   * @returns The string version of java
   */
  private version(): Promise<string> {
    return new Promise((resolve, reject) => {
      exec("java -version", (err, _, stderr) => {
        if (err) reject(err.message);

        const res = stderr.match(/(["'])(?:(?=(\\?))\2.)*?\1/g);
        if (!res) {
          reject("no version found");
          return;
        }

        resolve(res[0].replace(/["']/g, ""));
      });
    });
  }

  /**
   * Gets the major version of java
   * installed on the system
   *
   * @returns The major version of java
   */
  versionMajor(): Promise<number> {
    return new Promise(async (resolve, reject) => {
      const res = this.version();
      res.catch(e => reject(e));

      const version = await res;

      const n = version.replace(/["']/g, "").split(".").map(parseInt);

      if (n[0] === 1) resolve(n[1]);
      else resolve(n[0]);
    });
  }

  /**
   * Formats a URL to download the
   * JDK for the given Java Version
   *
   * @param majorVersion The major version of Java
   * @returns A URL to the JDK download page
   */
  jdkDownloadUrl(majorVersion: number): string {
    return formatQuery(URL_OPENJDK_RELEASES, {
      variant: majorVersion
    });
  }
}
export default new JavaModel();
