(async function (w) {

    let win = w;
    let doc = win.document;

    if (win.frameElement) {
        win = win.parent;
        doc = win.document;
    }

    async function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = doc.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            doc.head.appendChild(script);
        });
    }

    async function loadStylesheet(href) {
        return new Promise((resolve, reject) => {
            const link = doc.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = resolve;
            link.onerror = reject;
            doc.head.appendChild(link);
        });
    }

    function getParentDiv() {
        var parentDocument = w.parent.document;

        var iframes = parentDocument.getElementsByTagName('iframe');

        for (var i = 0; i < iframes.length; i++) {
            if (iframes[i].contentWindow === w) {
                // Get the parent <div> of the iframe
                var parentDiv = iframes[i].parentElement;
                return parentDiv;
            }
        }
    }

    try {

        const tagId = "662133bc2e04cff57835593b";
        const pubId = "662133bc2e04cff57835593b";
        const trackingDomain = "https://web-player-gray.vercel.app";

        const currentUrl = win.location.href;

        // const jsonUrl = `https://dev.playstream.media/api/adserver/json?PS_TAGID=${tagId}&PS_PUB_ID=${pubId}&currentUrl=${currentUrl}`;

        const jsonUrl = `https://web-player-gray.vercel.app/index.json`;

        win.playstream = {
            json: {
                url: jsonUrl
            },
            trackingDomain,
            cachingDomain: "${dependencyDomain}",
        }

        if (w.frameElement) {
            win.playstream.dfp = {
                flag: true,
                parentDiv: getParentDiv()
            };
        }

        const resources = [
            loadStylesheet("https://prodcdn.playstream.media/video-js.min.css"),
            loadScript("https://imasdk.googleapis.com/js/sdkloader/ima3.js"),
            loadScript("https://prodcdn.playstream.media/video.min.js"),
            loadScript("https://prodcdn.playstream.media/crypto-js.min.js")
        ];

        await Promise.all(resources);

        let script = doc.createElement('script');
        script.src = './player.js';
        doc.body.appendChild(script);
    } catch (error) {
        (console.warn || console.log)(error);
    }
})(window)
