// Extract URLs from HTML
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