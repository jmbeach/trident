import {ReviewItem} from "./ReviewItem";
export class Review {
    public score: ReviewItem<number>;
    public publishedDate: ReviewItem<number>;
    public genre: ReviewItem<string>;

    constructor() {
        this.score = new ReviewItem<number>();
        this.genre = new ReviewItem<string>();
        this.publishedDate = new ReviewItem<number>();
    }

    public isVisible() {
        return !this.score.isFiltered
          && !this.publishedDate.isFiltered
          && !this.genre.isFiltered;
    }

    public setUnprocessed() {
        this.genre.setUnprocessed();
        this.score.setUnprocessed();
        this.publishedDate.setUnprocessed();
    }
}
