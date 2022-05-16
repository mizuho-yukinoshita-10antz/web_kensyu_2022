class HTMLUtils {
    static setHTMLPosition(element, top, left) {
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
}