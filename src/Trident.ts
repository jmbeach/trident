import * as $ from "jquery";
import {TridentConfig} from "./config/config";
import {PageType} from "./PageType";
import {Review} from "./Review";
import {UiEventMonitor} from "./UiEventMonitor";
import {DomUtils} from "./DomUtils";
import { YouTubeClient } from "./YouTubeClient";
export class Trident {
    public minScore: number;
    public minYear: number;
    public publishedYear: number;
    public processed: { [link: string]: Review; };
    private config: TridentConfig = new TridentConfig();
    private eventMonitor: UiEventMonitor;
    private domUtils : DomUtils;
    private youtubeClient: YouTubeClient = new YouTubeClient(this.config.youtubeApiKey);

    constructor() {
        const self = this;
        self.minScore = 7.0;
        self.minYear = new Date().getFullYear() - 1;
        self.processed = {};
        self.eventMonitor = new UiEventMonitor();
        self.domUtils = new DomUtils();
        self.eventMonitor.onEnterReview = () => {
            setTimeout(() => {
                self.insertReviewControls();
                self.findOnYouTube();
            }, 800);
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

            if (event.data.type && event.data.type === "NextAlbum") {
                self.scrollToNextAlbum();
            }

            if (event.data.type && event.data.type === "PreviousAlbum") {
                self.scrollToPreviousAlbum();
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
                self.eventMonitor.bindClick("a[href='" + link + "']");
            }

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

    public insertReviewControls() {
        if (this.getPageType() !== PageType.Review) {
            return;
        }

        this.insertScript("insertReviewControls();");
    }

    public getCurrentArtistLink() {
        const self = this;
        const artists = document.querySelectorAll(".artist-links a");
        let artistLink = artists[0]
        for (let i = 0; i < artists.length; i++) {
            const link = artists[i];
            const reviewClass = "review-detail";
            const linkView = self.domUtils.parentsUntilClass(
                link,
                reviewClass)
                .getBoundingClientRect();
            const artistView = self.domUtils.parentsUntilClass(
                artistLink,
                reviewClass)
                .getBoundingClientRect()

            // top is closest to zero
            if (Math.abs(linkView.top) < Math.abs(artistView.top)) {
                artistLink = link
            }
        }

        return artistLink;
    }

    public findOnYouTube() {
        const self = this;
        const artistLink = self.getCurrentArtistLink();
        const artist = artistLink.innerHTML;
        const headings = self.domUtils.parentsUntilClassContains(artistLink, 'headings')
        const album = headings.children[1].innerHTML;
        const query = album + " " + artist;
        $("#player").remove();
        self.createPlayer();
        self.youtubeClient.search(query, (apiData) => {
            const searchResults = apiData;
            self.makePlayer(searchResults.items[0].id.videoId);
        });
    }

    public scrollToPreviousAlbum() {
        const currentArtistLink = this.getCurrentArtistLink();
        const artistLinks = document.querySelectorAll(".artist-links > li:first-child > a");
        let previousArtistLink = currentArtistLink;
        for (let i = 0; i < artistLinks.length; i++) {
            if (artistLinks[i] === currentArtistLink && i != 0) {
                previousArtistLink = artistLinks[i - 1];
            }
        }

        this.domUtils.parentsUntilClass(previousArtistLink, "review-detail").scrollIntoView();
    }

    public scrollToNextAlbum() {
        const currentArtistLink = this.getCurrentArtistLink();
        const artistLinks = document.querySelectorAll(".artist-links > li:first-child > a");
        let nextArtistLink = currentArtistLink;
        for (let i = 0; i < artistLinks.length; i++) {
            if (artistLinks[i] === currentArtistLink) {
                if (artistLinks.length - 1 !== i) {
                    nextArtistLink = artistLinks[i + 1];
                }
            }
        }

        // if we haven't loaded the next artist link yet
        if (currentArtistLink === nextArtistLink) {
            this.scrollToBottom();
        } else {
            this.domUtils.parentsUntilClass(nextArtistLink, "review-detail").scrollIntoView();
        }
    }

    public createPlayer() {
        const playerDiv = document.createElement("div");
        playerDiv.id = "player";
        playerDiv.style.position = "fixed";
        playerDiv.style.bottom = "10px";
        playerDiv.style.right = "10px";
        document.body.appendChild(playerDiv);
    }

    public firstPageLoad() {
        this.eventMonitor.initialDetect();
    }

    private insertPublishedYear(link, publishedYear) {
        this.insertScript("insertPublishedYear('" + link + "', '" + publishedYear + "')");
    }

    private scrollToBottom() {
        this.insertScript("scrollToBottom();");
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
        const publishedYearObject = page.find(".single-album-tombstone__meta-year").first();
        const publishedYearParts = publishedYearObject.text().split(" ");
        const publishedYearString = publishedYearParts[publishedYearParts.length - 1];
        const publishedYear = parseInt(publishedYearString, 10);

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
        const albums = $(".review__link");
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

    private getPageType() {
        if (document.title === "New Albums & Music Reviews | Pitchfork") {
            return PageType.AllReviews;
        }
        return PageType.Review;
    }
}
