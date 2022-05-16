class HTMLUtils {
    static setPosition(element, top, left) {
        element.css("top", `${top}px`);
        element.css("left", `${left}px`);
    }

    static setHTMLSize(element, size) {
        this.setHTMLWidthHeight(element, size.x, size.y);
    }

    static setHTMLWidthHeight(element, width, height) {
        element.attr("width", width);
        element.attr("height", height);
    }

    static onInteract(element, handler) {
        element.on("keydown", handler);
        element.on("click", handler);
    }

    static onInteractOnce(element, handler) {
        let done = false;
        this.onInteract(element, () => {
            if (!done) {
                handler();
                done = true;
            }
        })
    }
}