const MCDU = (function () {
    const body = document.body;

    function refreshScreen() {
        document.querySelectorAll('[data-element="lcdimage"]').forEach((image) => {
            image.src = "/screenshot?canvasindex=10&type=png?cacheBust=" + new Date().getTime();
        });
    }

    function toggleUsedUniverse(event) {
        body.setAttribute('data-used-universe', body.getAttribute('data-used-universe') === '1' ? '0' : '1');
    }

    setInterval(refreshScreen, 500);

    return {
        toggleUsedUniverse
    }
})();