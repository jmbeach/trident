import { PageType } from "./PageType";
export class UiEventMonitor {
    public onEnterArtist: () => void;
    public onExitArtist: () => void;
    public onEnterReviewList: () => void;
    public onExitReviewList: () => void;
    public onEnterReview: () => void;
    public onExitReview: () => void;
    public pageType: PageType;

    private currentLocation: string;

    constructor() {
        this.currentLocation = window.location.href;
        this.bindClick("a");
    }

    public bindClick(selector) {
        const self = this;
        window.onpopstate = () => {
            self.detectChanges();
        };

        document.querySelectorAll(selector).forEach(el => {
            el.onclick = () => {
                self.detectChanges();
            };
        });
    }

    public initialDetect() {
        if (this.didEnterArtist()) {
            this.onEnterArtist();
        } else if (this.didEnterReview()) {
            this.onEnterReview();
        } if (this.didEnterReviewList()) {
            this.onEnterReviewList();
        }
    }

    private detectChanges() {
        const self = this;
        self.locationHasChanged((didChange) => {
            if (!didChange) {
                return;
            }

            if (self.didEnterArtist()) {
                self.onEnterArtist();
            } if (self.didEnterReview()) {
                self.onEnterReview();
            } else if (self.didEnterReviewList()) {
                self.onEnterReviewList();
            }
            
            if (self.didExitReviewList()) {
                self.onExitReviewList();
            } else if (self.didExitReview()) {
                if (self.onExitReview) {
                    self.onExitReview();
                }
            } else if (self.didExitArtist()) {
                self.onExitArtist();
            }

            self.updateCurrentLocation();
        });
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

    private didEnterArtist() {
        const matches = window.location.href.match(/artists\/.+\//g);
        return matches && matches.length > 0;
    }
    
    private didEnterReview() {
        const matches = window.location.href.match(/reviews\/albums\/.+\/(\?.+)?/g);
        const didEnter = matches && matches.length > 0;
        if (didEnter)
        {
            this.pageType = PageType.Review;
        }

        return didEnter;
    }

    private didEnterReviewList() {
        const matches = window.location.href.match(/(reviews\/albums\/$)|(reviews\/albums\/\?.+)/g);
        const didEnter = matches && matches.length > 0;
        if (didEnter)
        {
            this.pageType = PageType.AllReviews;
        }

        return didEnter;
    }

    private didExitArtist() {
        const matches = this.currentLocation.match(/artists\/.+\//g);
        const didEnter = matches && matches.length > 0;
        if (didEnter)
        {
            this.pageType = PageType.Artist;
        }

        return didEnter;
    }

    private didExitReviewList() {
        const matches = this.currentLocation.match(/(reviews\/albums\/$)|(reviews\/albums\/\?.+)/g);
        return matches && matches.length > 0;
    }

    private didExitReview() {
        const matches = this.currentLocation.match(/reviews\/albums\/.+\//g);
        return matches && matches.length > 0;
    }
}