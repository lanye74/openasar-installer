import {spawnSync} from "node:child_process";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import puppeteer from "puppeteer";
import watch from "node-watch";



const URL = "https://openasar.dev";
const SELECTOR = "#install-parent > div > a:last-child";

const DOWNLOADED_FILE = "openasar_installer_canary.bat";
const FILE_PATH = path.join(__dirname, DOWNLOADED_FILE);



async function main() {
	const timeStart = performance.now();


	console.log("Creating browser...");
	const browser = await puppeteer.launch();


	console.log("Loading page...");
	const page = await browser.newPage();
	await page.goto(URL);


	// ensure the file actually has permission to download
	const session = await page.createCDPSession();
	await session.send("Browser.setDownloadBehavior", {
		behavior: "allow",
		downloadPath: __dirname
	});



	const downloadButton = await page.waitForSelector(SELECTOR);

	console.log("Downloading file...")
	await downloadButton!.evaluate(b => b.click());

	await downloadButton!.dispose();


	// wait for file download
	await new Promise<void>(res => {
		const watcher = watch(__dirname, (event, file) => {
			if(path.basename(file) === DOWNLOADED_FILE && event === "update") {
				// .crdownload has been renamed into the final file, so it's done downloading
				watcher.close();
				res();
			}
		});
	});


	// occasionally, the above check will resolve early, so add some buffer time just in case
	await new Promise(res => setTimeout(res, 250));


	console.log("Closing browser...");
	await browser.close();

	console.log("Removing pause directive...");

	const installerContents = await fs.readFile(FILE_PATH, "utf8");
	const modifiedContents = installerContents.replace("pause\n", "");
	await fs.writeFile(FILE_PATH, modifiedContents);


	console.log("Executing file...");
	// use synchronous spawning to wait until it finishes executing
	spawnSync(FILE_PATH);


	console.log("Deleting installer...");
	await fs.rm(FILE_PATH);


	const timeEnd = performance.now();

	console.log("Done! Discord should be reopening.");
	console.log(`Time taken: ${((timeEnd - timeStart) / 1000).toFixed(3)}s`);
}



main();
