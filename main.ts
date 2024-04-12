import {spawnSync} from "node:child_process";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import puppeteer from "puppeteer";
import watch from "node-watch";



async function installAndExecuteBatchScriptFromPage(pageUrl: string, downloadButtonSelector: string, downloadedFileName: string, downloadDirectory: string) {
	const timeStart = performance.now();


	console.log("Creating browser...");
	const browser = await puppeteer.launch();


	console.log("Loading page...");
	const page = await browser.newPage();
	await page.goto(pageUrl);


	// ensure the file actually has permission to download
	const session = await page.createCDPSession();
	await session.send("Browser.setDownloadBehavior", {
		behavior: "allow",
		downloadPath: __dirname
	});



	const downloadButton = await page.waitForSelector(downloadButtonSelector);

	console.log("Downloading file...")
	await downloadButton!.evaluate(button => (button as HTMLAnchorElement).click());

	await downloadButton!.dispose();


	// wait for file download
	await new Promise<void>(res => {
		const watcher = watch(__dirname, async (event, file) => {
			if(path.basename(file) === downloadedFileName && event === "update") {
				// .crdownload has been renamed into the final file, so it's done downloading
				watcher.close();

				// occasionally, the above check will resolve early, so add some buffer time just in case
				await new Promise(res => setTimeout(res, 250));

				res();
			}
		});
	});


	console.log("Closing browser...");
	await browser.close();



	console.log("Removing pause directive...");

	const downloadedFilePath = path.join(downloadDirectory, downloadedFileName);

	const installerContents = await fs.readFile(downloadedFilePath, "utf8");
	const modifiedContents = installerContents.replace("pause\n", "");
	await fs.writeFile(downloadedFilePath, modifiedContents);


	console.log("Executing file...");
	// use synchronous spawning to wait until it finishes executing
	spawnSync(downloadedFilePath);


	console.log("Deleting installer...");
	await fs.rm(downloadedFilePath);



	const timeEnd = performance.now();

	console.log("Done! Discord should be reopening.");
	console.log(`Time taken: ${((timeEnd - timeStart) / 1000).toFixed(3)}s`);
}




const PAGE_URL = "https://openasar.dev";
const DOWNLOAD_BUTTON_SELECTOR = "#install-parent > div > a:last-child";

const DOWNLOADED_FILE = "openasar_installer_canary.bat";
const DOWNLOAD_DIRECTORY = __dirname;


installAndExecuteBatchScriptFromPage(PAGE_URL, DOWNLOAD_BUTTON_SELECTOR, DOWNLOADED_FILE, DOWNLOAD_DIRECTORY);
