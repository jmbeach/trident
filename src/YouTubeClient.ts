export class YouTubeClient {
    private YT_BASE_URL: string = "https://www.googleapis.com/youtube/v3/search";
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    public search(searchTerm, callback) {
        const query = {
            part: "snippet",
            key: this.apiKey,
            q: searchTerm,
            maxResults: 6,
            type: "video",
        };

        const request = new XMLHttpRequest();
        const url = `${this.YT_BASE_URL}?part=snippet&key=${encodeURIComponent(this.apiKey)}&q=${encodeURIComponent(searchTerm)}&maxResults=6&type=video`
        request.open("GET", url, true)
        request.send(JSON.stringify(query));
        request.onload = () => {
            callback(JSON.parse(request.responseText));
        }
    }
}