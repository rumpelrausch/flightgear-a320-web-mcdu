const MCDU = (function () {
    const screenImageBaseUrl = '/screenshot?canvasindex=10&type=jpg';
    const refreshInterval = 2000;

    const body = document.body;
    let currentCacheBust = 0;
    let lastSentText = '';

    function refreshScreen() {
        loadScreenImage(screenImageBaseUrl)
            .then(setScreenSrc)
            .catch(setScreenSrc);
    }

    function setScreenSrc(url) {
        url = typeof url === 'string' ? url : '';
        showScreenImageLoadState(url !== '');
        document.querySelectorAll('[data-element="lcdimage"]').forEach((imageElement) => {
            imageElement.src = url;
        });
    }

    function loadScreenImage(baseUrl) {
        currentCacheBust = new Date().getTime();
        return new Promise((resolve, reject) => {
            const url = baseUrl + '?cacheBust=' + currentCacheBust;
            const img = new Image;

            img.addEventListener('error', reject);

            img.addEventListener('load', (event) => {
                const gotCacheBust = parseInt(event.target.src.split('cacheBust=')[1]) || 0;
                if (gotCacheBust !== currentCacheBust) {
                    return;
                }
                showScreenImageLoadState(true);
                resolve(url);
            });
            img.src = url;
        });
    }

    function showScreenImageLoadState(isOK) {
        if (!isOK) {
            console.log('fail');
        }
    }

    function toggleUsedUniverse() {
        body.setAttribute('data-used-universe', body.getAttribute('data-used-universe') === '1' ? '0' : '1');
    }

    function registerButtons() {
        document.querySelectorAll('[data-button]').forEach((buttonElement) => {
            const buttonFunction = getButtonFunction(buttonElement);
            if (!(typeof buttonFunction === 'function')) {
                return;
            }
            buttonElement.addEventListener('click', buttonFunction);
        });
    }

    function registerKeyboardInput() {
        const keyTranslation = {
            BACKSPACE: 'CLR'
        };
        body.addEventListener('keyup', (event) => {
            const key = event.key.toUpperCase();
            if (key.match(/^[A-Z0-9/\-+.]$/)) {
                if(key === '+' || key === '-') {
                    return sendPlusMinusKey();
                }
                return sendButtonpress('button', key);
            }

            const translatedKey = keyTranslation[key];
            if (translatedKey) {
                return sendButtonpress('button', translatedKey);
            }
        });
    }

    function getButtonFunction(buttonElement) {
        const buttonActions = buttonElement.getAttribute('data-button').split(':');
        const actionKey = buttonActions[0];
        const actionValue = buttonActions[1];
        if (actionKey === 'toggleUsedUniverse') {
            return toggleUsedUniverse;
        }

        if(actionKey === 'button' && actionValue === '-') {
            return sendPlusMinusKey;
        }

        return function () {
            sendButtonpress(actionKey, actionValue);
        };
    }

    function sendPlusMinusKey() {
        if(lastSentText === '-') {
            sendButtonpress('button', 'CLR')
            .then(() => {
                sendButtonpress('button', '+');
            })
            return;
        }

        if(lastSentText === '+') {
            sendButtonpress('button', 'CLR')
            .then(() => {
                sendButtonpress('button', '-');
            })
            return;
        }

        sendButtonpress('button', '-');
    }

    function sendButtonpress(type, text) {
        // console.log({ type, text });
        let request = new XMLHttpRequest;
        request.open("POST", "/run.cgi?value=nasal");
        request.setRequestHeader("Content-Type", "application/json");
        let body = JSON.stringify({
            "name": "",
            "children": [
                {
                    "name": "script",
                    "index": 0,
                    "value": "mcdu." + type + "(\"" + text + "\", 0);"
                }
            ]
        });
        request.send(body);
        setTimeout(refreshScreen, 150);
        return new Promise((resolve) => {
            request.addEventListener('load', () => {
                lastSentText = text;
                refreshScreen();
                resolve();
            }, true);
        });
    }

    registerButtons();
    registerKeyboardInput();
    setInterval(refreshScreen, refreshInterval);
    refreshScreen();

    return {
        toggleUsedUniverse
    }
})();