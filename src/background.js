chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { command: 'refresh' });
    });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.command === 'youtube-search') {
        fetch('./config/config.json').then(function (data) {
        fetch('./config/config.json').then(function (response) {
            return response.json();
        }).then(function (data) {
            let client = new YouTubeClient(data.youtubeApiKey);
            client.search(request.searchTerm).then(function (data) {
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    var activeTab = tabs[0];
                    chrome.tabs.sendMessage(activeTab.id, { command: 'youtube-search-response', data: data })
                });
            });
        });
    }
});

function YouTubeClient(apiKey) {
    this.YT_BASE_URL = 'https://www.googleapis.com/youtube/v3/search';
    this.apiKey = apiKey;
}

YouTubeClient.prototype.search = function (searchTerm) {
    const url = `${this.YT_BASE_URL}?part=snippet&key=${encodeURIComponent(this.apiKey)}&q=${encodeURIComponent(searchTerm)}&maxResults=6&type=video`;
    return fetch(url).then(function (response) {
        return response.json();
    });
};