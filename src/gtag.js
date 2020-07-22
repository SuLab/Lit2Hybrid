import vm from "./main";

export default class Gtag {
    static trackTerms(action, value) {
        vm.$gtag.event(action, {
            "event_category": "Queries",
            "event_label": "Terms",
            "value": value
        });
    }

    static trackModifiers(action, value) {
        vm.$gtag.event(action, {
            "event_category": "Queries",
            "event_label": "Modifiers",
            "value": value
        });
    }
}