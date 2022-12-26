import { ModVersion, VersionType } from "../types";
import NetworkModel from "./NetworkModel";

/**
 * This singleton handles all requests related
 * to querying of mod information
 */
class ModModel {
    
    /**
     * Returns an array of versions of the mod
     * 
     * @param id The id/slug of the mod
     * @param gameVersion The desired version of the game
     */
    async versions(id: string, gameVersion: string): Promise<ModVersion[]> {
        let versions = await NetworkModel.fetch<ModVersion[]>(`https://api.modrinth.com/v2/project/${id}/version?game_versions=["${gameVersion}"]`);
        return versions;
    }

    /**
     * Returns information for the latest version
     * of the specified mod
     * 
     * @param id The id/slug of the mod
     * @param gameVersion The desired version of the game
     * @param versionType The version type to filter for
     */
    async latest(id: string, gameVersion: string, versionType?: VersionType): Promise<ModVersion | null> {
        let versions = await this.versions(id, gameVersion);
        if(versionType)
            versions = versions.filter(v => v.version_type === versionType);
        
        if (versions.length === 0) return null;

        let latestRelease = versions
            .reduce((prev, cur) => prev.date_published > cur.date_published ? prev : cur);
        
        return latestRelease;
        
    }

}

export default new ModModel();