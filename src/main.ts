import {Trident} from "./Trident";

let trident = null;
window.onload = () =>
{
    trident = new Trident();
    fetch("chrome-extension://" + chrome.runtime.id + "/js/web_accessible.js")
    .then(function (data) {
        return data.text();
    }).then(function (data) {
        trident.insertScript(data);
        trident.firstPageLoad();
        setInterval(() => {
            trident.refreshCustomUi();
        }, 2000);
    });
};