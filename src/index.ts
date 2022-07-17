/* Importing the modules that are required for the program to run. */
import fs from 'fs';
import path from 'path';
import https from 'https';
import { processPage } from './extract';

/* Setting the variables for the program. */
const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36";
const cookies = "over18=1";
const sub = "memes";
const limit = 20;
const outputPath = path.join(__dirname, sub);
const dump = process.argv.includes("--dump");

/* Checking if the user has provided the required arguments. */
if (!sub || !limit) {
    console.log("Error: --sub and --limit is required. Use --help for more details.");
    process.exit(1);
}

/* Checking if the output path exists, and if it doesn't, it creates it. */
if (!fs.existsSync(outputPath))
    fs.mkdirSync(outputPath, { recursive: true });

/**
 * It downloads a page from the given URL, and returns a promise that resolves to the page's HTML
 * 
 * Args:
 *   url: The URL of the page to download.
 *   page: The page number to download. Defaults to 1
 *   dumpPages: If true, the HTML of each page will be saved to a file. Defaults to false
 * 
 * Returns:
 *   A promise that resolves to the HTML of the page.
 */
function downloadPage(url, page = 1, dumpPages = false) {
    return new Promise((resolve, reject) => {
        https.get(
            new URL(url),
            {
                headers: {
                    'User-Agent': userAgent,
                    'Cookie': cookies
                }
            }, (res) => {
                if (res.statusCode !== 200)
                    reject(new Error("HTTP Error " + res.statusCode.toString()));

                console.log("\u21d2 200 OK");
                let buffer = "";
                const outputStream = dumpPages ? fs.createWriteStream(path.join(outputPath, `.${sub}-page${page}.html`)) : null;
                res.on('data', chunk => {
                    buffer += chunk.toString();
                    if (outputStream !== null)
                        outputStream.write(chunk);
                });
                res.on('end', () => resolve(buffer));
            });
    });
}

/**
 * It downloads an image from a given URL and saves it to a file
 * 
 * Args:
 *   url: The URL of the image to download.
 * 
 * Returns:
 *   A promise that resolves to an object with a filepath property.
 */
function downloadImage(url) {
    return new Promise((resolve, reject) => {
        https.get(
            new URL(url),
            {
                headers: {
                    'User-Agent': userAgent,
                    'Cookie': cookies
                }
            }, (res) => {
                if (res.statusCode !== 200)
                    reject(new Error("HTTP Error " + res.statusCode.toString()));

                const filename = path.basename(new URL(url).pathname);
                const filepath = path.join(outputPath, filename);

                if (fs.existsSync(filepath))
                    return resolve({
                        skipped: true,
                        filepath
                    });
                const output = fs.createWriteStream(filepath);

                res.pipe(output).on('close', () => resolve({
                    filepath
                }));
            });
    });
}

/* A self-invoking function. */
(async function () {

    let totalFound = 0;
    let page = 1;
    let url = `https://www.reddit.com/r/${sub}/?count=25&page=${page}`;
    while (totalFound < limit) {
        console.log(`***\nDownloading HTML page (page = ${page})\nGET ${url}`);
        let buffer = await downloadPage(url, page, dump);

        if (!buffer) throw buffer;

        // Process page
        let result = processPage(buffer);
        if (!result) {
            console.log("Error: Nothing found.");
            break;
        }
        console.log(`Found ${result.imageUrls.length} images.`);
        url = result.next;
        page++;

        // Download images
        for (let image of result.imageUrls) {
            totalFound++;
            if (totalFound > limit)
                break;

            console.log(`[#${totalFound}] GET ${image}`);
            let download;
            try {
                download = await downloadImage(image);
            } catch (err) {
                console.log("Error: " + err.toString());
                continue;
            }
            console.log(`${download.skipped ? "\u2713 Found" : "200 OK"} \u21d2 ${download.filepath}`);
        }
    }
})();