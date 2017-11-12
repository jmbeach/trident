import * as $ from "jquery";
import {Trident} from "./Trident";

let trident = null;
$(() => {
    trident = new Trident();
    $.get("chrome-extension://" + chrome.runtime.id + "/js/web_accessible.js", (data) => {
        trident.firstPageLoad();
        trident.insertScript(data);
        trident.insertFilterBoxes();
        trident.refreshCustomUi();
        trident.findOnYouTube();

        setInterval(() => {
            trident.refreshCustomUi();
        }, 2000);
    });
});
