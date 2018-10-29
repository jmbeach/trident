export class YouTubeClient {
    private YT_BASE_URL: string = "https://www.googleapis.com/youtube/v3/search/";
    public search(query, callback) {
        $.getJSON(this.YT_BASE_URL, query, callback);
    }
}