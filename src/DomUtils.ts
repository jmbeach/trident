export class DomUtils {
    public parentsUntilClass(el, stopClass) {
        const parent = el.parentElement;
        if (parent.classList.contains(stopClass)) return parent;
        return this.parentsUntilClass(parent, stopClass);
    }

    public parentsUntilClassContains(el, stopClass) {
        const parent = el.parentElement;
        for (let i = 0; parent.classList && i < parent.classList.length; i++) {
            const currentClass = parent.classList[i];
            if (currentClass.indexOf(stopClass) >= 0) return parent;
        }

        return this.parentsUntilClassContains(parent, stopClass);
    }
}
