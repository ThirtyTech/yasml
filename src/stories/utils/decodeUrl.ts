// Used when using the vite import with ?url
// Ex: import url from './Basic?url'
// Though using the import code from './Basic?raw' is the better approach
export async function decodeUrl(url: string) {
    if (import.meta.env.DEV) {
        const sourceFile = await fetch(url).then((res) => res.text());

        const base64Source = sourceFile.match(
            /\/\/# sourceMappingURL=data:application\/json;base64,([^\s]*)/
        );
        if (!base64Source) throw new Error("No source map found");
        const sourceMapBase64 = base64Source[1];
        const sourceMapJson = JSON.parse(atob(sourceMapBase64)) as {
            sourcesContent: string[];
        };
        return sourceMapJson.sourcesContent[0];
    } else {
        return atob(url.replace("data:application/octet-stream;base64,", ""));
    }
}