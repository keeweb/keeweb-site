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
    xhr.addEventListener('error', function () {
        showLastAvailableReleaseIfAny(os);
    });
    xhr.addEventListener('load', function () {
        if (xhr.status === 200) {
            releasesLoaded(xhr.response, os);
            try {
                localStorage.lastRelease = JSON.stringify({
                    dt: Date.now(),
                    releaseInfo: xhr.response
                });
            } catch (ex) {}
        } else {
            showLastAvailableReleaseIfAny(os);
        }
    });
    xhr.open('GET', 'https://api.github.com/repos/keeweb/keeweb/releases/latest');
    xhr.send();
}

function showLastAvailableReleaseIfAny(os) {
    if (localStorage && localStorage.lastRelease) {
        var lastRelease = JSON.parse(localStorage.lastRelease);
        var oneDayInMs = 24 * 60 * 60 * 1000;
        if (lastRelease && Date.now() - lastRelease.dt < oneDayInMs) {
            releasesLoaded(lastRelease.releaseInfo, os);
        }
    }
}

function releasesLoaded(releaseInfo, os) {
    var assetNamePart;
    switch (os) {
        case 'mac.x64':
            assetNamePart = 'mac.x64.dmg';
            break;
        case 'mac.arm64':
            assetNamePart = 'mac.arm64.dmg';
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
            if (os === 'mac.x64') {
                var appleSiliconDownloadUrl = releaseInfo.assets.find(function (asset) {
                    return asset.name.indexOf('.arm64.dmg') > 0;
                });
                if (appleSiliconDownloadUrl) {
                    addAppleSiliconDownloadOption(el, appleSiliconDownloadUrl.browser_download_url);
                }
            }
        });
    }
}

function addAppleSiliconDownloadOption(el, url) {
    var wrapper = document.createElement('div');
    el.parentElement.insertBefore(wrapper, el.nextSibling);
    wrapper.classList.add('download-extras');

    var link = document.createElement('a');
    link.setAttribute('href', url);
    link.classList.add('btn', 'btn-extra', 'btn-download');
    wrapper.appendChild(link);

    var linkText = document.createElement('div');
    linkText.classList.add('btn-text');
    linkText.innerText = 'Apple Silicon Mac? Click here';
    link.appendChild(linkText);
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
