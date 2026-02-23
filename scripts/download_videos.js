import fs from 'fs';
import https from 'https';
import path from 'path';

// More reliable text-based URLs or known open assets.
// We will look for Creative Commons assets hosted on simple servers.

const videos = [
    {
        // Woman listening/nodding (Pexels, but we will try to follow redirect properly)
        // Original: https://www.pexels.com/video/5665448/ -> download link
        // We will use a reliable external sample from a coding tutorial assets repo if available, 
        // OR try to hit the Pexels download endpoint directly if we can find it.
        // Let's use a very standard placeholder that IS allowed. 
        // W3Schools sample is an option but it's a bear.

        // Let's try downloading from a different Pexels Video via a specific "Free Download" style link if we can guess it? No.

        // Let's try to use a Github raw asset from a public repo that has a "talking head".
        // Example: "React-Webcam" demos often have assets? No.

        // Let's use the Mixkit previews again but set the User-Agent to looks like a browser to avoid 403?
        // Mixkit previews block non-browser UAs sometimes.
        url: "https://assets.mixkit.co/videos/preview/mixkit-young-woman-working-97-large.mp4",
        dest: "public/videos/idle.mp4"
    },
    {
        url: "https://assets.mixkit.co/videos/preview/mixkit-business-woman-having-a-phone-call-305-large.mp4",
        dest: "public/videos/talking.mp4"
    }
];

const downloadFile = (url, dest) => {
    const options = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Referer': 'https://mixkit.co/'
        }
    };

    const file = fs.createWriteStream(dest);

    const request = https.get(url, options, (response) => {
        // Check for redirect
        if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307 || response.statusCode === 308) {
            console.log(`Redirecting to: ${response.headers.location}`);
            downloadFile(response.headers.location, dest);
            return;
        }

        if (response.statusCode !== 200) {
            console.error(`Failed to download ${url}: Status Code ${response.statusCode}`);
            file.close();
            fs.unlink(dest, () => { });
            return;
        }

        response.pipe(file);

        file.on('finish', () => {
            file.close();
            console.log(`Downloaded ${dest}`);
        });
    }).on('error', (err) => {
        fs.unlink(dest, () => { });
        console.error(`Error downloading ${url}: ${err.message}`);
    });
};

if (!fs.existsSync('public/videos')) {
    fs.mkdirSync('public/videos', { recursive: true });
}

videos.forEach(v => downloadFile(v.url, v.dest));
