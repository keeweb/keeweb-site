'use strict';

var screenshots = ['scr1', 'scr2', 'scr3', 'scr4'];

document.addEventListener('DOMContentLoaded', function() {
    initDownload();
});

function initDownload() {
    var os = detectOs();
    if (os) {
        setDownloadButton(os);
    }
}

function detectOs() {
    var platform = navigator.platform.toLowerCase();
    if (platform.indexOf('mac') >= 0) {
        return 'mac';
    }
    if (platform.indexOf('linux') >= 0) {
        return 'linux';
    }
    return 'win32';
}

function setDownloadButton(os) {
    setDownloadButtonTitle(os);
    setLatestReleaseUrl(os);
}

function setDownloadButtonTitle(os) {
    each('.btn-download>.btn-desc', function(el) {
        switch (os) {
            case 'mac':
                el.innerHTML = '<i class="fa fa-apple"></i> for Mac OS X';
                break;
            case 'win32':
                el.innerHTML = '<i class="fa fa-windows"></i> for Windows';
                break;
            case 'linux':
                el.innerHTML = '<i class="fa fa-linux"></i> for Linux';
                break;
        }
    });
}

function setLatestReleaseUrl(os) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.addEventListener('load', function() {
        releasesLoaded(xhr.response, os)
    });
    xhr.open('GET', 'https://api.github.com/repos/antelle/keeweb/releases/latest');
    xhr.send();
}

function releasesLoaded(releaseInfo, os) {
    var url;
    releaseInfo.assets.forEach(function(asset) {
        if (asset.name.indexOf(os) > 0) {
            url = asset.browser_download_url;
        }
    });
    if (url) {
        each('.btn-download', function(el) {
            el.setAttribute('href', url);
        });
    }
}

function rotateScreenshot(next) {
    var el = document.getElementById('scr-large');
    var src = el.getAttribute('src');
    var pic = src.match(/scr\d/)[0];
    var ix = screenshots.indexOf(pic);
    ix = (ix + screenshots.length + (next ? 1 : -1)) % screenshots.length;
    src = src.replace(pic, screenshots[ix]);
    el.setAttribute('src', src);
}

function each(sel, fn) {
    Array.prototype.forEach.call(document.querySelectorAll(sel), fn);
}
