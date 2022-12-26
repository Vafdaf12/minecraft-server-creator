// Builtin
import path from "path";
import fs from "fs";
import { promisify } from "util";

const execFile = promisify(require("child_process").execFile);

// Node Modules
import kleur from "kleur";
import prompts, { Choice } from "prompts";
import minimist from "minimist";

// Custom Modules
import VersionModel from "./models/VersionModel";
import JavaModel from "./models/JavaModel";
import FileModel from "./models/FileModel";
import GraphicsModel from "./models/GraphicsModel";

import { Spinner } from "./spinner";
import { choiceFromValue } from "./utils";

import {
	FN_SERVER_JAR,
	FN_EULA_TXT,
	URL_FABRIC_INSTALLER,
	FN_INSTALLER_JAR
} from "./constants";
import { MCVersion, ReleaseType } from "./types";
import ModModel from "./models/ModModel";

const ARGS = minimist(process.argv);

const SPINNER = new Spinner("dots");

const TEMPLATES: Choice[] = [
	choiceFromValue("vanilla"),
	choiceFromValue("fabric")
];

const MODS: Choice[] = [
	choiceFromValue("lithium"),
	choiceFromValue("phosphor"),
	choiceFromValue("hydrogen"),
]

class MyError extends Error {
	constructor(message: string) {
		super(message);
	}
}
const CHECK = "!";
//! ---------------------------------------------------------
// TODO: Add error messages if there is no network connection
//! ---------------------------------------------------------

async function main() {
	await VersionModel.fetchAll();
	if(ARGS.version) {
		console.log(VersionModel.byId(ARGS.versions));
	}
	if (ARGS.version && !VersionModel.byId(ARGS.version)) {
		throw new MyError("Invalid Version");
	}
	const response = await prompts([
		{
			type: "text",
			name: "title",
			message: "Server Name",
			initial: "Minecraft Server"
		},
		{
			type: ARGS.version ? null : "select",
			name: "type",
			message: "Release Type",
			choices: VersionModel.releaseTypes.map(choiceFromValue)
		},
		{
			type: ARGS.version ? null : "autocomplete",
			name: "id",
			message: "Minecraft Version",
			choices: (prev: ReleaseType) => VersionModel.byRelease(prev).map(choiceFromValue)
		},
		{
			type: ARGS.template ? null : "select",
			name: "template",
			message: "Select a mod loader",
			choices: TEMPLATES
		},
		{
			type: (prev: string) => prev == "fabric" ? "multiselect" : null,
			name: "mods",
			message: "Choose optimization mods",
			choices: MODS
		},
		{
			type: "confirm",
			name: "agree",
			hint: "This is required to run the server",
			message: "Agree to Minecraft's EULA?",
		}
	],
	{
		onCancel: () => {
			throw new MyError("Operation cancelled"); 
		}
	}
	);
	
	GraphicsModel.divider();
	GraphicsModel.setCursor(false);

	const id: string = response.id || ARGS.version;

	const info = await VersionModel.fetchInfo(id);
	if (!info) throw new MyError("Invalid version specified");

	await createServer(info, response.title, response.agree);
	await installJava(info, response.title);
	if ([response.template, ARGS.template].includes("fabric")) {
		await installFabric(id, response.title);
	}
	
	GraphicsModel.setCursor(true);
	GraphicsModel.divider();
}

/**
 * 
 * @param info The fetched info for the minecraft version to install
 * @param path_ The destination directory where the file will be downloaded to
 * @param agree
 * @returns 
 */
async function createServer(
	info: MCVersion,
	path_: string,
	agree: boolean
) {

	if (!info.downloads.server)
		throw new MyError("No server downloads available");

	const downloadUrl = info.downloads.server.url;
	const downloadPath = path.resolve(path_, FN_SERVER_JAR);

	await downloadFile(downloadUrl, "Downloading Server files...", downloadPath);
}


async function downloadFile(url: string, message: string, path_: string) {
	SPINNER.start(0);
	GraphicsModel.printmv(message, 2);

	await FileModel.downloadFile(url, path_, (current, total) => {
		const percentage = Math.round((current / total) * 1000) / 10;
		GraphicsModel.printmv(`${message} ${percentage}%  `, 2);
	});

	SPINNER.stop();
	GraphicsModel.printmv(kleur.green(CHECK), 0);
	GraphicsModel.newline();

}

async function installJava(info: MCVersion, path_: string) {

	const version = info.javaVersion.majorVersion;

	const installer = await JavaModel.fetchDownloadUrl(version); 
	if(!installer) return;

	const downloadUrl = installer.link;
	const downloadPath = path.resolve(path_, installer.name);
	
	await downloadFile(downloadUrl, `Downloading Java Runtime ${version}...`, downloadPath);
}


async function installFabric(versionId: string, path_: string) {
	GraphicsModel.printmv("Installing Fabric loader...", 2);

	SPINNER.start(0);
	await FileModel.downloadFile(URL_FABRIC_INSTALLER, FN_INSTALLER_JAR);

	await execFile("java", [
		"-jar",
		FN_INSTALLER_JAR,
		"server",
		"-dir",
		path_,
		"-mcversion",
		versionId
	]);
	fs.rmSync(FN_INSTALLER_JAR);

	SPINNER.stop();

	GraphicsModel.printmv(kleur.green(CHECK), 0);
	GraphicsModel.newline();
}

// process.on("exit", () => GraphicsModel.setCursor(true));


async function main2() {
	let x = await ModModel.latest("sodium", "1.18");
	console.log(x);
	

}

main()
	.catch((e: MyError) => GraphicsModel.error(e.message))
	.finally(() => GraphicsModel.setCursor(true));
