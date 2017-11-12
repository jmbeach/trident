import * as $ from "jquery";
export class UiEventMonitor {
    public onEnterReviewsList: () => void;
    public onExitReviewsList: () => void;
    public onEnterReview: () => void;
    public onExitReview: () => void;

    private currentLocation: string;

    constructor() {
        const self = this;
        self.currentLocation = window.location.href;
        $("a").click(() => {
            self.locationHasChanged((didChange) => {
                if (!didChange) {
                    return;
                }

                if (self.didEnterReview()) {
                    self.onEnterReview();
                }

                if (self.didExitReview()) {
                    self.onExitReview();
                }
                self.updateCurrentLocation();
            });
        });
    }

    private locationHasChanged(callback) {
        const self = this;
        setTimeout(() => {
            callback(window.location.href !== self.currentLocation);
        }, 100);
    }

    private updateCurrentLocation() {
        this.currentLocation = window.location.href;
    }

    private didEnterReview() {
        // new location contains something after reviews/albums
        const matches = window.location.href.match(/reviews\/albums\/.+/g);
        return matches && matches.length > 0;
    }

    private didExitReview() {
        // old location contains something after reviews/albums
        const matches = this.currentLocation.match(/reviews\/albums\/.+/g);
        return matches && matches.length > 0;
    }
}
