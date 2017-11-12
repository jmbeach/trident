import * as $ from "jquery";
import {Trident} from "./Trident";

let trident = null;
$(() => {
    trident = new Trident();
    $.get("chrome-extension://" + chrome.runtime.id + "/js/web_accessible.js", (data) => {
        trident.insertScript(data);
        trident.firstPageLoad();

        setInterval(() => {
            trident.refreshCustomUi();
        }, 2000);
    });
});
