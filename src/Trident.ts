import {PageType} from "./PageType";
import {Review} from "./Review";
import {UiEventMonitor} from "./UiEventMonitor";
import {DomUtils} from "./DomUtils";
export class Trident {
    public minScore: number;
    public minYear: number;
    public publishedYear: number;
    public processed: { [link: string]: Review; };
    private eventMonitor: UiEventMonitor;
    private domUtils : DomUtils;

    constructor() {
        const self = this;
        self.minScore = 7.0;
        self.minYear = new Date().getFullYear() - 1;
        self.processed = {};
        self.eventMonitor = new UiEventMonitor();
        self.domUtils = new DomUtils();
        self.eventMonitor.onEnterArtist = () => {
            setTimeout(() => {
                self.insertFilterBoxes();
                self.processed = {};
                self.refreshCustomUi();
            }, 200);
        };

        self.eventMonitor.onEnterReview = () => {
            setTimeout(() => {
                self.insertReviewControls();
                self.findOnYouTube();
                self.eventMonitor.bindClick("a");
            }, 800);
        };

        self.eventMonitor.onEnterReviewList = () => {
            setTimeout(() => {
                self.insertFilterBoxes();
                self.processed = {};
                self.refreshCustomUi();
            }, 200);
        };

        self.eventMonitor.onEnterDesktopDeviceSize = () => {
            setTimeout(() => {
                self.insertFilterBoxes();
            }, 200);
        };

        self.eventMonitor.onExitArtist = () => {
            self.destroyFilterControls();
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
            if (request.command === "refresh") {
                self.findOnYouTube();
            } else if (request.command === 'youtube-search-response') {
                self.onYouTubeSearchResponse(request.data);
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
        if (this.eventMonitor.pageType !== PageType.AllReviews && this.eventMonitor.pageType !== PageType.Artist) {
            return;
        }

        this.insertScript("insertFilterBoxes();");
    }

    public insertReviewControls() {
        if (this.eventMonitor.pageType !== PageType.Review) {
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
        let player = document.getElementById('player');
        if (player !== null)
        {
            player.remove();
        }

        self.createPlayer();
        chrome.runtime.sendMessage({
            command: "youtube-search",
            searchTerm: query
        })
    }

    public onYouTubeSearchResponse(data) {
        this.makePlayer(data.items[0].id.videoId);
    }

    public scrollToPreviousAlbum() {
        const currentArtistLink = this.getCurrentArtistLink();
        const artistLinks = Array.from(document.querySelectorAll(".artist-links > li:first-child > a"));
        let currentIndex = artistLinks.indexOf(currentArtistLink);
        if (currentIndex === 0)
        {
            return;
        }
        else
        {
            this.domUtils.parentsUntilClass(artistLinks[currentIndex - 1], "review-detail").scrollIntoView();
        }
    }

    public scrollToNextAlbum() {
        const currentArtistLink = this.getCurrentArtistLink();
        const artistLinks = Array.from(document.querySelectorAll(".artist-links > li:first-child > a"));
        let currentIndex = artistLinks.indexOf(currentArtistLink);

        // if we haven't loaded the next artist link yet
        if (artistLinks.length - 1 <= currentIndex) {
            this.scrollToBottom();
        } else {
            this.domUtils.parentsUntilClass(artistLinks[currentIndex + 1], "review-detail").scrollIntoView();
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
        const album = document.querySelector("a[href=\"" + link + "\"]");
        if (album.parentElement.style && album.parentElement.style.display !== "none") {
            this.insertScript("filterAlbum('" + link + "')");
        }
    }

    private markAllUnprocessed(processedItems) {
        for (let i in processedItems) {
            const item = processedItems[i];
            item.setUnprocessed();
        }
    }

    private getReview(link) {
        return this.processed[link];
    }

    private unFilterAlbum(link) {
        const album = document.querySelector("a[href=\"" + link + "\"]");
        if (album.parentElement.style
            && album.parentElement.style.display !== "block"
            && album.parentElement.style.display !== "") {
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
        const publishedYearObject = page.querySelector(".single-album-tombstone__meta-year");
        const publishedYearParts = publishedYearObject.textContent.split(" ");
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
        fetch(link).then(function (response) {
            return response.text();
        }).then(function (data) {
            const domParser = new DOMParser();
            const body = domParser.parseFromString(data, "text/html").body;
            callback(body, link, album);
        });
    }

    private foreachAlbumPage(callback) {
        const albums = document.querySelectorAll(".review__link");
        for (let i = 0; i < albums.length; i++) {
            const album = albums[i];
            const link = album.getAttribute("href");
            if (typeof(this.processed[link]) !== "undefined" && this.processed[link].score.isProcessed === true) {
                continue;
            }

            this.pageGetter(link, album, (data, cbLink, cbAlbum) => {
                const page = data;
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
        const $score = page.querySelector(".score");
        const score = parseFloat($score.innerHTML);
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
}
