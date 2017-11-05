export class ReviewItem<TValue> {
    public value: TValue;
    public isProcessed: boolean;
    public isInserted: boolean;
    public isFiltered: boolean;

    public setProcessed() {
        this.isProcessed = true;
    }

    public setUnprocessed() {
        this.isProcessed = false;
    }

    public setInserted() {
        this.isInserted = true;
    }

    public setFiltered() {
        this.isFiltered = true;
    }

    public setUnfiltered() {
        this.isFiltered = false;
    }
}
