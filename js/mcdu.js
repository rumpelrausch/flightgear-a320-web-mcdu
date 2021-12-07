const MCDU = (function () {
    const body = document.body;
    
    function refreshScreen() {
        document.querySelectorAll('[data-element="lcdimage"]').forEach((image) => {
            image.src = "/screenshot?canvasindex=10&type=jpg?cacheBust=" + new Date().getTime();
        });
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
            if(key.match(/^[A-Z/\-+]$/)) {
                return sendButtonpress('button', key);
            }

            const translatedKey = keyTranslation[key];
            if(translatedKey) {
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

        if (actionKey === 'lskbutton' || actionKey === 'rskbutton') {
            return function () {
                sendButtonpress(actionKey, actionValue);
            };
        }
    }

    function sendButtonpress(type, text) {
        console.log({type, text});
        let request = new XMLHttpRequest;
        request.open(
            "POST",
            //window.location.protocol + "//" + window.location.host + "/run.cgi?value=nasal"
            "/run.cgi?value=nasal"
        );
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
        request.addEventListener('load', function () {
            refreshScreen();
        }, true);
    }

    registerButtons();
    registerKeyboardInput();
    setInterval(refreshScreen, 500);

    return {
        toggleUsedUniverse
    }
})();