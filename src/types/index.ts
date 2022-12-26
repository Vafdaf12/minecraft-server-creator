export * from "./MinecraftVersion";
export * from "./VersionManifest"
export * from "./OpenJDK";
export * from "./Modrinth";

export type ProgressCallback = (current: number, total: number) => void;

export interface PromptConfig {
    message: string   
}