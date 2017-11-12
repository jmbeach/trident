import * as $ from "jquery";
export class UiEventMonitor {
    public onEnterReviewList: () => void;
    public onExitReviewList: () => void;
    public onEnterReview: () => void;
    public onExitReview: () => void;

    private currentLocation: string;

    constructor() {
        this.currentLocation = window.location.href;
        this.bindClick("a");
    }

    public bindClick(selector) {
        const self = this;
        $(selector).click(() => {
            self.locationHasChanged((didChange) => {
                if (!didChange) {
                    return;
                }

                if (self.didEnterReview()) {
                    self.onEnterReview();
                }

                if (self.didExitReview()) {
                    if (self.onExitReview) {
                        self.onExitReview();
                    }
                }

                if (self.didEnterReviewList()) {
                    self.onEnterReviewList();
                }

                if (self.didExitReviewList()) {
                    self.onExitReviewList();
                }

                self.updateCurrentLocation();
            });
        });
    }

    public initialDetect() {
        if (this.didEnterReview()) {
            this.onEnterReview();
        }

        if (this.didEnterReviewList()) {
            this.onEnterReviewList();
        }
    }

    private locationHasChanged(callback) {
        const self = this;
        setTimeout(() => {
            callback(window.location.href !== self.currentLocation);
        }, 200);
    }

    private updateCurrentLocation() {
        this.currentLocation = window.location.href;
    }

    private didEnterReview() {
        // new location contains something after reviews/albums
        const matches = window.location.href.match(/reviews\/albums\/.+\//g);
        return matches && matches.length > 0;
    }

    private didEnterReviewList() {
        // new location contains nothing after reviews/albums
        const matches = window.location.href.match(/(reviews\/albums\/$)|(reviews\/albums\/\?page.+)/g);
        return matches && matches.length > 0;
    }

    private didExitReviewList() {
        // old location contains nothing after reviews/albums
        const matches = this.currentLocation.match(/(reviews\/albums\/$)|(reviews\/albums\/\?page.+)/g);
        return matches && matches.length > 0;
    }

    private didExitReview() {
        // old location contains something after reviews/albums
        const matches = this.currentLocation.match(/reviews\/albums\/.+\//g);
        return matches && matches.length > 0;
    }
}
