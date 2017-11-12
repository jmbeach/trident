import * as $ from "jquery";
import {TridentConfig} from "./config/config";
import {PageType} from "./PageType";
import {Review} from "./Review";
import {UiEventMonitor} from "./UiEventMonitor";
export class Trident {
    public minScore: number;
    public minYear: number;
    public genreFilter: string;
    public publishedYear: number;
    public processed: { [link: string]: Review; };
    private config: TridentConfig = new TridentConfig();
    private YT_BASE_URL: string = "https://www.googleapis.com/youtube/v3/search/";
    private eventMonitor: UiEventMonitor;

    constructor() {
        const self = this;
        self.minScore = 7.0;
        self.minYear = 2017;
        self.processed = {};
        self.eventMonitor = new UiEventMonitor();
        self.eventMonitor.onEnterReview = () => {
            setTimeout(() => {
                self.findOnYouTube();
            }, 200);
        };

        self.eventMonitor.onEnterReviewList = () => {
            setTimeout(() => {
                self.insertFilterBoxes();
                self.processed = {};
                self.refreshCustomUi();
            }, 200);
        };

        self.eventMonitor.onExitReviewList = () => {
            self.destroyFilterControls();
        };

        window.addEventListener("message", (event) => {
            if (event.source !== window) {
                return;
            }

            if (event.data.type && event.data.type === "TridentScore") {
                self.minScore = parseFloat(event.data.text);

                // reprocess all albums
                self.markAllUnprocessed(self.processed);
                self.refreshCustomUi();
            }

            if (event.data.type && event.data.type === "TridentYear") {
                self.minYear = parseFloat(event.data.text);

                // reprocess all albums
                self.markAllUnprocessed(self.processed);
                self.refreshCustomUi();
            }

            if (event.data.type && event.data.type === "TridentGenre") {
                self.genreFilter = event.data.text;

                // reprocess all albums
                self.markAllUnprocessed(self.processed);
                self.refreshCustomUi();
            }
        });

        chrome.runtime.onMessage.addListener((request) => {
            if (request.PF === "refresh") {
                self.findOnYouTube();
            }
        });
    }

    public refreshCustomUi() {
        const self = this;
        self.foreachAlbumPage((link, album, page) => {
            if (typeof(page) !== "undefined"
                && !self.isProcessed(link)) {
                self.processed[link] = new Review();
                self.processScore(link, page);
                self.processPublishedDate(link, page);
                self.processGenre(link, page);
                self.eventMonitor.bindClick("a[href='" + link + "']");
            }

            self.filterGenre(link);
            self.filterScore(link);
            self.filterPublishedDate(link);
            self.setVisibility(link);
        });
    }

    public destroyFilterControls() {
        const script = "destroyFilterControls();";
        this.insertScript(script);
    }

    public makePlayer(id: string) {
        const playerScript =
            "makePlayer('" + id + "');";
        this.insertScript(playerScript);
    }

    public insertScript(strJs: string) {
        const script = document.createElement("script");
        script.innerHTML = strJs;
        document.body.appendChild(script);
    }

    public insertFilterBoxes() {
        if (this.getPageType() !== PageType.AllReviews) {
            return;
        }

        this.insertScript("insertFilterBoxes();");
    }

    public findOnYouTube() {
        const self = this;

        const artist = $(".artists a").last().text();
        const album = $(".review-title").last().text();
        const query = self.makeQueryObject(album + " " + artist);
        $("#player").remove();
        self.createPlayer();
        self.getDataFromApi(query, (apiData) => {
            const searchResults = apiData;
            self.makePlayer(searchResults.items[0].id.videoId);
        });
    }

    public createPlayer() {
        const playerDiv = document.createElement("div");
        playerDiv.id = "player";
        playerDiv.style.position = "fixed";
        playerDiv.style.bottom = "10px";
        playerDiv.style.right = "10px";
        document.body.appendChild(playerDiv);
    }

    public getDataFromApi(query, callback) {
        $.getJSON(this.YT_BASE_URL, query, callback);
    }

    public firstPageLoad() {
        this.eventMonitor.initialDetect();
    }

    private makeQueryObject(searchTerm) {
        const query = {
            part: "snippet",
            key: this.config.youtubeApiKey,
            q: searchTerm,
            maxResults: 6,
            type: "video",
        };

        return query;
    }

    private insertPublishedYear(link, publishedYear) {
        this.insertScript("insertPublishedYear('" + link + "', '" + publishedYear + "')");
    }

    private insertScore(link, score) {
        this.insertScript("insertScore('" + link + "', '" + score + "')");
    }

    private filterScore(link) {
        const review = this.getReview(link);
        if (review.score.value < this.minScore) {
            review.score.setFiltered();
        } else {
            review.score.setUnfiltered();
        }
    }

    private filterPublishedDate(link) {
        const review = this.getReview(link);
        if (review.publishedDate.value < this.minYear) {
            review.publishedDate.setFiltered();
        } else {
            review.publishedDate.setUnfiltered();
        }
    }

    private filterAlbum(link) {
        const album = $("a[href=\"" + link + "\"]");
        if (album.parent()[0].style.display !== "none") {
            this.insertScript("filterAlbum('" + link + "')");
        }
    }

    private markAllUnprocessed(processedItems) {
        for (const i of processedItems) {
            const item = processedItems[i];
            item.setUnprocessed();
        }
    }

    private getReview(link) {
        return this.processed[link];
    }

    private unFilterAlbum(link) {
        const album = $("a[href=\"" + link + "\"]");
        if (album.parent()[0].style.display !== "block"
           && album.parent()[0].style.display !== "") {
            this.insertScript("unFilterAlbum('" + link + "')");
        }
    }

    private isProcessed(link) {
        return typeof(this.getReview(link)) !== "undefined";
    }

    private processPublishedDate(link, page) {
        const review = this.getReview(link);
        if (review.publishedDate.isProcessed) {
            return;
        }

        review.publishedDate.setProcessed();
        const publishedYearObject = page.find(".year").first();
        let publishedYearText = publishedYearObject.text();
        publishedYearText = publishedYearText.substring(2);
        const publishedYear = parseInt(publishedYearText, 10);

        review.publishedDate.value = publishedYear;

        if (!review.publishedDate.isInserted) {
            review.publishedDate.setInserted();
            this.insertPublishedYear(link, publishedYear);
        }

        if (publishedYear < this.minYear) {
            review.publishedDate.setFiltered();
        } else {
            review.publishedDate.setUnfiltered();
        }
    }

    private pageGetter(link, album, callback) {
        $.get(link, (data) => {
            callback(data, link, album);
        });
    }

    private foreachAlbumPage(callback) {
        const albums = $(".album-link");
        for (let i = 0; i < albums.length; i++) {
            const album = $(albums.get(i));
            const link = album.attr("href");
            if (typeof(this.processed[link]) !== "undefined") {
                callback(link, album, null);
            }

            this.pageGetter(link, album, (data, cbLink, cbAlbum) => {
                const page = $(data);
                callback(cbLink, cbAlbum, page);
            });
        }
    }

    private setVisibility(link) {
        const review = this.getReview(link);
        if (review.isVisible()) {
            this.unFilterAlbum(link);
        } else {
            this.filterAlbum(link);
        }
    }

    private processScore(link, page) {
        const review = this.getReview(link);
        if (review.score.isProcessed) {
            return;
        }

        review.score.setProcessed();
        const $score = page.find(".score");
        const score = parseFloat($score.text());
        review.score.value = score;
        if (!review.score.isInserted) {
            review.score.setInserted();
            this.insertScore(link, score);
        }

        if (score < this.minScore) {
            review.score.setFiltered();
        } else {
            review.score.setUnfiltered();
        }
    }

    private filterGenre(link) {
        const review = this.getReview(link);
        if (!this.genreFilter) {
            review.genre.setUnfiltered();
        } else if (review.genre.value.toUpperCase().indexOf(
                this.genreFilter.toUpperCase()) < 0) {
            review.genre.setFiltered();
        } else {
            review.genre.setUnfiltered();
        }
    }

    private processGenre(link, page) {
        const review = this.getReview(link);
        if (review.genre.isProcessed) {
            return;
        }

        review.genre.setProcessed();
        const $genre = page.find(".genre-list__link");
        const genre = $genre.text();
        review.genre.value = genre;

        this.filterGenre(link);
    }

    private getPageType() {
        if (document.title === "New Albums & Music Reviews | Pitchfork") {
            return PageType.AllReviews;
        }
        return PageType.Review;
    }
}
