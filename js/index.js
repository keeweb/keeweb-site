'use strict';

var screenshots = ['scr1', 'scr2', 'scr3', 'scr4'];

document.addEventListener('DOMContentLoaded', function () {
    initDownload();
    setImages();
});

document.addEventListener(
    'scroll',
    function () {
        var height = window.innerHeight || document.documentElement.clientHeight;
        each('.feature>img[data-src]', function (el) {
            var rect = el.getBoundingClientRect();
            if (rect.bottom > 0 && rect.top < height + 100) {
                el.setAttribute('src', el.getAttribute('data-src'));
                el.removeAttribute('data-src');
            }
        });
    },
    { passive: true }
);

function setImages() {
    var odd = false;
    each('.feature>img', function (el) {
        if (odd) {
            el.parentNode.insertBefore(el, el.parentNode.firstChild);
        }
        odd = !odd;
    });
}

function initDownload() {
    var os = detectOs();
    if (os) {
        setDownloadButton(os);
    }
}

function detectOs() {
    var platform = navigator.platform.toLowerCase();
    if (platform.indexOf('mac') >= 0) {
        return navigator.platform === 'MacIntel' ? 'mac.x64' : 'mac.arm64';
    }
    if (platform.indexOf('linux') >= 0) {
        return 'linux';
    }
    if (platform.indexOf('win') >= 0 && /(WOW64|Win64)/.test(navigator.userAgent)) {
        return 'win.x64';
    }
    return undefined;
}

function setDownloadButton(os) {
    setDownloadButtonTitle(os);
    setLatestReleaseUrl(os);
}

function setDownloadButtonTitle(os) {
    each('.btn-download>.btn-desc', function (el) {
        switch (os) {
            case 'mac.x64':
            case 'mac.arm64':
                el.innerHTML = '<i class="fa fa-apple"></i> for macOS';
                break;
            case 'win.ia32':
            case 'win.x64':
                el.innerHTML = '<i class="fa fa-windows"></i> for Windows';
                break;
            case 'linux':
                el.innerHTML = '<i class="fa fa-linux"></i> for Linux';
                break;
        }
    });
    each('.btn-sub-link', function (el) {
        el.style.display = 'block';
    });
}

function setLatestReleaseUrl(os) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.addEventListener('load', function () {
        releasesLoaded(xhr.response, os);
    });
    xhr.open('GET', 'https://api.github.com/repos/keeweb/keeweb/releases/latest');
    xhr.send();
}

function releasesLoaded(releaseInfo, os) {
    var assetNamePart;
    switch (os) {
        case 'mac.x64':
            assetNamePart = releaseInfo.assets.some((asset) => asset.name.endsWith('mac.dmg'))
                ? 'mac.dmg'
                : 'mac.x64.dmg';
            break;
        case 'mac.arm64':
            assetNamePart = releaseInfo.assets.some((asset) => asset.name.endsWith('mac.dmg'))
                ? 'mac.dmg'
                : 'mac.arm64.dmg';
            break;
        case 'win.ia32':
            assetNamePart = 'win.ia32.exe';
            break;
        case 'win.x64':
            assetNamePart = 'win.x64.exe';
            break;
        case 'linux':
            assetNamePart = 'linux.x64.deb';
            break;
    }
    var url;
    releaseInfo.assets.forEach(function (asset) {
        if (asset.name.indexOf(assetNamePart) >= 0) {
            url = asset.browser_download_url;
        }
    });
    if (url) {
        each('.btn-download', function (el) {
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
    each('.screenshot-loader', function (el) {
        el.style.display = 'inline-block';
    });
}

function screenshotLoaded() {
    each('.screenshot-loader', function (el) {
        el.style.display = 'none';
    });
}

function each(sel, fn) {
    Array.prototype.forEach.call(document.querySelectorAll(sel), fn);
}
