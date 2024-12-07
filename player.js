(function (w) {
    let win = w;
    let doc = win.document;

    if (win.frameElement) {
        win = win.parent;
        doc = win.document;
    }

    // global variable
    let mainWrapper;
    let videoWrapper;
    let floatingDiv;
    let floatingPlaceHolder;
    let advertisingBanner;
    let closeButton;
    let advertismentLabel;
    let videoSpace;
    let logoSpace;
    let videoPlayerContainer;
    let videoPlayer;
    let adContainer;
    let videoAdSlot;
    let closeButtonTimeout;

    let soundAllowed = false;
    let sound = true;
    let playerPlaying = false;
    let fullscreen = false;
    let flag = true;
    let hoverTimeout;

    let scriptConfig;
    let vastTags;
    let videoPlayerData;

    let userIPData;
    let dfp = false;

    let isMobileUser;
    let tagsArray = [];
    let selectors = [];
    let placeAdjacent = false;
    let placeAfter = false;
    let templateData;
    let domainPlayerDisplay = false;
    let sellerId;

    let currentUrl = win?.location?.href;
    let mainDomainHost = `${win?.location?.protocol}//${win?.location?.hostname}/`
    let trackingDomain = win?.playstream?.trackingDomain;
    let cachingDomain = win?.playstream?.cachingDomain;

    let subDomain;
    let mainDomain;
    let browser;
    let userOS;

    let errorCount = 0;
    let currentVastIndex = 0;
    let currentSourceIndex = 0;
    let requestingAds = false;
    let adPlaying = false;
    let maxRequests = 5;
    let adIframe;
    let iframeScript;

    let adQueueProxy;

    let adsRequests = [];
    let adQueue = [];

    let adDisplayingData;

    let floatingAllowed = true;
    let floatingClassName;
    let playerInView;
    let playerInitiallyView = false;
    let apstag;

    const pubID = '5d8ed25e-57cc-441a-b62a-127b34faae4e';

    let passbackContainer;
    let passbackDisplaying = false;
    let passbackDiv;
    let passbackInterval;

    let requestOnPlayerView = false;
    let requestOnPlayerViewInterval;
    let adRequestAllowed = true;

    let tapToPlayInitiated = false;
    let videoThumbnail;
    // 

    function playerInViewFunction() {
        try {
            const { playOnViewPercentage } = templateData;

            const observerOptions = {
                root: null,
                threshold: playOnViewPercentage / 100
            };

            const observerCallback = (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        if (!playerInitiallyView) {
                            playerInitiallyView = true;
                        }
                        playerInView = true;
                    } else {

                        const rect = mainWrapper.getBoundingClientRect();
                        if (rect.top < 0) {
                            playerInitiallyView = true;
                        }
                        playerInView = false;
                    }
                });
            };

            const observer = new IntersectionObserver(observerCallback, observerOptions);

            observer.observe(mainWrapper);
        } catch (error) {
            (console.warn || console.log)(error);
        }
    }

    function returnUserOS() {
        try {
            const userAgent = navigator.userAgent.toLowerCase();

            const agentInfo = {
                IOS: /(ipad|iphone|ipod|ios)/.test(userAgent),
                Macbook: /macintosh/.test(userAgent),
                Android: /android/.test(userAgent),
                Windows: /windows/.test(userAgent) && !/windows phone/.test(userAgent),
                WindowsPhone: /windows phone/.test(userAgent),
                Blackberry: /blackberry/.test(userAgent),
                Roku: /roku/.test(userAgent),
                AppleTV: /apple tv/.test(userAgent),
                Linux: /linux/.test(userAgent) && !/android/.test(userAgent),
                Ipad: /macintosh/.test(userAgent),
            };

            const detectedOS = Object.keys(agentInfo).find(os => agentInfo[os]);
            userOS = detectedOS || null;
        } catch (error) {
            (console.warn || console.log)(error);
        }
    }

    function setBrowserInfo() {
        try {
            const userAgent = navigator.userAgent;

            if ((userAgent.indexOf("Opera") || userAgent.indexOf('OPR')) != -1) {
                browser = 'Opera';
            } else if (userAgent.indexOf("Edg") != -1) {
                browser = 'Edge';
            } else if (userAgent.indexOf("Chrome") != -1) {
                browser = 'Chrome';
            } else if (userAgent.indexOf("Safari") != -1) {
                browser = 'Safari';
            } else if (userAgent.indexOf("Firefox") != -1) {
                browser = 'Firefox';
            } else {
                browser = 'Unknown';
            }

        } catch (error) {
            (console.warn || console.log)(error);
        }
    }

    function getUserDevice() {
        const userAgent = navigator.userAgent.toLowerCase();

        if (
            /windows nt|windows 98|win98|macintosh|mac os x|linux/i.test(userAgent) && !/(iphone|ipod|android)/.test(userAgent)
        ) {
            return "desktop";
        } else if (
            /(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(userAgent)
        ) {
            return "tablet";
        } else if (
            /iphone|ipod|blackberry|opera mini|iemobile|android/i.test(userAgent)
        ) {
            return "smartphone";
        } else if (/smart[ -]?tv|tizen|apple tv/i.test(userAgent)) {
            return "smartTv";
        } else if (/robot|bot/i.test(userAgent)) {
            return "robot";
        } else {
            return "other";
        }
    }

    function domainSubDomainCheck() {
        try {
            subDomain = win.location.hostname;
            let isSubdomain = /^[^.]+\.[^.]+\.[^.]+$/.test(subDomain);

            if (isSubdomain) {
                mainDomain = subDomain.split('.').slice(1).join('.');
            } else {
                mainDomain = subDomain;
            }

            mainDomain = mainDomain.replace(/\./g, '[DOT]')
            subDomain = subDomain.replace(/\./g, '[DOT]')
        } catch (error) {
            (console.warn || console.log)(error);
        }
    }

    function checkAutoplayWithSound() {
        try {
            const audioContext = new (win.AudioContext || win.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            gainNode.gain.value = 0;
            oscillator.start();

            try {
                audioContext.resume();

                if (audioContext.state === 'suspended') {
                    soundAllowed = false;
                } else {
                    soundAllowed = true;
                }

            } catch (error) {
                soundAllowed = false;
                (console.warn || console.log)(error);
            }
        } catch (error) {
            soundAllowed = false;
            (console.warn || console.log)(error);
        }
    }

    async function loadPlayer() {
        try {

            const {
                enableLogo,
                logoText,
                customLogo,
                logoClickthrough,
                logoHeight,
                logoWidth,
                logoLink,
                responsive,
                width,
                maxWidth,
                height,
                minHeight: maxHeight,
                sound: soundFlag,
                controls,
                customCss,
                playListUrls,
                playerMarginTop,
                playerMarginBottom,
                positioning,
                crossButton,
                mobileCrossButton,
                crossbuttontimeout,
                crossbuttontimeouttime,
                labelColor
            } = templateData;

            const { adsType, flagMobileSettings } = scriptConfig;

            if (soundAllowed) {
                sound = soundFlag;
            } else {
                sound = false;
            }

            // ///////////////////////////
            // append styles
            // ///////////////////////////

            const style = doc.createElement('style');
            style.textContent = `
                #playstream-video-wrapper {
                    max-height: 380px;
                    max-width: 640px;
                    height: 100%;
                    width: 100%;
                }
                #playstream-floating-div {
                    height: 100%;
                    width: 100%;
                }
                #playstream-advertising-banner {
                    height: 20px;
                    width: 100%;
                    position: relative;
                    color: black;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                #playstream-close-button {
                    position: absolute;
                    height: 10px;
                    width: 10px;
                    cursor: pointer;
                    left: 0;
                    top: 0;
                    line-height: 0px;
                }
                #playstream-advertisment {
                    text-align: center;
                    font-size: 14px;
                }
                #playstream-video-space {
                    position: relative;
                    width: 100%;
                    height: calc(100% - 20px);
                }
                #playstream-logo-space {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    z-index: 1;
                    cursor: pointer;
                    margin: 0;
                    display: flex;
                    gap: 5px;
                }
                #playstream-logo-space p {
                    margin: 0;
                    font-size: 12px;
                    color: white;
                }
                #playstream-logo-space img {
                    object-fit: contain;
                }
                #playstream-video-player-container {
                    position: absolute;
                    height: 100%;
                    width: 100%;
                }
                #playstream-video-player {
                    height: 100%;
                    width: 100%;
                }
                #playstream-ad-container {
                    position: absolute;
                    height: 100%;
                    width: 100%;
                    display: block;
                    visibility: hidden;
                }
                #playstream-video-ad-slot {
                    height: 100%;
                    width: 100%;
                    position: absolute;
                    visibility: hidden;
                }
                #playstream-passback-container {
                    height: 100%;
                    width: 100%;
                    position: absolute;
                    visibility: hidden;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-wrap: wrap;
                }
            `;

            const floatingStyle = doc.createElement('style');
            floatingStyle.textContent = `
                .playstream-box-shadow {
                    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.3), 0 6px 20px 0 rgba(0, 0, 0, 0.3);
                }
                .playstream-right-top {
                    right: 0 !important;
                    top: 0 !important;
                    bottom: auto !important;
                    left: auto !important;
                }

                .playstream-right-bottom {
                    right: 0 !important;
                    bottom: 0 !important;
                    top: auto !important;
                    left: auto !important;
                }

                .playstream-left-top {
                    left: 0 !important;
                    top: 0 !important;
                    bottom: auto !important;
                    right: auto !important;
                }

                .playstream-left-bottom {
                    left: 0 !important;
                    bottom: 0 !important;
                    top: auto !important;
                    right: auto !important;
                }

               .playstream-top {
                    left: 0 !important;
                    top: 0 !important;
                    right: 0 !important;
                    bottom: auto !important;
                }

                .playstream-bottom {
                    left: 0 !important;
                    bottom: 0 !important;
                    right: 0 !important;
                    top: auto !important;
                }

                .playstream-is-sticky {
                    position: fixed !important;
                    z-index: 65124671134134 !important;
                }

                .playstream-fadeInUp {
                    -webkit-animation-name: playstream-fadeInUp;
                    animation-name: playstream-fadeInUp;
                    -webkit-animation-duration: 1s;
                    animation-duration: 1s;
                    -webkit-animation-fill-mode: both;
                    animation-fill-mode: both;
                }

                .playstream-fadeInLeftToRight {
                    -webkit-animation-name: playstream-fadeInLeftToRight;
                    animation-name: playstream-fadeInLeftToRight;
                    -webkit-animation-duration: 1s;
                    animation-duration: 1s;
                    -webkit-animation-fill-mode: both;
                    animation-fill-mode: both;
                }

                .playstream-fadeInRightToLeft {
                    -webkit-animation-name: playstream-fadeInRightToLeft;
                    animation-name: playstream-fadeInRightToLeft;
                    -webkit-animation-duration: 1s;
                    animation-duration: 1s;
                    -webkit-animation-fill-mode: both;
                    animation-fill-mode: both;
                }

                .playstream-fadeInTopToBottom {
                    -webkit-animation-name: playstream-fadeInTopToBottom;
                    animation-name: playstream-fadeInTopToBottom;
                    -webkit-animation-duration: 1s;
                    animation-duration: 1s;
                    -webkit-animation-fill-mode: both;
                    animation-fill-mode: both;
                }

                @-webkit-keyframes playstream-fadeInUp {
                    0% {
                        opacity: 0;
                        -webkit-transform: translate3d(0, 100%, 0);
                        transform: translate3d(0, 100%, 0);
                    }

                    100% {
                        opacity: 1;
                        -webkit-transform: none;
                        transform: none;
                    }
                }

                @keyframes playstream-fadeInUp {
                    0% {
                        opacity: 0;
                        -webkit-transform: translate3d(0, 100%, 0);
                        transform: translate3d(0, 100%, 0);
                    }

                    100% {
                        opacity: 1;
                        -webkit-transform: none;
                        transform: none;
                    }
                }

                @-webkit-keyframes playstream-fadeInLeftToRight {
                    0% {
                        opacity: 0;
                        -webkit-transform: translate3d(-100%, 0, 0);
                        transform: translate3d(-100%, 0, 0);
                    }
                    100% {
                        opacity: 1;
                        -webkit-transform: none;
                        transform: none;
                    }
                }

                @keyframes playstream-fadeInLeftToRight {
                    0% {
                        opacity: 0;
                        -webkit-transform: translate3d(-100%, 0, 0);
                        transform: translate3d(-100%, 0, 0);
                    }
                    100% {
                        opacity: 1;
                        -webkit-transform: none;
                        transform: none;
                    }
                }

                @-webkit-keyframes playstream-fadeInRightToLeft {
                    0% {
                        opacity: 0;
                        -webkit-transform: translate3d(100%, 0, 0);
                        transform: translate3d(100%, 0, 0);
                    }
                    100% {
                        opacity: 1;
                        -webkit-transform: none;
                        transform: none;
                    }
                }

                @keyframes playstream-fadeInRightToLeft {
                    0% {
                        opacity: 0;
                        -webkit-transform: translate3d(100%, 0, 0);
                        transform: translate3d(100%, 0, 0);
                    }
                    100% {
                        opacity: 1;
                        -webkit-transform: none;
                        transform: none;
                    }
                }

                @-webkit-keyframes playstream-fadeInTopToBottom {
                    0% {
                        opacity: 0;
                        -webkit-transform: translate3d(0, -100%, 0);
                        transform: translate3d(0, -100%, 0);
                    }
                    100% {
                        opacity: 1;
                        -webkit-transform: none;
                        transform: none;
                    }
                }

                @keyframes playstream-fadeInTopToBottom {
                    0% {
                        opacity: 0;
                        -webkit-transform: translate3d(0, -100%, 0);
                        transform: translate3d(0, -100%, 0);
                    }
                    100% {
                        opacity: 1;
                        -webkit-transform: none;
                        transform: none;
                    }
                }
            `;

            // ///////////////////////////

            // ///////////////////////////
            // append main wrapper
            // ///////////////////////////

            mainWrapper = doc.createElement('div');
            mainWrapper.id = 'playstream-main-wrapper';
            mainWrapper.style.height = '100%';
            mainWrapper.style.width = '100%';
            mainWrapper.style.margin = "0 auto";
            mainWrapper.style.clear = "both";
            mainWrapper.style.maxWidth = `${responsive ? maxWidth ?? 640 : width ?? 640}px`
            mainWrapper.style.maxHeight = `${responsive ? maxHeight + 20 ?? 380 : height + 20 ?? 380}px`
            if (positioning !== "sticky" && adsType !== "outstream") {
                mainWrapper.style.marginTop = `${playerMarginTop}px`;
                mainWrapper.style.marginBottom = `${playerMarginBottom}px`;
            }

            // ///////////////////////////

            // ///////////////////////////
            // appending styles to main wrapper
            // ///////////////////////////

            if (customCss) {
                const customStyle = doc.createElement('style');
                customStyle.textContent = customCss;
                doc.head.appendChild(customStyle);
            }

            mainWrapper.appendChild(style);
            mainWrapper.appendChild(floatingStyle);

            // ///////////////////////////

            // ///////////////////////////
            // append video wrapper
            // ///////////////////////////

            videoWrapper = doc.createElement('div');
            videoWrapper.id = 'playstream-video-wrapper';
            if (adsType === "outstream") {
                videoWrapper.style.display = 'none';
            }

            mainWrapper.appendChild(videoWrapper);

            // ///////////////////////////

            // ///////////////////////////
            // append floating div and floating place holder
            // ///////////////////////////

            floatingDiv = doc.createElement('div');
            floatingDiv.id = 'playstream-floating-div';

            floatingPlaceHolder = doc.createElement('div');
            floatingPlaceHolder.id = 'playstream-floating-place-holder';

            videoWrapper.appendChild(floatingDiv);
            videoWrapper.appendChild(floatingPlaceHolder);

            // ///////////////////////////

            // ///////////////////////////
            // append advertising banner
            // ///////////////////////////

            advertisingBanner = doc.createElement('div');
            advertisingBanner.id = 'playstream-advertising-banner';

            if ((flagMobileSettings ? crossButton : isMobileUser ? mobileCrossButton : crossButton) ?? true) {
                closeButton = doc.createElement('div');
                closeButton.id = 'playstream-close-button';
                closeButton.innerHTML = `
                    <svg width="10px" height="10px" viewBox="0 0 24.00 24.00" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#000000" stroke-width="0.9600000000000002"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path id="PS_Vector" d="M20.7457 3.32851C20.3552 2.93798 19.722 2.93798 19.3315 3.32851L12.0371 10.6229L4.74275 3.32851C4.35223 2.93798 3.71906 2.93798 3.32854 3.32851C2.93801 3.71903 2.93801 4.3522 3.32854 4.74272L10.6229 12.0371L3.32856 19.3314C2.93803 19.722 2.93803 20.3551 3.32856 20.7457C3.71908 21.1362 4.35225 21.1362 4.74277 20.7457L12.0371 13.4513L19.3315 20.7457C19.722 21.1362 20.3552 21.1362 20.7457 20.7457C21.1362 20.3551 21.1362 19.722 20.7457 19.3315L13.4513 12.0371L20.7457 4.74272C21.1362 4.3522 21.1362 3.71903 20.7457 3.32851Z" fill="#0F0F0F"></path> </g></svg>
                `;
                closeButton.style.display = crossbuttontimeout ? 'none' : 'block';

                let remainingTime = crossbuttontimeouttime;

                closeButtonTimeout = doc.createElement('div');
                closeButtonTimeout.id = 'playstream-close-button';
                closeButtonTimeout.style.width = 'auto';
                closeButtonTimeout.style.height = '100%';
                closeButtonTimeout.style.lineHeight = 'normal';
                closeButtonTimeout.style.fontSize = '14px';
                closeButtonTimeout.style.color = labelColor ?? "#ffffff";
                closeButtonTimeout.style.display = crossbuttontimeout ? 'block' : 'none';

                closeButtonTimeout.innerHTML = `${remainingTime}`;

                if (crossbuttontimeout) {
                    advertisingBanner.appendChild(closeButtonTimeout);

                    const closeButtonInterval = setInterval(() => {
                        remainingTime--;
                        if (remainingTime > 0) {
                            closeButtonTimeout.innerHTML = `${remainingTime}`;
                        } else {
                            clearInterval(closeButtonInterval);
                            closeButtonTimeout.style.display = 'none';
                            closeButton.style.display = 'block';
                        }
                    }, 1000);
                }

                advertisingBanner.appendChild(closeButton);
            }

            advertismentLabel = doc.createElement('div');
            advertismentLabel.id = 'playstream-advertisment';
            advertismentLabel.innerHTML = 'Advertisement';

            advertisingBanner.appendChild(advertismentLabel);

            floatingDiv.appendChild(advertisingBanner);

            // ///////////////////////////

            // ///////////////////////////
            // append video space
            // ///////////////////////////

            videoSpace = doc.createElement('div');
            videoSpace.id = 'playstream-video-space';
            videoSpace.classList.add('playstream-box-shadow');

            floatingDiv.appendChild(videoSpace);

            // ///////////////////////////

            // ///////////////////////////
            // append logo space
            // ///////////////////////////

            if (enableLogo ?? true) {

                logoSpace = doc.createElement('div');
                logoSpace.id = 'playstream-logo-space';

                const textLogo = doc.createElement('p');
                textLogo.innerHTML = (enableLogo && logoText) ? (logoText) : "Ads by: ";

                const imageTaged = doc.createElement('a');
                imageTaged.href = (enableLogo && customLogo) ? (logoClickthrough ?? "https://playstream.media/") : "https://playstream.media/";
                imageTaged.target = '_blank';

                const imageLogo = doc.createElement('img');
                imageLogo.src = customLogo ? (logoLink ?? "https://cdn.playstream.media/logo.png") : "https://cdn.playstream.media/logo.png"
                imageLogo.alt = 'Logo';
                imageLogo.width = customLogo ? `${logoWidth}` : "15";
                imageLogo.height = customLogo ? `${logoHeight}` : "15";

                imageTaged.appendChild(imageLogo);

                logoSpace.appendChild(textLogo);
                logoSpace.appendChild(imageTaged);

                videoSpace.appendChild(logoSpace);
            }

            // ///////////////////////////

            // ///////////////////////////
            // append video player container
            // ///////////////////////////

            videoPlayerContainer = doc.createElement('div');
            videoPlayerContainer.id = 'playstream-video-player-container';
            videoPlayerContainer.style.overflow = 'hidden';

            videoPlayer = doc.createElement('video');
            videoPlayer.id = 'playstream-video-player';
            videoPlayer.classList.add('video-js');
            videoPlayer.controls = controls ?? true;
            videoPlayer.muted = !sound;
            videoPlayer.playsinline = true;
            videoPlayer.preload = 'auto';

            const source = doc.createElement('source');
            source.src = playListUrls[0]?.url;
            source.type = playListUrls[0]?.type === "mp4" ? "video/mp4" : "application/x-mpegURL";

            videoPlayer.appendChild(source);

            videoPlayerContainer.appendChild(videoPlayer);

            videoSpace.appendChild(videoPlayerContainer);

            // ///////////////////////////

            // ///////////////////////////
            // append ad container
            // ///////////////////////////

            adContainer = doc.createElement('div');
            adContainer.id = 'playstream-ad-container';
            adContainer.style.zIndex = '1';
            adContainer.style.backgroundColor = 'white'
            adContainer.style.overflow = 'hidden';

            videoAdSlot = doc.createElement('div');
            videoAdSlot.id = 'playstream-video-ad-slot';

            passbackContainer = doc.createElement('div');
            passbackContainer.id = 'playstream-passback-container';

            adContainer.appendChild(videoAdSlot);
            adContainer.appendChild(passbackContainer);

            videoSpace.appendChild(adContainer);

            // /////////////////////////// 

            // ///////////////////////////
            // append main wrapper to body
            // ///////////////////////////

            return mainWrapper;

        } catch (error) {
            (console.warn || console.log)(error);
        }
    }

    function resizeContainer() {
        try {

            const { aspectRatio, responsive, floatingWidth, maxWidth, width, positioning, passback, backgroundColor, labelColor } = templateData;
            const { adsType } = scriptConfig;

            let mainwidth = mainWrapper.clientWidth;
            let floatingDivWidth = (mainwidth * floatingWidth) / 100;

            let closeIconPath;

            if (closeButton) {
                closeIconPath = doc.getElementById('PS_Vector');
            }

            if (positioning === "sticky") {

                let stickyWidth = responsive ? maxWidth ?? 640 : width;
                let actualWidth = win.innerWidth < 640 ? (win.innerWidth / 640) * stickyWidth : stickyWidth;

                if (floatingDiv.classList.contains("playstream-top") || floatingDiv.classList.contains("playstream-bottom")) {
                    if (!responsive) {
                        let height = actualWidth * 9 / 16;
                        let width = actualWidth;

                        if (adsType === "outstream" && passbackDisplaying) {
                            height = height < passback?.passbackHeight ? passback?.passbackHeight : height;
                            width = width < passback?.passbackWidth ? passback?.passbackWidth : width;
                        }

                        floatingPlaceHolder.style.height = "0px";
                        floatingPlaceHolder.style.width = "0px";

                        floatingDiv.style.height = 'auto';
                        floatingDiv.style.width = '100%';
                        floatingDiv.style.backgroundColor = backgroundColor;
                        advertisingBanner.style.color = labelColor ?? "#ffffff";
                        if (closeButton) {
                            closeIconPath.setAttribute('stroke', labelColor ?? "#ffffff");
                        }
                        if (closeButtonTimeout) {
                            closeButtonTimeout.style.color = labelColor ?? "#ffffff";
                        }

                        videoSpace.style.height = `${height}px`;
                        videoSpace.style.width = `${width}px`;
                        videoSpace.style.margin = 'auto';
                    }

                    if (aspectRatio === "16:9" && responsive) {
                        let height = actualWidth * 9 / 16;
                        let width = actualWidth;

                        if (adsType === "outstream" && passbackDisplaying) {
                            height = height < passback?.passbackHeight ? passback?.passbackHeight : height;
                            width = width < passback?.passbackWidth ? passback?.passbackWidth : width;
                        }

                        floatingPlaceHolder.style.height = "0px";
                        floatingPlaceHolder.style.width = "0px";

                        floatingDiv.style.height = 'auto';
                        floatingDiv.style.width = '100%';
                        floatingDiv.style.backgroundColor = backgroundColor;
                        advertisingBanner.style.color = labelColor ?? "#ffffff";
                        if (closeButton) {
                            closeIconPath.setAttribute('stroke', labelColor ?? "#ffffff");
                        }
                        if (closeButtonTimeout) {
                            closeButtonTimeout.style.color = labelColor ?? "#ffffff";
                        }

                        videoSpace.style.height = `${height}px`;
                        videoSpace.style.width = `${width}px`;
                        videoSpace.style.margin = 'auto';
                    }

                    if (aspectRatio === "4:3" && responsive) {
                        let height = actualWidth * 3 / 4;
                        let width = actualWidth;

                        if (adsType === "outstream" && passbackDisplaying) {
                            height = height < passback?.passbackHeight ? passback?.passbackHeight : height;
                            width = width < passback?.passbackWidth ? passback?.passbackWidth : width;
                        }

                        floatingPlaceHolder.style.height = "0px";
                        floatingPlaceHolder.style.width = "0px";

                        floatingDiv.style.height = 'auto';
                        floatingDiv.style.width = '100%';
                        floatingDiv.style.backgroundColor = backgroundColor;
                        advertisingBanner.style.color = labelColor ?? "#ffffff";
                        if (closeButton) {
                            closeIconPath.setAttribute('stroke', labelColor ?? "#ffffff");
                        }
                        if (closeButtonTimeout) {
                            closeButtonTimeout.style.color = labelColor ?? "#ffffff";
                        }

                        videoSpace.style.height = `${height}px`;
                        videoSpace.style.width = `${width}px`;
                        videoSpace.style.margin = 'auto';
                    }
                } else {

                    if (!responsive) {

                        let height = actualWidth * 9 / 16;
                        let width = actualWidth;

                        if (adsType === "outstream" && passbackDisplaying) {
                            height = height < passback?.passbackHeight ? passback?.passbackHeight : height;
                            width = width < passback?.passbackWidth ? passback?.passbackWidth : width;
                        }

                        floatingDiv.style.height = `${height + 20}px`;
                        floatingDiv.style.width = `${width}px`;

                        floatingPlaceHolder.style.height = "0px";
                        floatingPlaceHolder.style.width = "0px";
                    }

                    if (aspectRatio === "16:9" && responsive) {

                        let height = actualWidth * 9 / 16;
                        let width = actualWidth;

                        if (adsType === "outstream" && passbackDisplaying) {
                            height = height < passback?.passbackHeight ? passback?.passbackHeight : height;
                            width = width < passback?.passbackWidth ? passback?.passbackWidth : width;
                        }

                        floatingDiv.style.height = `${height + 20}px`;
                        floatingDiv.style.width = `${width}px`;

                        floatingPlaceHolder.style.height = "0px";
                        floatingPlaceHolder.style.width = "0px";
                    }

                    if (aspectRatio === "4:3" && responsive) {

                        let height = actualWidth * 3 / 4;
                        let width = actualWidth;

                        if (adsType === "outstream" && passbackDisplaying) {
                            height = height < passback?.passbackHeight ? passback?.passbackHeight : height;
                            width = width < passback?.passbackWidth ? passback?.passbackWidth : width;
                        }

                        floatingDiv.style.height = `${height + 20}px`;
                        floatingDiv.style.width = `${width}px`;

                        floatingPlaceHolder.style.height = "0px";
                        floatingPlaceHolder.style.width = "0px";
                    }

                }
            } else {

                if (floatingDiv.classList.contains("playstream-is-sticky")) {

                    if (floatingDiv.classList.contains("playstream-top") || floatingDiv.classList.contains("playstream-bottom")) {
                        if (!responsive) {
                            let height = mainwidth * 9 / 16;
                            let width = mainwidth;

                            let floatingPlayerHeight = floatingDivWidth * 9 / 16;
                            let floatingPlayerWidth = floatingDivWidth;

                            if (adsType === "outstream" && passbackDisplaying) {
                                height = height < passback?.passbackHeight ? passback?.passbackHeight : height;
                                width = width < passback?.passbackWidth ? passback?.passbackWidth : width;

                                floatingPlayerHeight = floatingPlayerHeight < passback?.passbackHeight ? passback?.passbackHeight : floatingPlayerHeight;
                                floatingPlayerWidth = floatingPlayerWidth < passback?.passbackWidth ? passback?.passbackWidth : floatingPlayerWidth;
                            }


                            floatingPlaceHolder.style.height = `${height + 20}px`;
                            floatingPlaceHolder.style.width = `${width}px`;

                            floatingDiv.style.height = 'auto';
                            floatingDiv.style.width = '100%';
                            floatingDiv.style.backgroundColor = backgroundColor;
                            advertisingBanner.style.color = labelColor ?? "#ffffff";
                            if (closeButton) {
                                closeIconPath.setAttribute('stroke', labelColor ?? "#ffffff");
                            }
                            if (closeButtonTimeout) {
                                closeButtonTimeout.style.color = labelColor ?? "#ffffff";
                            }

                            videoSpace.style.height = `${floatingPlayerHeight}px`;
                            videoSpace.style.width = `${floatingPlayerWidth}px`;
                            videoSpace.style.margin = 'auto';
                        }

                        if (aspectRatio === "16:9" && responsive) {
                            let height = mainwidth * 9 / 16;
                            let width = mainwidth;

                            let floatingPlayerHeight = floatingDivWidth * 9 / 16;
                            let floatingPlayerWidth = floatingDivWidth;

                            if (adsType === "outstream" && passbackDisplaying) {
                                height = height < passback?.passbackHeight ? passback?.passbackHeight : height;
                                width = width < passback?.passbackWidth ? passback?.passbackWidth : width;

                                floatingPlayerHeight = floatingPlayerHeight < passback?.passbackHeight ? passback?.passbackHeight : floatingPlayerHeight;
                                floatingPlayerWidth = floatingPlayerWidth < passback?.passbackWidth ? passback?.passbackWidth : floatingPlayerWidth;
                            }


                            floatingPlaceHolder.style.height = `${height + 20}px`;
                            floatingPlaceHolder.style.width = `${width}px`;

                            floatingDiv.style.height = 'auto';
                            floatingDiv.style.width = '100%';
                            floatingDiv.style.backgroundColor = backgroundColor;
                            advertisingBanner.style.color = labelColor ?? "#ffffff";
                            if (closeButton) {
                                closeIconPath.setAttribute('stroke', labelColor ?? "#ffffff");
                            }
                            if (closeButtonTimeout) {
                                closeButtonTimeout.style.color = labelColor ?? "#ffffff";
                            }

                            videoSpace.style.height = `${floatingPlayerHeight}px`;
                            videoSpace.style.width = `${floatingPlayerWidth}px`;
                            videoSpace.style.margin = 'auto';
                        }

                        if (aspectRatio === "4:3" && responsive) {
                            let height = mainwidth * 3 / 4;
                            let width = mainwidth;

                            let floatingPlayerHeight = floatingDivWidth * 3 / 4;
                            let floatingPlayerWidth = floatingDivWidth;

                            if (adsType === "outstream" && passbackDisplaying) {
                                height = height < passback?.passbackHeight ? passback?.passbackHeight : height;
                                width = width < passback?.passbackWidth ? passback?.passbackWidth : width;

                                floatingPlayerHeight = floatingPlayerHeight < passback?.passbackHeight ? passback?.passbackHeight : floatingPlayerHeight;
                                floatingPlayerWidth = floatingPlayerWidth < passback?.passbackWidth ? passback?.passbackWidth : floatingPlayerWidth;
                            }


                            floatingPlaceHolder.style.height = `${height + 20}px`;
                            floatingPlaceHolder.style.width = `${width}px`;

                            floatingDiv.style.height = 'auto';
                            floatingDiv.style.width = '100%';
                            floatingDiv.style.backgroundColor = backgroundColor;
                            advertisingBanner.style.color = labelColor ?? "#ffffff";
                            if (closeButton) {
                                closeIconPath.setAttribute('stroke', labelColor ?? "#ffffff");
                            }
                            if (closeButtonTimeout) {
                                closeButtonTimeout.style.color = labelColor ?? "#ffffff";
                            }

                            videoSpace.style.height = `${floatingPlayerHeight}px`;
                            videoSpace.style.width = `${floatingPlayerWidth}px`;
                            videoSpace.style.margin = 'auto';
                        }
                    } else {

                        if (!responsive) {

                            let height = mainwidth * 9 / 16;
                            let width = mainwidth;

                            let floatingPlayerHeight = floatingDivWidth * 9 / 16;
                            let floatingPlayerWidth = floatingDivWidth;

                            if (adsType === "outstream" && passbackDisplaying) {
                                height = height < passback?.passbackHeight ? passback?.passbackHeight : height;
                                width = width < passback?.passbackWidth ? passback?.passbackWidth : width;

                                floatingPlayerHeight = floatingPlayerHeight < passback?.passbackHeight ? passback?.passbackHeight : floatingPlayerHeight;
                                floatingPlayerWidth = floatingPlayerWidth < passback?.passbackWidth ? passback?.passbackWidth : floatingPlayerWidth;
                            }


                            floatingPlaceHolder.style.height = `${height + 20}px`;
                            floatingPlaceHolder.style.width = `${width}px`;

                            floatingDiv.style.height = `${floatingPlayerHeight + 20}px`;
                            floatingDiv.style.width = `${floatingPlayerWidth}px`;
                        }

                        if (aspectRatio === "16:9" && responsive) {
                            let height = mainwidth * 9 / 16;
                            let width = mainwidth;

                            let floatingPlayerHeight = floatingDivWidth * 9 / 16;
                            let floatingPlayerWidth = floatingDivWidth;

                            if (adsType === "outstream" && passbackDisplaying) {
                                height = height < passback?.passbackHeight ? passback?.passbackHeight : height;
                                width = width < passback?.passbackWidth ? passback?.passbackWidth : width;

                                floatingPlayerHeight = floatingPlayerHeight < passback?.passbackHeight ? passback?.passbackHeight : floatingPlayerHeight;
                                floatingPlayerWidth = floatingPlayerWidth < passback?.passbackWidth ? passback?.passbackWidth : floatingPlayerWidth;
                            }


                            floatingPlaceHolder.style.height = `${height + 20}px`;
                            floatingPlaceHolder.style.width = `${width}px`;

                            floatingDiv.style.height = `${floatingPlayerHeight + 20}px`;
                            floatingDiv.style.width = `${floatingPlayerWidth}px`;
                        }

                        if (aspectRatio === "4:3" && responsive) {
                            let height = mainwidth * 3 / 4;
                            let width = mainwidth;

                            let floatingPlayerHeight = floatingDivWidth * 3 / 4;
                            let floatingPlayerWidth = floatingDivWidth;

                            if (adsType === "outstream" && passbackDisplaying) {
                                height = height < passback?.passbackHeight ? passback?.passbackHeight : height;
                                width = width < passback?.passbackWidth ? passback?.passbackWidth : width;

                                floatingPlayerHeight = floatingPlayerHeight < passback?.passbackHeight ? passback?.passbackHeight : floatingPlayerHeight;
                                floatingPlayerWidth = floatingPlayerWidth < passback?.passbackWidth ? passback?.passbackWidth : floatingPlayerWidth;
                            }


                            floatingPlaceHolder.style.height = `${height + 20}px`;
                            floatingPlaceHolder.style.width = `${width}px`;

                            floatingDiv.style.height = `${floatingPlayerHeight + 20}px`;
                            floatingDiv.style.width = `${floatingPlayerWidth}px`;
                        }
                    }
                } else {
                    if (!responsive) {
                        let height = mainwidth * 9 / 16;
                        let width = mainwidth;

                        if (adsType === "outstream" && passbackDisplaying) {
                            height = height < passback?.passbackHeight ? passback?.passbackHeight : height;
                            width = width < passback?.passbackWidth ? passback?.passbackWidth : width;
                        }


                        floatingDiv.style.height = `${height + 20}px`;
                        floatingDiv.style.width = `${width}px`;
                        floatingDiv.style.backgroundColor = 'transparent';
                        advertisingBanner.style.color = 'black';
                        if (closeButton) {
                            closeIconPath.setAttribute('stroke', '#000000');
                        }
                        if (closeButtonTimeout) {
                            closeButtonTimeout.style.color = '#000000';
                        }

                        floatingPlaceHolder.style.height = "0px";
                        floatingPlaceHolder.style.width = "0px";

                        videoSpace.style.height = 'calc(100% - 20px)';
                        videoSpace.style.width = '100%';
                    }

                    if (aspectRatio === "16:9" && responsive) {

                        let height = mainwidth * 9 / 16;
                        let width = mainwidth;

                        if (adsType === "outstream" && passbackDisplaying) {
                            height = height < passback?.passbackHeight ? passback?.passbackHeight : height;
                            width = width < passback?.passbackWidth ? passback?.passbackWidth : width;
                        }

                        floatingDiv.style.height = `${height + 20}px`;
                        floatingDiv.style.width = `${width}px`;
                        floatingDiv.style.backgroundColor = 'transparent';
                        advertisingBanner.style.color = 'black';
                        if (closeButton) {
                            closeIconPath.setAttribute('stroke', '#000000');
                        }
                        if (closeButtonTimeout) {
                            closeButtonTimeout.style.color = '#000000';
                        }

                        floatingPlaceHolder.style.height = "0px";
                        floatingPlaceHolder.style.width = "0px";

                        videoSpace.style.height = 'calc(100% - 20px)';
                        videoSpace.style.width = '100%';
                    }

                    if (aspectRatio === "4:3" && responsive) {
                        let height = mainwidth * 3 / 4;
                        let width = mainwidth;

                        if (adsType === "outstream" && passbackDisplaying) {
                            height = height < passback?.passbackHeight ? passback?.passbackHeight : height;
                            width = width < passback?.passbackWidth ? passback?.passbackWidth : width;
                        }


                        floatingDiv.style.height = `${height + 20}px`;
                        floatingDiv.style.width = `${width}px`;
                        floatingDiv.style.backgroundColor = 'transparent';
                        advertisingBanner.style.color = 'black';
                        if (closeButton) {
                            closeIconPath.setAttribute('stroke', '#000000');
                        }
                        if (closeButtonTimeout) {
                            closeButtonTimeout.style.color = '#000000';
                        }

                        floatingPlaceHolder.style.height = "0px";
                        floatingPlaceHolder.style.width = "0px";

                        videoSpace.style.height = 'calc(100% - 20px)';
                        videoSpace.style.width = '100%';
                    }
                }
            }
        } catch (error) {
            (console.warn || console.log)(error);
        }
    }

    function resizeIframes() {
        try {
            const iframes = videoAdSlot.querySelectorAll('iframe');
            iframes.forEach((iframe) => {
                iframe.style.height = videoSpace.clientHeight + 'px';
                iframe.style.width = videoSpace.clientWidth + 'px';
            });
        } catch (error) {
            (console.warn || console.log)(error);
        }
    }

    function selectorTrack(encodedSelector, encodedURL) {
        try {
            const url = trackingDomain + "/track" + "/report" + "/selector-log" + "?tgid=" + scriptConfig?._id + "&selector=" + encodedSelector + "&pageUrl=" + encodedURL
            fetch(url, {
                method: 'GET'
            })
        } catch (error) {
            (console.warn || console.log)(error)
        }
    }

    async function verifyStringValue(encryptedText) {
        try {
            const key = "749cb05656666487fb12e0a7ec572e9716d85d151ba1225ed14bfb84c26753a0";
            // Decode the base64 encoded ciphertext
            const decodedText = decodeURIComponent(encryptedText);
            // Convert key to CryptoJS format
            const keyBytes = CryptoJS.enc.Hex.parse(key);
            // Initialization Vector (IV) - must be the same as used for encryption
            const iv = CryptoJS.enc.Hex.parse('00000000000000000000000000000000');
            // Decrypt
            const decrypted = CryptoJS.AES.decrypt(decodedText, keyBytes, { iv: iv, mode: CryptoJS.mode.CBC });
            // Convert the decrypted data back to UTF-8
            const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
            const data = JSON.parse(plaintext);

            if ("cpm" in data && "grossRate" in data && "priceException" in data && "fixCpm" in data && "cpmOrRevShare" in data && "revShare" in data && "exceptionCutModel" in data) {
                return encryptedText
            } else {
                return encodeURIComponent("+s9HmN7w9CMzlxLO/hNyHV4j3glmnf01DDv26uxjIWZIof53h1uZNoRJVD8L2RIOqFA6om9EMCswFVb6DLYm7hejQ4HnevCXT+yhPbGyj1f9NAgojYZjqoBYWY5mUU/nf8ANidxxCexQ/W5pQw3GqHFxWenKetZKPFpRiiGDxkmhPcyAgOs7xrGgSj7fQoGh");
            }

        } catch (error) {
            (console.warn || console.log)(error)
            return encodeURIComponent("+s9HmN7w9CMzlxLO/hNyHV4j3glmnf01DDv26uxjIWZIof53h1uZNoRJVD8L2RIOqFA6om9EMCswFVb6DLYm7hejQ4HnevCXT+yhPbGyj1f9NAgojYZjqoBYWY5mUU/nf8ANidxxCexQ/W5pQw3GqHFxWenKetZKPFpRiiGDxkmhPcyAgOs7xrGgSj7fQoGh");
        }
    }

    function shuffleVastTags(tags) {
        // change rpm value
        tags = tags.map(tag => {
            tag.rpm = tag.requestCount !== 0 || tag.impressionCount !== 0 || tag.grossRate !== 0 ? (tag.impressionCount / tag.requestCount) * tag.grossRate : 0;
            return tag;
        });

        // chnage order

        const sortedTags = tags.slice().sort((a, b) => {
            if (b.rpm === a.rpm) {
                if (b.priority === a.priority) {
                    return tags.indexOf(a) - tags.indexOf(b);
                }
                return b.priority - a.priority ? -1 : 1;
            }
            return b.rpm - a.rpm;
        });

        const groupedTags = sortedTags.reduce((acc, tag) => {
            const key = `${tag.rpm}-${tag.priority}`;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(tag);
            return acc;
        }, {});

        const shuffledTags = [];
        Object.values(groupedTags).forEach(group => {
            if (group.length > 1) {
            }
            shuffledTags.push(...group);
        });

        return shuffledTags;
    }

    function decrypt(encryptedText) {
        const key = "749cb05656666487fb12e0a7ec572e9716d85d151ba1225ed14bfb84c26753a0";

        // Decode the base64 encoded ciphertext
        const decodedText = decodeURIComponent(encryptedText);
        // Convert key to CryptoJS format
        const keyBytes = CryptoJS.enc.Hex.parse(key);
        // Initialization Vector (IV) - must be the same as used for encryption
        const iv = CryptoJS.enc.Hex.parse('00000000000000000000000000000000');
        // Decrypt
        const decrypted = CryptoJS.AES.decrypt(decodedText, keyBytes, { iv: iv, mode: CryptoJS.mode.CBC });
        // Convert the decrypted data back to UTF-8
        const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
        return JSON.parse(plaintext);
    }

    function track(data, event) {
        try {
            const url = trackingDomain + "/track" + "/report"
                + "?tgid=" + (scriptConfig?._id ?? "00000020f51bb4362eee2a4d")
                + "&asid=" + (data?.adsSourceID ?? "00000020f51bb4362eee2a4d")
                + "&pbid=" + (scriptConfig?.publisher ?? "00000020f51bb4362eee2a4d")
                + "&pnid=" + (data?.connectionID ?? "00000020f51bb4362eee2a4d")
                + "&pcid=" + (data?.publisherChannelID ?? "00000020f51bb4362eee2a4d")
                + "&chid=" + (data?.channelID ?? "00000020f51bb4362eee2a4d")
                + "&e=" + (event ?? "error")
                + "&stringValue=" + (data?.stringValue ?? encodeURIComponent("+s9HmN7w9CMzlxLO/hNyHV4j3glmnf01DDv26uxjIWZIof53h1uZNoRJVD8L2RIOqFA6om9EMCswFVb6DLYm7hejQ4HnevCXT+yhPbGyj1f9NAgojYZjqoBYWY5mUU/nf8ANidxxCexQ/W5pQw3GqHFxWenKetZKPFpRiiGDxkmhPcyAgOs7xrGgSj7fQoGh"))
                + "&avid=" + (data?.advertiserId ?? "00000020f51bb4362eee2a4d")
                + "&os=" + (userOS ?? 'Unknown')
                + "&country=" + (userIPData?.country ?? 'Unknown')
                + "&sd=" + (subDomain ?? 'Unknown')
                + "&d=" + (mainDomain ?? 'Unknown')
                + "&bw=" + (browser ?? 'Unknown')
                + "&city=" + (userIPData?.city ?? 'Unknown')
                + "&region=" + (userIPData?.regionName ?? 'Unknown');

            fetch(url, {
                method: 'GET'
            })
        } catch (error) {
            (console.warn || console.log)(error)

            const url = trackingDomain + "/track" + "/report"
                + "?tgid=" + (scriptConfig?._id ?? "00000020f51bb4362eee2a4d")
                + "&asid=" + (data?.adsSourceID ?? "00000020f51bb4362eee2a4d")
                + "&pbid=" + (scriptConfig?.publisher ?? "00000020f51bb4362eee2a4d")
                + "&pnid=" + (data?.connectionID ?? "00000020f51bb4362eee2a4d")
                + "&pcid=" + (data?.publisherChannelID ?? "00000020f51bb4362eee2a4d")
                + "&chid=" + (data?.channelID ?? "00000020f51bb4362eee2a4d")
                + "&e=" + (event ?? "error")
                + "&stringValue=" + (data?.stringValue ?? encodeURIComponent("+s9HmN7w9CMzlxLO/hNyHV4j3glmnf01DDv26uxjIWZIof53h1uZNoRJVD8L2RIOqFA6om9EMCswFVb6DLYm7hejQ4HnevCXT+yhPbGyj1f9NAgojYZjqoBYWY5mUU/nf8ANidxxCexQ/W5pQw3GqHFxWenKetZKPFpRiiGDxkmhPcyAgOs7xrGgSj7fQoGh"))
                + "&avid=" + (data?.advertiserId ?? "00000020f51bb4362eee2a4d")
                + "&os=" + (userOS ?? 'Unknown')
                + "&country=" + (userIPData?.country ?? 'Unknown')
                + "&sd=" + (subDomain ?? 'Unknown')
                + "&d=" + (mainDomain ?? 'Unknown')
                + "&bw=" + (browser ?? 'Unknown')
                + "&city=" + (userIPData?.city ?? 'Unknown')
                + "&region=" + (userIPData?.regionName ?? 'Unknown');

            try {
                fetch(url, {
                    method: 'GET'
                })
            } catch (error) {
                (console.warn || console.log)(error)
            }
        }
    }

    async function addPlayerToSelector() {
        try {

            let playerAdded = false;
            let parentDiv;

            if (currentUrl !== mainDomainHost || domainPlayerDisplay) {
                if (selectors?.length > 0) {
                    for (const item of selectors) {
                        const targetElement = doc.querySelector(item);
                        if (targetElement) {
                            if (placeAdjacent) {
                                if (placeAfter) {
                                    targetElement.insertAdjacentElement('afterend', mainWrapper);
                                } else {
                                    targetElement.insertAdjacentElement('beforebegin', mainWrapper);
                                }
                            } else {
                                if (placeAfter) {
                                    targetElement.appendChild(mainWrapper);
                                } else {
                                    targetElement.prepend(mainWrapper);
                                }
                            }
                            playerAdded = true;
                            return true;
                        }
                    }
                }
            } else {
                (console.warn || console.log)('Current URL is same as main domain');
                return false;
            }

            if (dfp) {
                parentDiv = win?.playstream?.dfp?.parentDiv;
            }

            if (!playerAdded && !doc.getElementById("playstream-main-wrapper")) {
                if (!selectors || (selectors?.length <= 0 && !dfp)) {
                    const withoutSelector = doc.getElementById(`PS_${scriptConfig?._id}`);
                    if (withoutSelector && (currentUrl !== mainDomainHost || domainPlayerDisplay)) {
                        if (withoutSelector.parentElement.tagName.toLowerCase() === 'head') {
                            doc.body.insertBefore(mainWrapper, doc.body.firstChild);
                        } else {
                            withoutSelector.parentElement.appendChild(mainWrapper);
                        }
                        playerAdded = true;
                        return true;
                    } else {
                        if (currentUrl === mainDomainHost && !domainPlayerDisplay) {
                            (console.warn || console.log)("Player called in homepage");
                            return false;
                        }

                        let encodedSelector = encodeURIComponent("null");
                        let encodedURL = encodeURIComponent(win.location.href);
                        selectorTrack(encodedSelector, encodedURL);
                        (console.warn || console.log)("Selector is Wrong, Player is not inserted, Please check the selector and try again.");
                        return false;
                    }
                } else if (!playerAdded && !doc.getElementById("playstream-main-wrapper") && dfp && parentDiv && (!selectors || selectors.length <= 0)) {
                    if (currentUrl !== mainDomainHost || domainPlayerDisplay) {
                        parentDiv.parentElement.appendChild(mainWrapper);
                        playerAdded = true;
                        return true;
                    } else {
                        (console.log || console.log)("Player called in homepage");
                        return false;
                    }
                } else {
                    let encodedSelector = encodeURIComponent("null");
                    let encodedURL = encodeURIComponent(win.location.href);

                    selectorTrack(encodedSelector, encodedURL);
                    (console.warn || console.log)("Selector is Wrong, Player is not inserted, Please check the selector and try again.");
                    return false;
                }
            }

            if (playerAdded && doc.getElementById()) {
                return true;
            } else {
                return false;
            }

        } catch (error) {
            (console.warn || console.log)(error);
            return false;
        }
    }

    function isMobileUserAgent() {
        try {
            const userAgent = navigator.userAgent.toLowerCase();
            const mobileKeywords = ['Mobile', 'iPhone', 'Android', 'Windows Phone', 'BlackBerry'];
            return mobileKeywords.some(keyword => userAgent.includes(keyword.toLowerCase()));
        } catch (error) {
            (console.warn || console.log)(error);
            return false;
        }
    }

    function userOSChecker(osList) {
        try {
            const userAgent = navigator.userAgent.toLowerCase();

            const agentInfo = {
                IOS: /(ipad|iphone|ipod|ios)/.test(userAgent),
                Macbook: /macintosh/.test(userAgent),
                Android: /android/.test(userAgent),
                Windows: /windows/.test(userAgent) && !/windows phone/.test(userAgent),
                WindowsPhone: /windows phone/.test(userAgent),
                Blackberry: /blackberry/.test(userAgent),
                Roku: /roku/.test(userAgent),
                AppleTV: /apple tv/.test(userAgent),
                Linux: /linux/.test(userAgent) && !/android/.test(userAgent),
                Ipad: /macintosh/.test(userAgent),
            };

            return osList.some(os => agentInfo[`${os}`]);
        } catch (error) {
            (console.warn || console.log)(error);
            return false;
        }
    }

    function osCheck(flag, data) {
        try {
            if (data?.length > 0) {
                return flag && userOSChecker(data) || !flag && !userOSChecker(data)
            } else {
                return true;
            }
        } catch (error) {
            (console.warn || console.log)(error);
            return true;
        }
    }

    function userIPLocationChecker(countryList, userCountry) {
        try {
            return countryList?.includes(userCountry);
        } catch (error) {
            (console.warn || console.log)(error);
            return false;
        }
    }

    function ipCheck(flag, data, ipConfig) {
        try {
            if (data?.length > 0) {
                return flag && userIPLocationChecker(data, ipConfig) || !flag && !userIPLocationChecker(data, ipConfig)
            } else {
                return true;
            }
        } catch (error) {
            (console.warn || console.log)(error);
            return true;
        }
    }

    const userDeviceChecker = (devicesList) => {
        try {
            return devicesList?.includes(getUserDevice());
        } catch (error) {
            (console.warn || console.log)(error);
            return false;
        }
    };

    function deviceCheck(flag, data) {
        try {
            if (data?.length > 0) {
                return flag && userDeviceChecker(data) || !flag && !userDeviceChecker(data)
            } else {
                return true;
            }
        } catch (error) {
            (console.warn || console.log)(error);
            return true;
        }

    }

    async function extractFields(data, publisherChannelId) {
        try {
            const transformed = [];

            for (const connectionId in data[0]) {

                const pubChannelTaergeting = data[0][connectionId]?.targetingData;

                const pubOsFlag = pubChannelTaergeting?.osData?.flag
                const pubOsData = pubChannelTaergeting?.osData?.data
                const pubOsTarget = osCheck(pubOsFlag, pubOsData);

                const pubCountryFlag = pubChannelTaergeting?.countryData?.flag
                const pubCountryData = pubChannelTaergeting?.countryData?.data[0]
                const pubStateData = pubChannelTaergeting?.countryData?.data[1]
                const pubCityData = pubChannelTaergeting?.countryData?.data[2]
                const pubCountryTarget = ipCheck(pubCountryFlag, pubCountryData ? pubCountryData : [], userIPData?.country);
                const pubStateTarget = ipCheck(pubCountryFlag, pubStateData ? pubStateData : [], userIPData?.regionName);
                const pubCityTarget = ipCheck(pubCountryFlag, pubCityData ? pubCityData : [], userIPData?.city);

                const pubDeviceFlag = pubChannelTaergeting?.deviceTypeData.flag
                const pubDeviceData = pubChannelTaergeting?.deviceTypeData.data
                const pubDeviceTarget = deviceCheck(pubDeviceFlag, pubDeviceData)


                if (pubOsTarget && pubDeviceTarget && pubCountryTarget && pubStateTarget && pubCityTarget) {
                    const adSources = data[0][connectionId];
                    const sellerId = adSources?.sellerId;
                    for (const adSourceId in adSources) {
                        if (adSourceId === "sellerId" || adSourceId === "targetingData") continue;
                        const adSource = adSources[adSourceId];
                        if (
                            (pubOsTarget && osCheck(adSource?.osData?.flag, adSource?.osData?.data)) &&
                            (pubCountryTarget && ipCheck(adSource?.countryData?.flag, adSource?.countryData?.data[0] ? adSource?.countryData?.data[0] : [], userIPData?.country)) &&
                            (pubStateTarget && ipCheck(adSource?.countryData?.flag, adSource?.countryData?.data[1] ? adSource?.countryData?.data[1] : [], userIPData?.regionName)) &&
                            (pubCityTarget && ipCheck(adSource?.countryData?.flag, adSource?.countryData?.data[2] ? adSource?.countryData?.data[2] : [], userIPData?.city)) &&
                            (pubDeviceTarget && deviceCheck(adSource?.deviceTypeData?.flag, adSource?.deviceTypeData?.data))
                        ) {
                            if (adSource?.active) {
                                const data = {
                                    vastTag: adSource?.vastTag,
                                    publisherChannelID: publisherChannelId,
                                    connectionID: connectionId?.split('|')[0],
                                    channelID: connectionId?.split('|')[1],
                                    adsSourceID: adSourceId,
                                    stringValue: await verifyStringValue(adSource?.stringValue),
                                    advertiserId: adSource?.advertiserId,
                                    capping: adSource?.capping ?? false,
                                    tracking: adSource?.trackingData?.flag ?? false,
                                    trackingUrl: adSource?.trackingData?.data?.trackerUrl ?? null,
                                    trackingEvent: adSource?.trackingData?.data?.event ?? null,
                                    trackingFrequency: parseInt(adSource?.trackingData?.data?.callingPercentage ?? "0"),
                                    provider: adSource?.provider,
                                    slotId: adSource?.slotId,
                                    impressionCount: 0,
                                    requestCount: 0,
                                    rpm: 0,
                                    grossRate: decrypt(adSource?.stringValue).grossRate ?? 0,
                                    minCpm: adSource?.minCpm ?? 0.01,
                                    ...(adSource?.provider === 'openRTB ' && {
                                        protocolversion: adSource?.protocolversion,
                                        timeout: adSource?.timeout,
                                        auctiontype: adSource?.auctiontype,
                                        placement: adSource?.placement,
                                        interstitial: adSource?.interstitial,
                                        playbackmethod: adSource?.playbackmethod,
                                        maxbitrate: adSource?.maxbitrate,
                                        maxduration: adSource?.maxduration,
                                        minduration: adSource?.minduration,
                                        openpublisherid: adSource?.openpublisherid,
                                        siteid: adSource?.siteid,
                                        tagid: adSource?.tagid,
                                        appsitetitle: adSource?.appsitetitle,
                                        mimetype: adSource?.mimetype,
                                        api: adSource?.api,
                                        protocols: adSource?.protocols,
                                        test: adSource?.test,
                                        skippable: adSource?.skippable,
                                        dnt: adSource?.dnt,
                                    }),
                                };
                                if (sellerId) {
                                    data.sellerId = sellerId;
                                }
                                transformed.push(data);
                            }
                        }
                    }
                }
            }

            return transformed;
        } catch (error) {
            (console.warn || console.log)(error);
            return [];
        }
    };

    function adAddedQueueFunction() {
        try {
            if (!adPlaying && adQueue.length > 0 && adRequestAllowed) {
                const adId = adQueue[0];
                const adIframeWindow = videoAdSlot.querySelector(`iframe#${adId}`)?.contentWindow;
                adIframeWindow.postMessage({ type: 'ad-play', fullscreen: fullscreen, sound: sound }, '*');
            }
        } catch (error) {
            (console.warn || console.log)(error);
        }
    }

    async function adIframeWindow() {
        try {
            const dummyHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Document</title>
            </head>
            <body>
                <script>${iframeScript}</script>
            </body>
            </html>
            `

            adIframe = doc.createElement('iframe');
            adIframe.srcdoc = dummyHtml;
            adIframe.style.height = ``;
            adIframe.style.width = ``;
            adIframe.style.position = 'absolute';
            adIframe.style.top = '0';
            adIframe.style.left = '0';
            adIframe.scrolling = 'no';
            adIframe.style.border = 'none';

            adIframe.onload = function () {
                resizeContainer()
            }
            return true;
        } catch (error) {
            (console.warn || console.log)(error);
            return false;
        }
    }

    async function apsTagIframeLoader() {
        try {
            return new Promise((resolve, reject) => {
                // Create an iframe
                const iframeHTML = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Nested Iframe</title>
                    <script>
                        let apstagInitialized = false;
    
                        function init({pubID, adServer, videoAdServer, sellerId}) {
                            if (!apstagInitialized) {
                                (function (a9, a, p, s, t, A, g) {
                                    if (a[a9]) return;
                                    function q(c, r) {
                                        a[a9]._Q.push([c, r]);
                                    }
                                    a[a9] = {
                                        init: function () {
                                            q("i", arguments);
                                        },
                                        fetchBids: function () {
                                            q("f", arguments);
                                        },
                                        setDisplayBids: function () {},
                                        targetingKeys: function () {
                                            return [];
                                        },
                                        _Q: [],
                                    };
                                    A = p.createElement(s);
                                    A.async = !0;
                                    A.src = t;
                                    g = p.getElementsByTagName(s)[0];
                                    g.parentNode.insertBefore(A, g);
                                })(
                                    "apstag",
                                    window,
                                    document,
                                    "script",
                                    "//c.amazon-adsystem.com/aax2/apstag.js"
                                );
    
                                const initConfig = {
                                    pubID: pubID,
                                    videoAdServer: videoAdServer,
                                    adServer: adServer
                                };
    
                                if (sellerId) {
                                    initConfig.schain = {
                                        complete: 1,
                                        ver: '1.0',
                                        nodes: [
                                            {
                                                asi: 'playstream.media',
                                                sid: \`\${sellerId}\`,
                                                hp: 1,
                                            }
                                        ]
                                    };
                                }
    
                                apstag.init(initConfig);
                                apstagInitialized = true;
                            }
                        }
    
                        function fetchBids({slotID, mediaType, sizes, handleBidResponse, minCpm}) {
                            if (apstagInitialized) {
                                apstag.fetchBids(
                                    {
                                        slots: [
                                            {
                                                slotID: slotID,
                                                mediaType: mediaType,
                                                floor: {
                                                    currency: 'USD',
                                                    value: minCpm * 100,
                                                },
                                            },
                                        ],
                                        timeout: 2500
                                    },
                                    function (bids) {
                                        handleBidResponse(bids);
                                    }
                                );
                            } else {
                                console.error("apstag not initialized");
                            }
                        }
                    </script>
                    </head>
                    <body>
                    </body>
                    </html>
                `;

                const iframe = doc.createElement('iframe');
                // iframe.style.display = "none";
                iframe.style.visibility = "hidden";
                iframe.width = win.innerWidth + "px";
                iframe.height = win.innerHeight + "px";
                iframe.style.position = "absolute";
                iframe.frameBorder = "0";
                iframe.srcdoc = iframeHTML;

                adContainer.appendChild(iframe);

                // Access the iframe's window object once it's loaded
                iframe.onload = function () {
                    var iframeWindow = iframe.contentWindow;
                    resolve(iframeWindow);
                };

                iframe.onerror = function () {
                    reject(new Error('Failed to load iframe'));
                };
            });
        } catch (error) {
            (console.warn || console.log)(error);
        }
    }

    const checkIfInView = () => {
        const rect = mainWrapper.getBoundingClientRect();
        const windowHeight = (win.innerHeight || doc.documentElement.clientHeight);
        const windowWidth = (win.innerWidth || doc.documentElement.clientWidth);

        const inView = (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= windowHeight &&
            rect.right <= windowWidth
        );

        if (inView) {
            playerInView = true;
            playerInitiallyView = true;
        }
    };

    async function preRunFunction() {
        try {
            if (isMobileUser && scriptConfig?.flagMobileSettings) {
                tagsArray = await extractFields(Object.values(vastTags?.mobile), Object.keys(vastTags?.mobile)[0], userIPData);
                selectors = scriptConfig?.mobile?.selectorArray;
                placeAfter = scriptConfig?.mobile?.placeAfter;
                placeAdjacent = scriptConfig?.mobile?.placeAdjacent;
                templateData = Object.values(videoPlayerData?.mobile)[0];
                dfp = scriptConfig?.mobile?.mobileDFP;
                domainPlayerDisplay = scriptConfig?.mobile?.domainPlayerDisplay;
            } else {
                tagsArray = await extractFields(Object.values(vastTags?.desktop), Object.keys(vastTags?.desktop)[0], userIPData);
                selectors = scriptConfig.desktop?.selectorArray;
                placeAfter = scriptConfig.desktop?.placeAfter;
                placeAdjacent = scriptConfig.desktop?.placeAdjacent;
                templateData = Object.values(videoPlayerData?.desktop)[0];
                dfp = scriptConfig?.desktop?.desktopDFP;
                domainPlayerDisplay = scriptConfig?.desktop?.domainPlayerDisplay;
            }

            sellerId = tagsArray.find(obj => obj.sellerId !== undefined)?.sellerId;

            maxRequests = tagsArray?.length >= 5 ? 5 : tagsArray?.length;

            adQueueProxy = new Proxy(adQueue, {
                set(target, property, value) {
                    target[property] = value;
                    if (!isNaN(property) && !adQueueProxy._isRemoving) {
                        adAddedQueueFunction();
                    }
                    return true;
                }
            });

            adQueueProxy.pop = function (value) {
                const index = adQueue.indexOf(value);
                if (index !== -1) {
                    adQueueProxy._isRemoving = true;
                    this.splice(index, 1);
                    adQueueProxy._isRemoving = false;
                } else {
                    (console.warn || console.log)("Item not found in the queue");
                }
            };

            returnUserOS();
            setBrowserInfo();
            domainSubDomainCheck();
            checkAutoplayWithSound();

            return true;
        } catch (error) {
            (console.warn || console.log)(error);
            return false;
        }
    }

    function navigateToLink() {
        try {
            const { clickThroughUrl } = templateData
            if (clickThroughUrl) {
                win.open(clickThroughUrl, "_blank");
            }
        } catch (error) {
            (console.warn || console.log)(error);
        }
    }

    function closePlayerFunction() {
        try {

            const { positioning, floatOnAd } = templateData

            if (floatingDiv.classList.contains("playstream-is-sticky")) {
                if (positioning === "floating") {
                    floatingAllowed = false;

                    const classes = floatingClassName.split(" ");
                    floatingDiv.classList.remove(...classes);

                    resizeContainer();
                    resizeIframes();
                    floatingMargin();
                }

                if (positioning === "inRead" && floatOnAd) {
                    floatingAllowed = false;

                    const classes = floatingClassName.split(" ");
                    floatingDiv.classList.remove(...classes);

                    resizeContainer();
                    resizeIframes();
                    floatingMargin();
                }

                if (positioning === "sticky") {
                    mainWrapper.parentNode.removeChild(mainWrapper);
                }

            } else {
                mainWrapper.parentNode.removeChild(mainWrapper);
            }
        } catch (error) {
            (console.warn || console.log)(error);
        }
    }

    function floatingMargin() {
        try {
            const { position, marginTop, marginBottom, marginLeft, marginRight } = templateData;
            if (floatingDiv.classList.contains("playstream-is-sticky")) {
                switch (position) {
                    case "right-top":
                        floatingDiv.style.marginTop = `${marginTop}px`;
                        floatingDiv.style.marginRight = `${marginRight}px`;
                        break;
                    case "right-bottom":
                        floatingDiv.style.marginBottom = `${marginBottom}px`;
                        floatingDiv.style.marginRight = `${marginRight}px`;
                        break;
                    case "left-top":
                        floatingDiv.style.marginTop = `${marginTop}px`;
                        floatingDiv.style.marginLeft = `${marginLeft}px`;
                        break;
                    case "left-bottom":
                        floatingDiv.style.marginBottom = `${marginBottom}px`;
                        floatingDiv.style.marginLeft = `${marginLeft}px`;
                        break;
                    case "top":
                        floatingDiv.style.marginTop = `${marginTop}px`;
                        break;
                    case "bottom":
                        floatingDiv.style.marginBottom = `${marginBottom}px`;
                        break;
                    default:
                        break;
                }
            } else {
                floatingDiv.style.margin = "0";
            }
        } catch (error) {
            (console.warn || console.log)(error);
        }
    }

    function replaceVastTagParams(url) {
        try {
            const urlObj = new URL(url);

            if (urlObj.searchParams.has('vpmute')) {
                if (sound) {
                    urlObj.searchParams.set('vpmute', '0');
                } else {
                    urlObj.searchParams.set('vpmute', '1');
                }
            } else {
                if (sound) {
                    urlObj.searchParams.set('vpmute', '0');
                } else {
                    urlObj.searchParams.set('vpmute', '1');
                }
            }

            if (urlObj.searchParams.has('plcmt')) {
                if (sound) {
                    urlObj.searchParams.set('plcmt', '1');
                } else {
                    urlObj.searchParams.set('plcmt', '2');
                }
            } else {
                if (sound) {
                    urlObj.searchParams.set('plcmt', '1');
                } else {
                    urlObj.searchParams.set('plcmt', '2');
                }
            }
            return urlObj.toString();
        } catch (error) {
            (console.warn || console.log)(error);
            return url;
        }
    }

    function generateMacroString(currentVastTag) {
        try {
            currentVastTag = currentVastTag.replace('PS_RANDOM_NO', Math.floor(Math.random() * (Date.now() * Math.random())));
            currentVastTag = currentVastTag.replace('PS_HEIGHT', floatingDiv.clientHeight);
            currentVastTag = currentVastTag.replace('PS_WIDTH', floatingDiv.clientWidth);
            currentVastTag = currentVastTag.replace('PS_SITE_URL', win.location.href);
            return currentVastTag;
        } catch (error) {
            (console.warn || console.log)(error);
        }
    }

    function trackingAllowed(trackingFrequency) {
        try {
            let randomNumber = Math.floor(Math.random() * 101);
            if (randomNumber <= trackingFrequency) {
                return true;
            }
            return false;
        } catch (error) {
            (console.warn || console.log)(error);
        }
    }

    async function loadScript(url) {
        try {
            return new Promise((resolve, reject) => {
                const script = doc.createElement('script');
                script.src = url;
                script.onload = resolve;
                script.onerror = reject;
                doc.head.appendChild(script);
            });
        } catch (error) {
            (console.warn || console.log)(error);
        }
    }

    function refreshGPTBanner() {
        try {
            googletag.cmd.push(function () {
                const slot = googletag.pubads().getSlots().find(slot => slot.getSlotElementId() === 'playstream-gpt-passback');
                if (slot) {
                    googletag.pubads().refresh([slot]);
                }
            });
        } catch (error) {
            (console.warn || console.log)(error);
        }
    }

    async function loadGPTBanner(slotPath) {
        const { passback, playerMarginTop, playerMarginBottom } = templateData;
        try {
            win.googletag = win.googletag || { cmd: [] };

            googletag.cmd.push(function () {
                googletag.defineSlot(`${slotPath}`, [300, 250], 'playstream-gpt-passback').addService(googletag.pubads());
                googletag.enableServices();
                googletag.display('playstream-gpt-passback');


                googletag.pubads().addEventListener('slotRenderEnded', function (event) {
                    try {
                        if (event.slot.getSlotElementId() === 'playstream-gpt-passback') {
                            passbackDisplaying = true;

                            videoWrapper.style.display = 'block';
                            adContainer.style.visibility = 'visible';
                            passbackContainer.style.visibility = 'visible';

                            resizeContainer();
                            resizeIframes();
                            mainWrapper.style.marginTop = playerMarginTop + 'px';
                            mainWrapper.style.marginBottom = playerMarginBottom + 'px';

                        }
                    } catch (error) {
                        (console.warn || console.log)(error);
                    }
                });

                if (passback?.refreshPassback) {
                    passbackInterval = setInterval(() => {
                        refreshGPTBanner();
                    }, passback?.refreshTime * 1000);
                }

            })

        } catch (error) {
            (console.warn || console.log)(error);
        }
    }

    async function showGPTPassback() {
        const { passback } = templateData;
        try {
            if (passbackContainer && passbackDiv) {
                if (passbackDisplaying) {
                    return;
                }

                refreshGPTBanner();

                if (passback?.refreshPassback && !passbackInterval) {
                    passbackInterval = setInterval(() => {
                        refreshGPTBanner();
                    }, passback?.refreshTime * 1000);
                }

                return;
            }

            let passbackResponse;

            if (passback?.passbackUrlorTag === "url") {
                passbackResponse = await (await fetch(passback?.passbackUrl)).text();
            }
            if (passback?.passbackUrlorTag === "tag") {
                passbackResponse = passback?.passbackTag;
            }

            if (!passbackResponse) {
                (console.warn || console.log)("passback data not found")
                return;
            }

            const slotPathRegex = /googletag\.defineSlot\('([^']+)'/;
            const slotPathMatch = passbackResponse?.match(slotPathRegex);
            const slotPath = slotPathMatch ? slotPathMatch[1] : null;

            if (!slotPath) {
                (console.warn || console.log)('slot path not found');
                return;
            }

            await loadScript('https://securepubads.g.doubleclick.net/tag/js/gpt.js');

            passbackDiv = doc.createElement('div');
            passbackDiv.id = 'playstream-gpt-passback';
            passbackDiv.style.width = passback?.passbackWidth + 'px';
            passbackDiv.style.height = passback?.passbackHeight + 'px';

            passbackContainer.appendChild(passbackDiv);

            loadGPTBanner(slotPath);

        } catch (error) {
            (console.warn || console.log)(error);
        }
    }

    async function clearGPTPassback() {
        try {
            passbackDisplaying = false;

            if (passbackInterval) {
                clearInterval(passbackInterval);
                passbackInterval = null;
            }

            videoWrapper.style.display = 'none';
            passbackContainer.style.visibility = 'hidden';
            adContainer.style.visibility = 'hidden';

            resizeContainer();
            resizeIframes();

            mainWrapper.style.marginTop = '0px';
            mainWrapper.style.marginBottom = '0px';

            googletag.cmd.push(function () {
                const slot = googletag.pubads().getSlots().find(slot => slot.getSlotElementId() === 'playstream-gpt-passback');
                if (slot) {
                    googletag.pubads().clear([slot]);
                }
            });
        } catch (error) {
            (console.error || console.log)(error);
        }
    }

    async function refreshOtherPassback() {
        try {
            passbackDiv.srcdoc = passbackDiv.srcdoc;

            if (passbackDisplaying) {
                return;
            }

            passbackDisplaying = true;

            videoWrapper.style.display = 'block';
            adContainer.style.visibility = 'visible';
            passbackContainer.style.visibility = 'visible';

            resizeContainer();
            resizeIframes();
            mainWrapper.style.marginTop = playerMarginTop + 'px';
            mainWrapper.style.marginBottom = playerMarginBottom + 'px';

        } catch (error) {
            (console.warn || console.log)(error);
        }
    }

    async function showOtherPassback() {
        const { passback, playerMarginTop, playerMarginBottom } = templateData;
        try {
            if (passbackContainer && passbackDiv) {
                if (passbackDisplaying) {
                    return;
                }

                refreshOtherPassback();

                if (passback?.refreshPassback && !passbackInterval) {
                    passbackInterval = setInterval(() => {
                        refreshOtherPassback();
                    }, passback?.refreshTime * 1000);
                }

                return;
            }

            let passbackResponse;

            if (passback?.passbackUrlorTag === "url") {
                passbackResponse = await (await fetch(passback?.passbackUrl)).text();
            }
            if (passback?.passbackUrlorTag === "tag") {
                passbackResponse = passback?.passbackTag;
            }

            if (!passbackResponse) {
                (console.warn || console.log)("passback data not found")
                return;
            }

            const dummyHtml = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Document</title>
                </head>
                <body style="margin: 0; padding: 0;">
                    ${passbackResponse}
                </body>
                </html>
            `

            passbackDiv = doc.createElement('iframe');
            passbackDiv.id = 'playstream-other-passback';
            passbackDiv.style.width = passback?.passbackWidth + 'px';
            passbackDiv.style.height = passback?.passbackHeight + 'px';
            passbackDiv.style.border = 'none';
            passbackDiv.srcdoc = dummyHtml;
            passbackDiv.style.overflow = 'hidden';
            passbackDiv.scrolling = 'no';

            passbackContainer.appendChild(passbackDiv);

            passbackDisplaying = true;

            videoWrapper.style.display = 'block';
            adContainer.style.visibility = 'visible';
            passbackContainer.style.visibility = 'visible';

            resizeContainer();
            resizeIframes();
            mainWrapper.style.marginTop = playerMarginTop + 'px';
            mainWrapper.style.marginBottom = playerMarginBottom + 'px';

            if (passback?.refreshPassback) {
                passbackInterval = setInterval(() => {
                    refreshOtherPassback();
                }, passback?.refreshTime * 1000);
            }

        } catch (error) {
            (console.warn || console.log)(error);
        }
    }

    async function clearOtherPassback() {
        try {
            passbackDisplaying = false;

            if (passbackInterval) {
                clearInterval(passbackInterval);
                passbackInterval = null;
            }

            videoWrapper.style.display = 'none';
            passbackContainer.style.visibility = 'hidden';
            adContainer.style.visibility = 'hidden';

            resizeContainer();
            resizeIframes();

            mainWrapper.style.marginTop = '0px';
            mainWrapper.style.marginBottom = '0px';
        } catch (error) {
            (console.error || console.log)(error);
        }
    }

    function getMainImage() {
        // Helper function to check and return valid URLs
        function isValidUrl(url) {
            return url && (url.startsWith('http://') || url.startsWith('https://'));
        }

        // Check for meta tags (Open Graph and Twitter Card)
        function getMetaImage() {
            const ogImage = doc.querySelector('meta[property="og:image"]');
            const twitterImage = doc.querySelector('meta[name="twitter:image"]');
            if (ogImage && isValidUrl(ogImage.content)) return ogImage.content;
            if (twitterImage && isValidUrl(twitterImage.content)) return twitterImage.content;
            return null;
        }

        // Check for the first prominent image inside article or content sections
        function getArticleImage() {
            const article = doc.querySelector('article') || doc.querySelector('.main-content');
            if (!article) return null;

            const images = article.querySelectorAll('img');
            if (images.length > 0) {
                const img = images[0];
                return getLazyLoadedImage(img);
            }
            return null;
        }

        // Check for lazy-loaded images
        function getLazyLoadedImage(imgElement) {
            return imgElement.dataset.src || imgElement.dataset.lazySrc || imgElement.src;
        }

        // Website-specific selectors (optional, add as needed)
        function getCustomImage() {
            const customSelectors = ['.featured-image img', '.post-thumbnail img'];
            for (const selector of customSelectors) {
                const img = doc.querySelector(selector);
                if (img) return getLazyLoadedImage(img);
            }
            return null;
        }

        // Try each method in order of priority
        const metaImage = getMetaImage();
        if (metaImage) return metaImage;

        const articleImage = getArticleImage();
        if (articleImage) return articleImage;

        const customImage = getCustomImage();
        if (customImage) return customImage;

        return null; // No image found
    }
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16).toUpperCase();
        });
    }

    function generateCustomID() {
        function randomDigits(length) {
            let digits = '';
            for (let i = 0; i < length; i++) {
                digits += Math.floor(Math.random() * 10);  // Random digit between 0-9
            }
            return digits;
        }

        const part1 = randomDigits(13);  // 13 digits
        const part2 = randomDigits(12);  // 12 digits
        const part3 = randomDigits(6);   // 6 digits
        const part4 = randomDigits(3);   // 3 digits
        const part5 = randomDigits(6);   // 6 digits

        return `${part1}-${part2}-${part3}-${part4}-${part5}`;
    }

    function generateComplexID() {
        // Helper function to generate a random alphanumeric string of given length
        function randomAlphanumeric(length) {
            const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';
            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * characters.length);
                result += characters[randomIndex];
            }
            return result;
        }

        // Generate first part: 32 characters hex string
        const part1 = (Math.random().toString(16) + '0000000000000000').substring(2, 34);

        // Generate second part: alphanumeric string
        const part2 = randomAlphanumeric(25); // Adjust length as needed

        // Return the final ID format
        return `${part1}_${part2}`;
    }
    async function openRTB_Vast(sampledata, vastTag, version) {

        try {
            const data = await fetch(vastTag, {
                method: 'POST',
                body: JSON.stringify(sampledata),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Encoding': 'gzip',
                    'Content-Encoding': 'gzip',
                    'x-openrtb-version': version ?? "2.5"
                }
            });

            if (data?.status !== 200) {
                return {
                    status: "no-ad",
                    message: "No ad available",
                    vastResponse: null,
                    display: false,
                    price: null,
                };
            }

            const response = await data.json();

            const vastString = response?.seatbid?.[0]?.bid?.[0]?.adm;
            const price = response?.seatbid?.[0]?.bid?.[0]?.price;

            return {
                status: "ad",
                message: "Ad available",
                vastResponse: vastString,
                display: true,
                price,
            };
        } catch (error) {
            console.log(error);
            return {
                status: "no-ad",
                message: "An error occurred",
                vastResponse: null,
                display: false,
                price: null,
            };
        }
    }

    async function openRTB_2_5(vastTag, data) {
        console.log(JSON.stringify(data, null, 2));

        try {

            const id = `${generateComplexID()}_${data?.adssourceId}`;
            const timeoutmax = data?.timeout ?? 5000;
            const auctiontype = data?.auctiontype ?? 2; // Auction Type: 1 for First Price Auction, 2 for Second Price Auction
            const test = data?.test ?? 1; // Indicates whether the request is a test. Values: 1 = test, 0 = live

            // source
            const firstParty = 0; // Indicates whether the request is first-party (1) or from a reseller (0).
            const tid = `t_${id}`; // Transaction ID (Unique ID for the request)

            // regs
            const gdpr = 0; // Signals whether the request is subject to the General Data Protection Regulation (GDPR). Values: 1 = GDPR applies, 0 = GDPR does not apply. Optional in OpenRTB.
            const coppa = 0; // Indicates whether the request complies with the Children’s Online Privacy Protection Act (COPPA). Values: 1 = COPPA applies, 0 = COPPA does not apply.
            const us_privacy = "1---"; // CCPA (US Privacy String)
            const tcf_version = 2; // Transparency & Consent Framework version

            // ext
            const gpid = `/${data?.publisherId}/${data?.playertagId}/${data?.domainname}`; // /organizationId/tagId/websitedomain
            const ssl = 1; // from HTTPS - 1, from HTTP - 0
            const ip = data?.ip // User IP Address

            // site
            const domain = data?.domainname ?? ""; // Domain of the website
            const page = data?.href ?? ""; // URL of the page where the ad will be displayed
            const publisherName = data?.domainname ?? ""; // Name of the publisher
            const publisherSiteId = data?.openpublisherid ?? "162175"; // From dashboard
            const ref = data?.domainurl ?? ""; // Referrer URL
            const siteId = data?.siteid ?? "1121005"; // From dashboard

            // user
            const userbuyerid = generateUUID(); // Unique ID of the user
            const userid = data?.userid; // Custom ID of the user

            // device
            const deviceMake = data?.manufacturer ?? "Google"; // Device Manufacturer (from which browser it is requested)
            const devicePpi = 45; // Pixels per inch of the device`
            const devicePxratio = 1; // The ratio of physical pixels to device independent pixels.
            const deviceJs = 1; // Support for JavaScript, where 0 = no, 1 = yes
            const deviceConnectiontype = data?.connectiontype ?? 2; // Network Connection Type: 0 for Unknown, 1 for Ethernet, 2 for WIFI, 3 for Cellular Network – Unknown Generation, 4 for Cellular Network – 2G, 5 for Cellular Network – 3G, 6 for Cellular Network – 4G, 7 for Cellular Network – 5G
            const deviceDevicetype = data?.devicetype ?? 2; // Device Type: 1 for Mobile/Tablet, 2 for Desktop, 3 for Connected TV, 4 for Phone, 5 for Tablet, 6 for Connected Device, and 7 for Set-Top Box
            const deviceCarrier = data?.provider ?? "Airtel Broadband"; // Carrier or ISP
            const deviceW = data?.deviceWidth ?? 800; // Screen Width
            const deviceDNT = data?.dnt ?? 0; // Do Not Track
            const deviceModel = data?.model ?? "Chrome";
            const deviceOS = data?.os ?? "Linux";
            const deviceUserAgent = data?.useragent ?? "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36";
            const deviceH = data?.deviceHight ?? 600; // Screen Height           
            const diviceLimit = 0; // Limit Ad Tracking signal commercially endorsed (e.g., iOS, Android), where 0 = tracking is unrestricted, 1 = tracking must be limited per commercial guidelines.
            const devicesLanguage = "en"; // Browser language
            const geo = {
                "city": data?.city ?? "Hyderabad",
                "zip": data?.zip ?? "500036",
                "ipservice": 3,
                "lat": data?.lat ?? 17.385,
                "lon": data?.lon ?? 78.4378,
                "country": data?.countryCode3 ?? "IND",
                "type": 2,
                "region": data?.region ?? "TS"
            }

            // Impression
            const bidfloor = data?.minCpm ?? 0.01;
            const impressionId = data?.impressionId ?? generateCustomID();
            const impressionTagId = data?.tagid ?? "5391078";
            const impressionInterstitial = data?.interstitial ?? 0; // Indicates if the impression is interstitial or not. Values: 1 = interstitial, 0 = not interstitial

            // Video
            const impressionStartdelay = 0;
            const impressionMaxduration = data?.maxduration ?? 500;
            const impressionMinduration = data?.minduration ?? 1;
            const impressionW = data?.playerWidth ?? 640;
            const impressionSkip = data?.skippable ?? 1;
            const impressionLinearity = 1;
            const impressionApi = data?.api ?? [2];
            const impressionBoxingallowed = 1;
            const impressiondelivery = [1, 2];
            const impressionmaxbitrate = data?.maxbitrate ?? 30000;
            const impressionMime = data?.mimetype ?? [
                "application/javascript",
                "applications/x-mpegU",
                "video/mp4",
                "video/ogg",
                "video/webm",
                "video/3gpp",
                "video/H264"
            ];
            const impressionprotocols = data?.protocols ?? [2, 3, 5, 6, 7, 8];
            const impressionmaxextended = 30;
            const impressionminbitrate = 200;
            const impressionH = data?.playerHeight ?? 360;
            const impressionplacement = data?.placement ?? 3;
            const impressionplcmt = data?.sound ? 1 : 2;
            const impressionPlayBackMethod = data?.playbackmethod ?? [6];

            const sampledata = {
                "at": auctiontype,
                "source": {
                    "fd": firstParty,
                    "tid": tid
                },
                "regs": {
                    "gdpr": gdpr,
                    "coppa": coppa,
                    "ext": {
                        "us_privacy": us_privacy,
                        "tcf_version": tcf_version
                    }
                },
                "ext": {
                    "gpid": gpid,
                    "ssl": ssl,
                    "ip": ip
                },
                "site": {
                    "domain": domain,
                    "content": {
                        "genre": "",
                        "keywords": "",
                        "network": {},
                        "channel": {},
                        "context": 1,
                        "ext": {},
                        "title": "",
                        "episode": "",
                        "url": "",
                        "series": "",
                        "season": ""
                    },
                    "page": page,
                    "publisher": {
                        "name": publisherName,
                        "id": publisherSiteId,
                        "domain": domain
                    },
                    "name": domain,
                    "ref": ref,
                    "id": siteId,
                    "ext": {}
                },
                "test": test,
                "user": {
                    "buyerid": userbuyerid,
                    "id": userid,
                    "buyeruid": userbuyerid
                },
                "device": {
                    "make": deviceMake,
                    "ppi": devicePpi,
                    "pxratio": devicePxratio,
                    "js": deviceJs,
                    "connectiontype": deviceConnectiontype,
                    "devicetype": deviceDevicetype,
                    "carrier": deviceCarrier,
                    "w": deviceW,
                    "dnt": deviceDNT,
                    "ip": ip,
                    "model": deviceModel,
                    "os": deviceOS,
                    "geo": geo,
                    "ext": {},
                    "language": devicesLanguage,
                    "lmt": diviceLimit,
                    "h": deviceH,
                    "ua": deviceUserAgent
                },
                "cur": [
                    "USD"
                ],
                "imp": [
                    {
                        "instl": impressionInterstitial,
                        "secure": ssl,
                        "tagid": impressionTagId,
                        "video": {
                            "startdelay": impressionStartdelay,
                            "maxduration": impressionMaxduration,
                            "minduration": impressionMinduration,
                            "w": impressionW,
                            "skip": impressionSkip,
                            "linearity": impressionLinearity,
                            "api": impressionApi,
                            "boxingallowed": impressionBoxingallowed,
                            "delivery": impressiondelivery,
                            "ext": {
                                "video_skippable": impressionSkip
                            },
                            "maxbitrate": impressionmaxbitrate,
                            "mimes": impressionMime,
                            "protocols": impressionprotocols,
                            "pos": 1,
                            "maxextended": impressionmaxextended,
                            "minbitrate": impressionminbitrate,
                            "playbackmethod": impressionPlayBackMethod,
                            "h": impressionH,
                            "placement": impressionplacement,
                            "plcmt": impressionplcmt
                        },
                        "ext": {
                            "gpid": gpid
                        },
                        "bidfloor": bidfloor,
                        "id": impressionId,
                        "bidfloorcur": "USD"
                    }
                ],
                "id": id,
                "tmax": timeoutmax
            };

            const vastResponse = await openRTB_Vast(sampledata, vastTag, data?.protocolversion);

            return vastResponse;
        } catch (error) {
            console.log(error);
            return {
                status: "no-ad",
                message: "An error occurred",
                vastResponse: null,
                display: false,
                price: null,
            };
        }
    }


    async function main() {
        try {

            if (!scriptConfig || !vastTags || !videoPlayerData) {
                (console.warn || console.log)('Missing scriptConfig, vastTags or videoPlayerData');
                return;
            }

            isMobileUser = isMobileUserAgent();

            // ///////////////////////////
            // prerun function for the player setup
            // ///////////////////////////

            const prerunCalled = await preRunFunction();

            if (!prerunCalled) {
                return;
            }

            // ///////////////////////////

            // ///////////////////////////
            // player load call
            // ///////////////////////////

            track(tagsArray[0], "playerLoaded");

            // ///////////////////////////

            // ///////////////////////////
            // load the player
            // ///////////////////////////

            const loadPlayerWrapper = await loadPlayer();

            if (!loadPlayerWrapper) {
                return;
            }

            // ///////////////////////////

            // ///////////////////////////
            // load ad iframe
            // ///////////////////////////

            const adiframeinit = await adIframeWindow();

            if (!adiframeinit) {
                return;
            }

            // ///////////////////////////

            // ///////////////////////////
            // append the player to the selector
            // ///////////////////////////

            const playerAdded = await addPlayerToSelector();

            if (!playerAdded) {
                return;
            }

            // ///////////////////////////

            // ///////////////////////////
            // apstag init
            // ///////////////////////////

            apstag = await apsTagIframeLoader()

            await apstag.init({
                pubID: `${pubID}`, // enter your pub ID here
                videoAdServer: "DFP",
                adServer: "googletag",
                sellerId: sellerId
            });

            // ///////////////////////////

            // ///////////////////////////
            // viewbility logic
            // ///////////////////////////

            playerInViewFunction();

            checkIfInView();

            // ///////////////////////////

            // ///////////////////////////
            // resize the container
            // //////////////////////////

            resizeContainer();

            // ///////////////////////////

            // ///////////////////////////
            // template data extraction
            // ///////////////////////////

            const { adsType, flagMobileSettings } = scriptConfig;

            const {
                aspectRatio,
                responsive,
                loop,
                autoplay,
                bigPlayButton,
                mobileBigPlayButton,
                controls,
                mobilecontrols,
                preload,
                thumbnail,
                playPauseButton,
                mobilePlayPauseButton,
                volumeButton,
                mobileVolumeButton,
                progressBar,
                mobileProgressBar,
                fullscreenButton,
                mobileFullscreenButton,
                duration,
                mobileDuration,
                forwardButton,
                mobileForwardButton,
                backwardButton,
                mobileBackwardButton,
                playListUrls,
                autoplayAfterSecond,
                playOnView,
                preRollAd,
                breakingAds,
                errorLimit,
                volume,
                positioning,
                position,
                floatOnAd,
                playerMarginTop,
                playerMarginBottom,
                passback,
                playerAnimation,
                requestOnView,
                tabInView,
                onlyRequestOnPlay,
                autothumnail
            } = templateData;

            // ///////////////////////////

            // ///////////////////////////
            // Invetory tracking
            // ///////////////////////////

            track(tagsArray[0], "inventory");

            // ///////////////////////////

            // ///////////////////////////
            // ads requesting
            // ///////////////////////////

            async function requestAds() {
                for (let i = 0; i < maxRequests; i++) {

                    const adData = tagsArray[currentVastIndex];
                    const adId = adData.adsSourceID;

                    let adIframeClone = adIframe.cloneNode(true);
                    adIframeClone.id = 'video-ad-iframe-' + adId;
                    adIframeClone.height = videoSpace.clientHeight;
                    adIframeClone.width = videoSpace.clientWidth;


                    adIframeClone.onload = async () => {
                        const adIframeWindow = adIframeClone?.contentWindow;
                        const id = adIframeWindow?.frameElement?.id;

                        adData.requestCount++;
                        if (adData.provider === 'Amazon') {
                            await apstag.fetchBids({
                                slotID: adData?.slotId,
                                mediaType: "video",
                                sizes: [[480, 320], [420, 320], [640, 360], [320, 480], [640, 480]],
                                minCpm: adData?.minCpm,
                                handleBidResponse: handleVideoBids
                            });

                            function handleVideoBids(bids) {
                                // let vastTag = adData?.vastTag;
                                // if (bids.length > 0) {
                                //     // vastTag += bids[0].encodedQsParams;
                                //     vastTag += bids[0].qsParams;
                                // }

                                if (bids?.length > 0) {
                                    adIframeWindow?.postMessage({ type: 'ad-request', tag: `https://aax.amazon-adsystem.com/e/dtb/vast?b=${bids[0]?.amzniid}&rnd=${new Date().getTime()}&pp=${bids[0]?.amznbid}`, sound, volume, inmobile: isMobileUser }, '*');
                                } else {
                                    adIframeWindow.parent.postMessage({ type: 'ad-error', id }, "*")
                                }
                            }

                        } else if (adData.provider === 'openRTB') {
                            const rtbData = {
                                adssourceId: adData?.adsSourceID, // ID of the ad source
                                timeout: 3000, // Maximum timeout for the request
                                auctiontype: 2, // Second Price Auction
                                test: 1, // Test request
                                publisherId: "org123", // Organization ID
                                playertagId: "tag456", // Player tag ID
                                openpublisherid: "162175", // Publisher ID from dashboard
                                siteid: "1121005", // Site ID from dashboard
                                userid: "user789", // Custom user ID
                                domainurl: trackingDomain,// Referrer URL
                                domainname: mainDomainHost, // Domain of the website
                                href: currentUrl, // Page URL where ad is displayed
                                manufacturer: "Google", // Device manufacturer
                                connectiontype: 2, // WIFI connection
                                devicetype: 2, // Desktop device
                                deviceWidth: window?.innerWidth, // Device screen width
                                deviceHight: window?.innerHeight, // Device screen height
                                model: browser, // Device model
                                os: userOS, // Operating system
                                useragent: navigator?.userAgent.toLowerCase(), // User agent
                                provider: userIPData?.isp, // Carrier or ISP
                                ip: userIPData?.query, // User IP address
                                city: userIPData?.city, // City
                                zip: userIPData?.zip, // ZIP code
                                lat: userIPData?.lat, // Latitude
                                lon: userIPData?.lon, // Longitude
                                countryCode3: userIPData?.country, // Country code
                                region: userIPData?.region, // Region
                                minCpm: adData?.minCpm, // Minimum CPM bid floor
                                impressionId: "imp12345", // Impression ID
                                tagid: adData?.tagid, // Tag ID
                                interstitial: adData?.interstitial, // Not interstitial
                                maxduration: adData?.maxduration, // Max duration of video ad
                                minduration: adData?.minduration, // Min duration of video ad
                                skippable: adData?.skippable, // Skippable ads enabled
                                api: adData?.api, // Video player API supported
                                maxbitrate: adData?.maxbitrate, // Max bitrate
                                mimetype: adData?.mimetype, // MIME types supported
                                protocols: adData?.protocols, // Video protocols supported
                                playerHeight: 360, // Player height
                                playerWidth: 640, // Player width
                                placement: adData?.placement, // In-article placement
                                dnt: adData?.dnt, // Do Not Track is off
                                sound: false, // Sound is off
                                playbackmethod: adData?.playbackmethod, // Playback methods
                                protocolversion: adData?.protocolversion, // Protocol version
                            };

                            const res = await openRTB_2_5(adData?.vastTag, rtbData)
                            if (res.display) {
                                adIframeClone?.contentWindow?.postMessage({ type: 'ad-request', tag: res, sound, volume, inmobile: isMobileUser }, '*');
                            }

                        } else {
                            adIframeClone?.contentWindow?.postMessage({ type: 'ad-request', tag: replaceVastTagParams(generateMacroString(adData.vastTag)), sound, volume, inmobile: isMobileUser }, '*');
                        }

                        // ///////////////////////////
                        // ad request track
                        // ///////////////////////////
                        track(adData, "request");
                    }

                    const videoAdOuterContainer = doc.createElement('div');
                    videoAdOuterContainer.id = 'video-ad-outer-container-' + adId;
                    videoAdOuterContainer.style.height = '100%';
                    videoAdOuterContainer.style.width = '100%';
                    videoAdOuterContainer.style.position = 'absolute';
                    videoAdOuterContainer.style.visibility = 'hidden';
                    videoAdOuterContainer.appendChild(adIframeClone);

                    let cappingData;

                    try {
                        if (adData.capping) {
                            const url = trackingDomain + "/track" + "/report" + "/capping" + "?asid=" + adData.adsSourceID
                            cappingData = await (await fetch(url, {
                                method: 'GET'
                            })
                            ).json();
                        }
                    } catch (error) {
                        (console.warn || console.log)(error);
                    }

                    if (!adData?.capping || (cappingData?.success && cappingData?.data)) {
                        adsRequests.push(videoAdOuterContainer);
                    } else {
                        errorCount++;
                    }

                    if (currentVastIndex < tagsArray.length - 1) {
                        currentVastIndex++;
                    } else {
                        currentVastIndex = 0;
                    }
                }

                adsRequests.forEach((element) => {
                    videoAdSlot.appendChild(element);
                });

                adsRequests.length = 0;
            }

            if (preRollAd && !requestOnView && !onlyRequestOnPlay) {
                if (!requestingAds && tagsArray.length > 0 && !adPlaying && adRequestAllowed) {
                    requestingAds = true;
                    requestAds();
                }
            }

            if (!requestOnView && !onlyRequestOnPlay) {
                setInterval(() => {
                    if (adQueue.length > 0 && !adPlaying && adRequestAllowed) {
                        const adId = adQueue[0];
                        const adIframeWindow = videoAdSlot.querySelector(`iframe#${adId}`)?.contentWindow;

                        adIframeWindow.postMessage({ type: 'ad-play', fullscreen: fullscreen, sound: sound }, '*');
                    } else if (!requestingAds && tagsArray.length > 0 && !adPlaying && adQueue.length === 0 && adRequestAllowed) {
                        errorCount = 0;
                        requestingAds = true;
                        requestAds();
                    }
                }, breakingAds * 1000);
            }

            if (playerInView && requestOnView && !onlyRequestOnPlay) {
                if (adQueue.length > 0 && !adPlaying && adRequestAllowed) {
                    const adId = adQueue[0];
                    const adIframeWindow = videoAdSlot.querySelector(`iframe#${adId}`)?.contentWindow;

                    adIframeWindow.postMessage({ type: 'ad-play', fullscreen: fullscreen, sound: sound }, '*');
                } else if (!requestingAds && tagsArray.length > 0 && !adPlaying && adQueue.length === 0 && adRequestAllowed) {
                    errorCount = 0;
                    requestingAds = true;
                    requestAds();
                }
            }

            // ///////////////////////////

            // ///////////////////////////
            // video player setup
            // ///////////////////////////

            if (autothumnail) {
                videoThumbnail = getMainImage();
            }

            if (autothumnail && !videoThumbnail) {
                videoThumbnail = thumbnail
            }

            if (thumbnail && !autothumnail) {
                videoThumbnail = thumbnail
            }

            const player = videojs(videoPlayer, {
                handleFullscreen: false,
                fluid: true,
                aspectRatio: responsive ? aspectRatio : "16:9",
                responsive: responsive,
                loop: loop,
                bigPlayButton: autoplay ? flagMobileSettings ? bigPlayButton : isMobileUser ? mobileBigPlayButton : bigPlayButton : true,
                muted: !sound,
                playsinline: true,
                controls: flagMobileSettings ? controls : isMobileUser ? mobilecontrols : controls,
                preload: preload,
                poster: videoThumbnail ?? null,
                controlBar: {
                    playToggle: flagMobileSettings ? playPauseButton : isMobileUser ? mobilePlayPauseButton : playPauseButton,
                    volumePanel: flagMobileSettings ? volumeButton : isMobileUser ? mobileVolumeButton : volumeButton,
                    progressControl: flagMobileSettings ? progressBar : isMobileUser ? mobileProgressBar : progressBar,
                    fullscreenToggle: flagMobileSettings ? fullscreenButton : isMobileUser ? mobileFullscreenButton : fullscreenButton,
                    durationDisplay: flagMobileSettings ? duration : isMobileUser ? mobileDuration : duration,
                    pictureInPictureToggle: false,
                    skipButtons: flagMobileSettings
                        ?
                        {
                            forward: forwardButton ? 5 : 0,
                            backward: backwardButton ? 5 : 0
                        }
                        :
                        isMobileUser ?
                            {
                                forward: mobileForwardButton ? 5 : 0,
                                backward: mobileBackwardButton ? 5 : 0,
                            } :
                            {
                                forward: forwardButton ? 5 : 0,
                                backward: backwardButton ? 5 : 0
                            }
                },
                sources: playListUrls.map((item) => {
                    return {
                        src: item?.url,
                        type: item?.type === "mp4" ? "video/mp4" : "application/x-mpegURL"
                    }
                }),
                userActions: {
                    doubleClick: navigateToLink
                },
            });

            // ///////////////////////////

            // ///////////////////////////
            // content player one after another
            // ///////////////////////////

            player.on('ended', function () {
                currentSourceIndex++;
                if (currentSourceIndex < player.options().sources.length) {
                    player.src(player.options().sources[currentSourceIndex]);
                    player.load();
                    player.play();
                } else {
                    currentSourceIndex = 0;
                    player?.src(player.options().sources[currentSourceIndex]);
                    player?.load();
                    player?.play();
                }
            })

            // ///////////////////////////

            // ///////////////////////////
            // try setting the volume
            // ///////////////////////////

            player.volume((volume ?? 1) / 100);

            // ///////////////////////////

            // ///////////////////////////
            // on click un mute the video
            // ///////////////////////////
            let userInteractionHandler = () => {
                player.muted(false)
                sound = true

                // ///////////////////////////
                // unmute ad on user interaction
                // ///////////////////////////
                const iframes = videoAdSlot.querySelectorAll('iframe');
                iframes.forEach((iframe) => {
                    iframe.contentWindow.postMessage({ type: 'dom-unmute' }, '*');
                });

            }

            if (!sound) {
                win.addEventListener('click', userInteractionHandler, { once: true });
            }

            // ///////////////////////////

            // ///////////////////////////
            // attempt to play the video
            // ///////////////////////////

            async function attemptToPlay() {
                try {
                    if (autoplay && !autoplayAfterSecond && !playOnView && !playerPlaying) {
                        await player.play();
                    }

                    if (autoplay && autoplayAfterSecond && !playerPlaying) {
                        setTimeout(async () => {
                            try {
                                await player.play();
                            } catch (error) {
                                sound = false;
                                player.muted(true);

                                await player.play();
                            }
                        }, 3000);
                    }

                    if (playOnView && playerInView && !playerPlaying && (autoplay || autoplayAfterSecond)) {
                        await player.play();
                    }

                    if (positioning === "sticky" && autoplay && !autoplayAfterSecond) {
                        await player.play();
                    }

                } catch (error) {
                    try {
                        sound = false;
                        player.muted(true);

                        await player.play();
                    } catch (error) {
                        (console.warn || console.log)(error);
                    }
                }
            }

            player.ready(function () {
                attemptToPlay();
            })

            player.on('playing', function () {
                playerPlaying = true;

                if (onlyRequestOnPlay && !tapToPlayInitiated) {

                    if (preRollAd && !requestOnView) {
                        if (!requestingAds && tagsArray.length > 0 && !adPlaying && adRequestAllowed) {
                            requestingAds = true;
                            requestAds();
                        }
                    }

                    if (!requestOnView) {
                        setInterval(() => {
                            if (adQueue.length > 0 && !adPlaying && adRequestAllowed) {
                                const adId = adQueue[0];
                                const adIframeWindow = videoAdSlot.querySelector(`iframe#${adId}`)?.contentWindow;

                                adIframeWindow.postMessage({ type: 'ad-play', fullscreen: fullscreen, sound: sound }, '*');
                            } else if (!requestingAds && tagsArray.length > 0 && !adPlaying && adQueue.length === 0 && adRequestAllowed) {
                                errorCount = 0;
                                requestingAds = true;
                                requestAds();
                            }
                        }, breakingAds * 1000);
                    }

                    if (playerInView && requestOnView) {
                        if (adQueue.length > 0 && !adPlaying && adRequestAllowed) {
                            const adId = adQueue[0];
                            const adIframeWindow = videoAdSlot.querySelector(`iframe#${adId}`)?.contentWindow;

                            adIframeWindow.postMessage({ type: 'ad-play', fullscreen: fullscreen, sound: sound }, '*');
                        } else if (!requestingAds && tagsArray.length > 0 && !adPlaying && adQueue.length === 0 && adRequestAllowed) {
                            errorCount = 0;
                            requestingAds = true;
                            requestAds();
                        }
                    }
                }

                if (!tapToPlayInitiated) {
                    tapToPlayInitiated = true;
                }

            })

            // ///////////////////////////

            // ///////////////////////////
            // On tab change event
            // ///////////////////////////

            if (tabInView) {
                doc.addEventListener('visibilitychange', async function (e) {
                    try {
                        if (doc.visibilityState === 'visible') {
                            if (!playerPlaying && !adPlaying) {
                                player.play();
                                playerPlaying = true;
                            }
                            adRequestAllowed = true;
                        } else {
                            if (playerPlaying) {
                                await player.pause();
                                playerPlaying = false;
                            }
                            adRequestAllowed = false;
                        }
                    } catch (error) {
                        throw error;
                    }
                });
            }

            // ///////////////////////////

            // ///////////////////////////
            // on resize the window
            // ///////////////////////////

            win.addEventListener('resize', () => {
                if (positioning === "sticky") {
                    if (!floatingDiv.classList.contains("playstream-is-sticky")) {
                        const classes = floatingClassName.split(' ');
                        floatingDiv.classList.add(...classes);
                    }
                    resizeContainer();
                    resizeIframes();
                    floatingMargin();
                } else {
                    resizeContainer();
                    resizeIframes();
                }
            });

            // ///////////////////////////

            // ///////////////////////////
            // full screen change
            // ///////////////////////////

            player.controlBar.removeChild('fullscreenToggle');

            let playerFullScreenButton = player.controlBar.addChild('button', {
                controlText: 'Fullscreen',
                className: 'vjs-fullscreen-control'
            });

            playerFullScreenButton.on('click', function () {
                if (fullscreen) {
                    doc.exitFullscreen();
                } else {
                    videoSpace.requestFullscreen();
                }
            })

            playerFullScreenButton.on('touchstart', function () {
                if (fullscreen) {
                    doc.exitFullscreen();
                } else {
                    videoSpace.requestFullscreen();
                }
            })

            doc.addEventListener('fullscreenchange', function () {

                if (doc.fullscreenElement) {
                    fullscreen = true;

                    // ///////////////////////////
                    // full screen track
                    // ///////////////////////////
                    track(tagsArray[0], "fullscreen");
                } else {
                    fullscreen = false;
                }
            });

            // ///////////////////////////

            // ///////////////////////////
            // ads event listener
            // ///////////////////////////

            win.addEventListener('message', (event) => {

                switch (event.data.type) {
                    case 'ad-complete':
                        {
                            track(adDisplayingData, 'complete');

                            if (adDisplayingData?.tracking && adDisplayingData?.trackingEvent === "complete" && trackingAllowed(adDisplayingData?.trackingFrequency)) {
                                try {
                                    fetch(adDisplayingData?.trackingUrl, {
                                        method: 'GET',
                                    })
                                } catch (error) {
                                    (console.warn || console.log)(error);
                                }
                            }
                            break;
                        }
                    case 'ad-skip':
                        {
                            if (!sound) {
                                userInteractionHandler();
                            };

                            track(adDisplayingData, 'skip');
                            break;
                        }
                    case 'ad-loaded':
                        {
                            adQueueProxy.push(event.data.id);
                            break;
                        }
                    case 'content-pause':
                        {
                            if (passbackDisplaying & adsType === "outstream") {
                                if (passback?.passbackType === "gpt") {
                                    clearGPTPassback();
                                }
                                if (passback?.passbackType === "other") {
                                    clearOtherPassback();
                                }
                            }

                            adPlaying = true;
                            requestingAds = false;

                            if (adsType === "outstream") {
                                setTimeout(() => {
                                    videoWrapper.style.display = 'block';
                                    resizeContainer();
                                    resizeIframes();
                                    floatingMargin();

                                    mainWrapper.style.marginTop = `${playerMarginTop}px`;
                                    mainWrapper.style.marginBottom = `${playerMarginBottom}px`;
                                }, 500);
                            } else {
                                player.pause();
                            }

                            const adData = event.data.id.split('-');
                            const adId = adData[3];

                            const adSloat = videoAdSlot.querySelector("#video-ad-outer-container-" + adId);

                            adDisplayingData = tagsArray.find(item => item.adsSourceID == adData[3]);
                            // console.log("tag data", adDisplayingData)

                            adSloat.style.visibility = 'visible';
                            adContainer.style.visibility = 'visible';
                            videoAdSlot.style.visibility = 'visible';

                            // ///////////////////////////
                            // 
                            // ///////////////////////////
                            if (positioning === "inRead" && floatOnAd) {
                                if (floatingAllowed && !floatingDiv.classList.contains("playstream-is-sticky") && !playerInView && adPlaying && playerInitiallyView) {
                                    const classes = floatingClassName.split(' ');
                                    floatingDiv.classList.add(...classes);

                                    resizeContainer();
                                    resizeIframes();
                                    floatingMargin();
                                }
                            }
                            // ///////////////////////////
                            break;
                        }
                    case 'content-play':
                        {
                            tagsArray = shuffleVastTags(tagsArray);
                            // console.log("content-play-suffle", tagsArray);

                            // ///////////////////////////
                            // remove inRead floating if inRead floating and ad is playing 
                            // ///////////////////////////
                            if (positioning === "inRead" && floatOnAd) {
                                if (floatingDiv.classList.contains("playstream-is-sticky")) {
                                    const classes = floatingClassName.split(' ');
                                    floatingDiv.classList.remove(...classes);

                                    resizeContainer();
                                    resizeIframes();
                                    floatingMargin();
                                }
                            }
                            // ///////////////////////////

                            adPlaying = false;
                            requestingAds = false;

                            const adId = event.data.id.split('-')[3];
                            videoAdSlot.querySelector("#video-ad-outer-container-" + adId).remove();

                            if (adsType === "outstream") {
                                videoWrapper.style.display = 'none';
                                resizeContainer();
                                resizeIframes();
                                floatingMargin();

                                mainWrapper.style.marginTop = '0px';
                                mainWrapper.style.marginBottom = '0px';

                                if (fullscreen) {
                                    doc.exitFullscreen();
                                }
                            } else {
                                if (adRequestAllowed) {
                                    player.play();
                                }
                            }

                            adDisplayingData = null;

                            adContainer.style.visibility = 'hidden';
                            videoAdSlot.style.visibility = 'hidden';

                            adQueueProxy.pop(event.data.id);

                            break;
                        }
                    case 'ad-error':
                        {
                            const adId = event.data.id.split('-')[3];
                            setTimeout(() => {
                                videoAdSlot.querySelector("#video-ad-outer-container-" + adId).remove();
                            }, 1000);

                            errorCount++;
                            if (errorCount % maxRequests === 0 && errorCount < errorLimit) {
                                requestAds();
                            } else if (errorCount >= errorLimit) {

                                tagsArray = shuffleVastTags(tagsArray);
                                // console.log("error suffle",tagsArray);

                                if (adsType === "outstream") {
                                    try {
                                        if (passback?.active) {
                                            if (passback?.passbackType === "gpt") {
                                                showGPTPassback();
                                            }
                                            if (passback?.passbackType === "other") {
                                                showOtherPassback();
                                            }
                                        }
                                    } catch (error) {
                                        (console.warn || console.log)(error);
                                    }
                                }

                                requestingAds = false;
                                errorCount = 0;
                            }

                            track(tagsArray.find(item => item.adsSourceID == adId), 'error');
                            break;
                        }
                    case 'ad-started':
                        {
                            track(adDisplayingData, 'start');

                            if (adDisplayingData?.tracking && adDisplayingData?.trackingEvent === "start" && trackingAllowed(adDisplayingData?.trackingFrequency)) {
                                try {
                                    fetch(adDisplayingData?.trackingUrl, {
                                        method: 'GET',
                                    })
                                } catch (error) {
                                    (console.warn || console.log)(error);
                                }
                            }
                            break;
                        }
                    case 'ad-impression':
                        {
                            adDisplayingData.impressionCount++;

                            track(adDisplayingData, 'impression');

                            if (adDisplayingData?.tracking && adDisplayingData?.trackingEvent === "impression" && trackingAllowed(adDisplayingData?.trackingFrequency)) {
                                try {
                                    fetch(adDisplayingData?.trackingUrl, {
                                        method: 'GET',
                                    })
                                } catch (error) {
                                    (console.warn || console.log)(error);
                                }
                            }
                            break;
                        }
                    case 'ad-first-quartile':
                        {
                            track(adDisplayingData, 'firstQuartile');

                            if (adDisplayingData?.tracking && adDisplayingData?.trackingEvent === "firstQuartile" && trackingAllowed(adDisplayingData?.trackingFrequency)) {
                                try {
                                    fetch(adDisplayingData?.trackingUrl, {
                                        method: 'GET',
                                    })
                                } catch (error) {
                                    (console.warn || console.log)(error);
                                }
                            }
                            break;
                        }
                    case 'ad-midpoint':
                        {
                            track(adDisplayingData, 'midPoint');

                            if (adDisplayingData?.tracking && adDisplayingData?.trackingEvent === "mid" && trackingAllowed(adDisplayingData?.trackingFrequency)) {
                                try {
                                    fetch(adDisplayingData?.trackingUrl, {
                                        method: 'GET',
                                    })
                                } catch (error) {
                                    (console.warn || console.log)(error);
                                }
                            }
                            break;
                        }
                    case 'ad-third-quartile':
                        {
                            track(adDisplayingData, 'thirdQuartile');

                            if (adDisplayingData?.tracking && adDisplayingData?.trackingEvent === "thirdQuartile" && trackingAllowed(adDisplayingData?.trackingFrequency)) {
                                try {
                                    fetch(adDisplayingData?.trackingUrl, {
                                        method: 'GET',
                                    })
                                } catch (error) {
                                    (console.warn || console.log)(error);
                                }
                            }
                            break;
                        }
                    case 'ad-click':
                        {
                            if (!sound) {
                                userInteractionHandler();
                            };

                            track(adDisplayingData, 'click');

                            if (adDisplayingData?.tracking && adDisplayingData?.trackingEvent === "click" && trackingAllowed(adDisplayingData?.trackingFrequency)) {
                                try {
                                    fetch(adDisplayingData?.trackingUrl, {
                                        method: 'GET',
                                    })
                                } catch (error) {
                                    (console.warn || console.log)(error);
                                }
                            }
                            break;
                        }
                    case 'ad-resumed':
                        {

                            track(adDisplayingData, 'resume');

                            if (adDisplayingData?.tracking && adDisplayingData?.trackingEvent === "resume" && trackingAllowed(adDisplayingData?.trackingFrequency)) {
                                try {
                                    fetch(adDisplayingData?.trackingUrl, {
                                        method: 'GET',
                                    })
                                } catch (error) {
                                    (console.warn || console.log)(error);
                                }
                            }
                            break;
                        }
                    case 'ad-paused':
                        {
                            track(adDisplayingData, 'pause');

                            if (adDisplayingData?.tracking && adDisplayingData?.trackingEvent === "pause" && trackingAllowed(adDisplayingData?.trackingFrequency)) {
                                try {
                                    fetch(adDisplayingData?.trackingUrl, {
                                        method: 'GET',
                                    })
                                } catch (error) {
                                    (console.warn || console.log)(error);
                                }
                            }
                            break;
                        }
                    case 'ad-volume-unmute':
                        {
                            if (!sound) {
                                userInteractionHandler();
                            };

                            track(tagsArray[0], 'unmute');

                            if (adDisplayingData?.tracking && adDisplayingData?.trackingEvent === "unmute" && trackingAllowed(adDisplayingData?.trackingFrequency)) {
                                try {
                                    fetch(adDisplayingData?.trackingUrl, {
                                        method: 'GET',
                                    })
                                } catch (error) {
                                    (console.warn || console.log)(error);
                                }
                            }
                            break;
                        }
                    case 'ad-volume-mute':
                        {
                            if (!sound) {
                                userInteractionHandler();
                            };

                            track(tagsArray[0], 'mute');

                            if (adDisplayingData?.tracking && adDisplayingData?.trackingEvent === "mute" && trackingAllowed(adDisplayingData?.trackingFrequency)) {
                                try {
                                    fetch(adDisplayingData?.trackingUrl, {
                                        method: 'GET',
                                    })
                                } catch (error) {
                                    (console.warn || console.log)(error);
                                }
                            }
                            break;
                        }
                    case 'ad-fullscreen':
                        {
                            if (!sound) {
                                userInteractionHandler();
                            };

                            if (fullscreen) {
                                doc.exitFullscreen();
                            } else {
                                videoSpace.requestFullscreen();
                            }

                            break;
                        }
                    case 'ad-paused-timeout':
                        {
                            tagsArray = shuffleVastTags(tagsArray);
                            // console.log("timeout suffle", tagsArray);

                            // ///////////////////////////
                            // remove inRead floating if inRead floating and ad is playing 
                            // ///////////////////////////
                            if (positioning === "inRead" && floatOnAd) {
                                if (floatingDiv.classList.contains("playstream-is-sticky")) {
                                    const classes = floatingClassName.split(' ');
                                    floatingDiv.classList.remove(...classes);

                                    resizeContainer();
                                    resizeIframes();
                                    floatingMargin();
                                }
                            }
                            // ///////////////////////////

                            adPlaying = false;
                            requestingAds = false;

                            const adId = event.data.id.split('-')[3];
                            videoAdSlot.querySelector("#video-ad-outer-container-" + adId).remove();

                            if (adsType === "outstream") {
                                videoWrapper.style.display = 'none';
                                resizeContainer();
                                resizeIframes();
                                floatingMargin();

                                mainWrapper.style.marginTop = '0px';
                                mainWrapper.style.marginBottom = '0px';

                                if (fullscreen) {
                                    doc.exitFullscreen();
                                }
                            } else {
                                if (adRequestAllowed) {
                                    player.play();
                                }
                            }

                            adDisplayingData = null;

                            adContainer.style.visibility = 'hidden';
                            videoAdSlot.style.visibility = 'hidden';

                            adQueueProxy.pop(event.data.id);
                            break;
                        }
                    default:
                        {
                            break;
                        }
                }
            });

            // ///////////////////////////

            // ///////////////////////////
            // logo hide after seconds checker
            // ///////////////////////////

            if (logoSpace) {
                setTimeout(() => {
                    logoSpace.style.visibility = 'hidden';
                }, 2500)
            }

            videoSpace.addEventListener('mouseenter', function () {
                if (logoSpace) {
                    clearInterval(hoverTimeout);
                    logoSpace.style.visibility = 'visible';
                }
            })

            videoSpace.addEventListener('mouseleave', function () {
                if (logoSpace) {
                    if (player.paused()) {
                        logoSpace.style.visibility = 'visible';
                    } else {
                        hoverTimeout = setTimeout(() => {
                            logoSpace.style.visibility = 'hidden';
                        }, 2500)
                    }
                }
            });

            videoSpace.addEventListener('touchstart', function () {
                if (logoSpace) {
                    clearInterval(hoverTimeout);
                    logoSpace.style.visibility = 'visible';

                    hoverTimeout = setTimeout(() => {
                        logoSpace.style.visibility = 'hidden';
                    }, 2500)
                }
            });

            videoSpace.addEventListener('touchend', function () {
                if (logoSpace) {
                    if (player.paused()) {
                        logoSpace.style.visibility = 'visible';
                    } else {
                        hoverTimeout = setTimeout(() => {
                            logoSpace.style.visibility = 'hidden';
                        }, 2500)
                    }
                }
            });

            // ///////////////////////////

            // ///////////////////////////
            // close player button
            // ///////////////////////////

            if (closeButton) {
                closeButton.addEventListener('click', closePlayerFunction);
            }

            // ///////////////////////////


            // ///////////////////////////
            // player scroll event
            // ///////////////////////////

            if (positioning === "floating" || positioning === "sticky" || (positioning === "inRead" && floatOnAd)) {
                switch (position) {
                    case "right-top":
                        if (playerAnimation) {
                            floatingClassName = "playstream-is-sticky playstream-fadeInRightToLeft playstream-right-top";
                        } else {
                            floatingClassName = "playstream-is-sticky playstream-right-top";
                        }
                        break;
                    case "right-bottom":
                        if (playerAnimation) {
                            floatingClassName = "playstream-is-sticky playstream-fadeInRightToLeft playstream-right-bottom";
                        } else {
                            floatingClassName = "playstream-is-sticky playstream-right-bottom";
                        }
                        break;
                    case "left-top":
                        if (playerAnimation) {
                            floatingClassName = "playstream-is-sticky playstream-fadeInLeftToRight playstream-left-top";
                        } else {
                            floatingClassName = "playstream-is-sticky playstream-left-top";
                        }
                        break;
                    case "left-bottom":
                        if (playerAnimation) {
                            floatingClassName = "playstream-is-sticky playstream-fadeInLeftToRight playstream-left-bottom";
                        } else {
                            floatingClassName = "playstream-is-sticky playstream-left-bottom";
                        }
                        break;
                    case "top":
                        if (playerAnimation) {
                            floatingClassName = "playstream-is-sticky playstream-fadeInTopToBottom playstream-top";
                        } else {
                            floatingClassName = "playstream-is-sticky playstream-top";
                        }
                        break;
                    case "bottom":
                        if (playerAnimation) {
                            floatingClassName = "playstream-is-sticky playstream-fadeInBottomToTop playstream-bottom";
                        } else {
                            floatingClassName = "playstream-is-sticky playstream-bottom";
                        }
                        break;
                    default:
                        if (playerAnimation) {
                            floatingClassName = "playstream-is-sticky playstream-fadeInRightToLeft playstream-right-bottom";
                        } else {
                            floatingClassName = "playstream-is-sticky playstream-right-bottom";
                        }
                        break;
                }
            }

            if (requestOnView) {
                if (positioning === "sticky") {
                    if (adQueue.length > 0 && !adPlaying && adRequestAllowed) {
                        const adId = adQueue[0];
                        const adIframeWindow = videoAdSlot.querySelector(`iframe#${adId}`)?.contentWindow;

                        adIframeWindow.postMessage({ type: 'ad-play', fullscreen: fullscreen, sound: sound }, '*');
                    } else if (!requestingAds && tagsArray.length > 0 && !adPlaying && adQueue.length === 0 && adRequestAllowed) {
                        errorCount = 0;
                        requestingAds = true;
                        requestAds();
                    }

                    setInterval(() => {
                        if (adQueue.length > 0 && !adPlaying && adRequestAllowed) {
                            const adId = adQueue[0];
                            const adIframeWindow = videoAdSlot.querySelector(`iframe#${adId}`)?.contentWindow;

                            adIframeWindow.postMessage({ type: 'ad-play', fullscreen: fullscreen, sound: sound }, '*');
                        } else if (!requestingAds && tagsArray.length > 0 && !adPlaying && adQueue.length === 0 && adRequestAllowed) {
                            errorCount = 0;
                            requestingAds = true;
                            requestAds();
                        }
                    }, breakingAds * 1000);
                }
            }

            win.addEventListener('scroll', function () {

                if (requestOnView) {
                    if (positioning === "floating" && playerInitiallyView && !requestOnPlayerView) {
                        if (adQueue.length > 0 && !adPlaying && adRequestAllowed) {
                            const adId = adQueue[0];
                            const adIframeWindow = videoAdSlot.querySelector(`iframe#${adId}`)?.contentWindow;

                            adIframeWindow.postMessage({ type: 'ad-play', fullscreen: fullscreen, sound: sound }, '*');
                        } else if (!requestingAds && tagsArray.length > 0 && !adPlaying && adQueue.length === 0 && adRequestAllowed) {
                            errorCount = 0;
                            requestingAds = true;
                            requestAds();
                        }

                        setInterval(() => {
                            if (adQueue.length > 0 && !adPlaying && adRequestAllowed) {
                                const adId = adQueue[0];
                                const adIframeWindow = videoAdSlot.querySelector(`iframe#${adId}`)?.contentWindow;

                                adIframeWindow.postMessage({ type: 'ad-play', fullscreen: fullscreen, sound: sound }, '*');
                            } else if (!requestingAds && tagsArray.length > 0 && !adPlaying && adQueue.length === 0 && adRequestAllowed) {
                                errorCount = 0;
                                requestingAds = true;
                                requestAds();
                            }
                        }, breakingAds * 1000);

                        requestOnPlayerView = true;
                    }

                    if (playerInView) {
                        if (adQueue.length > 0 && !adPlaying && adRequestAllowed) {
                            const adId = adQueue[0];
                            const adIframeWindow = videoAdSlot.querySelector(`iframe#${adId}`)?.contentWindow;

                            adIframeWindow.postMessage({ type: 'ad-play', fullscreen: fullscreen, sound: sound }, '*');
                        } else if (!requestingAds && tagsArray.length > 0 && !adPlaying && adQueue.length === 0 && adRequestAllowed) {
                            errorCount = 0;
                            requestingAds = true;
                            requestAds();
                        }
                    }

                    if (positioning === "inRead" && playerInView) {
                        if (adQueue.length > 0 && !adPlaying && adRequestAllowed) {
                            const adId = adQueue[0];
                            const adIframeWindow = videoAdSlot.querySelector(`iframe#${adId}`)?.contentWindow;

                            adIframeWindow.postMessage({ type: 'ad-play', fullscreen: fullscreen, sound: sound }, '*');
                        } else if (!requestingAds && tagsArray.length > 0 && !adPlaying && adQueue.length === 0 && adRequestAllowed) {
                            errorCount = 0;
                            requestingAds = true;
                            requestAds();
                        }

                        if (!requestOnPlayerViewInterval) {
                            requestOnPlayerViewInterval = setInterval(() => {
                                if (adQueue.length > 0 && !adPlaying && adRequestAllowed) {
                                    const adId = adQueue[0];
                                    const adIframeWindow = videoAdSlot.querySelector(`iframe#${adId}`)?.contentWindow;

                                    adIframeWindow.postMessage({ type: 'ad-play', fullscreen: fullscreen, sound: sound }, '*');
                                } else if (!requestingAds && tagsArray.length > 0 && !adPlaying && adQueue.length === 0 && adRequestAllowed) {
                                    errorCount = 0;
                                    requestingAds = true;
                                    requestAds();
                                }
                            }, breakingAds * 1000);
                        }
                    }

                    if (!playerInView && requestOnPlayerViewInterval) {
                        clearInterval(requestOnPlayerViewInterval);
                        requestOnPlayerViewInterval = null;
                    }
                }

                // ///////////////////////////
                // player play logic
                // ///////////////////////////
                if (!playerPlaying) {
                    attemptToPlay();
                }

                if (!playerInitiallyView) {
                    const rect = mainWrapper.getBoundingClientRect();

                    if (rect.top < 0) {
                        playerInitiallyView = true;
                    }
                }

                if (!playerPlaying) {
                    (async () => {
                        try {
                            if (playOnView && !playerPlaying && (autoplay || autoplayAfterSecond) && playerInitiallyView) {
                                await player.play();
                            }
                        } catch (error) {
                            sound = false;
                            player.muted(true);

                            await player.play();
                        }
                    })()
                }

                // ///////////////////////////

                // ///////////////////////////
                // floating player logic
                // ///////////////////////////

                if (positioning === "floating") {
                    if (floatingAllowed && !floatingDiv.classList.contains("playstream-is-sticky") && !playerInView && playerInitiallyView) {
                        const classes = floatingClassName.split(' ');
                        floatingDiv.classList.add(...classes);


                        resizeContainer();
                        resizeIframes();
                        floatingMargin();
                    }

                    if (floatingDiv.classList.contains("playstream-is-sticky") && playerInView && playerInitiallyView) {
                        const classes = floatingClassName.split(' ');
                        floatingDiv.classList.remove(...classes);

                        resizeContainer();
                        resizeIframes();
                        floatingMargin();
                    }
                }

                // ///////////////////////////
                // inRead flaot on ad logic
                // ///////////////////////////

                if (positioning === "inRead" && floatOnAd) {
                    if (floatingAllowed && !floatingDiv.classList.contains("playstream-is-sticky") && !playerInView && adPlaying && playerInitiallyView) {
                        const classes = floatingClassName.split(' ');
                        floatingDiv.classList.add(...classes);

                        resizeContainer();
                        resizeIframes();
                        floatingMargin();
                    }

                    if (floatingDiv.classList.contains("playstream-is-sticky") && playerInView) {
                        const classes = floatingClassName.split(' ');
                        floatingDiv.classList.remove(...classes);

                        resizeContainer();
                        resizeIframes();
                        floatingMargin();
                    }
                }

                // ///////////////////////////

                // ///////////////////////////
                // sticky player logic
                // ///////////////////////////

                if (positioning === "sticky") {
                    const classes = floatingClassName.split(' ');
                    floatingDiv.classList.add(...classes);

                    resizeContainer();
                    resizeIframes();
                    floatingMargin();
                }

                // ///////////////////////////
            });

            // ///////////////////////////

            // ///////////////////////////
            // 
            // ///////////////////////////

            if (positioning === "sticky") {
                const classes = floatingClassName.split(' ');
                floatingDiv.classList.add(...classes);

                resizeContainer();
                resizeIframes();
                floatingMargin();
            }

            // ///////////////////////////





        } catch (error) {
            (console.warn || console.log)(error);
        }
    }

    async function loadInitialResources() {
        try {
            const jsonUrl = win?.playstream?.json?.url;
            const data = await (await fetch(jsonUrl)).json();

            // iframeScript = await (await fetch(`https://${cachingDomain}/ima.min.js`)).text();
            iframeScript = await (await fetch('request.js')).text();

            if (!iframeScript) {
                (console.warn || console.log)('Failed to load the iframe script');
                return;
            }

            scriptConfig = data?.scriptConfig;
            vastTags = data?.vastTags;
            videoPlayerData = data?.videoPlayerData;

            try {
                userIPData = (await (await fetch('https://pro.ip-api.com/json/?fields=country,countryCode,countryCode3,region,regionName,city,district,zip,lat,lon,isp,query&key=umJEfPhjzmg4sUU')).json());
            } catch (error) {
                (console.warn || console.log)(error);
                userIPData = {
                    country: "Unknown",
                    regionName: "Unknown",
                    city: "Unknown"
                }
            }

            main();
        } catch (error) {
            (console.warn || console.log)(error);
        }
    }

    async function fetchAllDependencyScripts() {
        try {
            if (flag) {
                flag = false;
                [
                    'touchmove',
                    'mousedown',
                    'fullscreenchange',
                    'mouseup',
                    'scroll',
                    'visibilitychange',
                    'mousemove',
                    'dispose',
                    'pagehide',
                    'touchstart',
                ].forEach(function (evt) {
                    doc.removeEventListener(evt, fetchAllDependencyScripts, true);
                });

                loadInitialResources();
            }
        } catch (error) {
            (console.warn || console.log)(error);
        }
    }

    if (doc.readyState === "complete") {
        try {
            fetchAllDependencyScripts();
        } catch (error) {
            (console.warn || console.log)(error);
        }
    }

    [
        'touchmove',
        'mousedown',
        'fullscreenchange',
        'mouseup',
        'scroll',
        'visibilitychange',
        'mousemove',
        'dispose',
        'pagehide',
        'touchstart',
    ].forEach(function (evt) {
        try {
            doc.addEventListener(evt, fetchAllDependencyScripts, true);
        } catch (error) {
            (console.warn || console.log)(error);
        }
    });

    doc.onreadystatechange = function () {
        try {
            if (doc.readyState === "complete") {
                fetchAllDependencyScripts();
            }
        } catch (error) {
            (console.warn || console.log)(error);
        }
    };

})(window)