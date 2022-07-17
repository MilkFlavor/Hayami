// Extract URLs from HTML
/**
 * It takes a string of HTML, and returns an object with an array of image URLs and the URL of the next
 * page
 * @param html - The HTML of the page to process.
 * @returns An object with two properties: imageUrls and next.
 */
export function processPage(html) {
    let imageUrls = [];
    for (let imageUrl of html.matchAll(/https:\/\/i\.redd\.it\/[0-9a-z_]{10,16}\.((png)|(jpg)|(gif))/g))
        imageUrls.push(imageUrl[0]);

    let next = html
        .match(/<link rel="next" href=".+"\/>/);
    if (!next)
        return false;
    next = next[0]
        .split("\"")[3]
        .replace(/&amp;/g, "&");

    if (imageUrls.length <= 0)
        return false;
    return {
        imageUrls, next
    };
}