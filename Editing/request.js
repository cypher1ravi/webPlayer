(function (w) {
    const window = w;
    const document = window.document;

    const style = document.createElement('style');
    style.innerHTML = `
        #playstream-volume-range {
            width: 50px;
            height: 15px;
            -webkit-appearance: none;
            appearance: none;
            background: gray;
            outline: none;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: inset 0 0 5px rgba(0, 0, 0, 1);
            padding: 0 !important;
            border: none;
            cursor: pointer;
        }
        #playstream-volume-range::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 15px;
            height: 15px;
            border-radius: 50%;
            background: rgb(236, 197, 70);
            cursor: pointer;
            border: 4px solid #333;
            box-shadow: -407px 0 0 400px rgb(236, 197, 70);
        }
        #playstream-video-ad {
            height: 100%;
            width: 100%;
        }
        #playstream-ad-bar {
            position: absolute;
            left: 0;
            bottom: 0;
            width: 100%;
            z-index: 1000;
            display: block;
        }
        #playstream-timer {
            line-height: 1 !important;
        }
        #playstream-advertisment {
            margin: 0;
            margin-left: 5px;
            font-size: 10px;
            color: white;
            font-family: sans-serif;
        }
        #playstream-advertisment-timer {
            margin: 0;
            margin-left: 5px;
            font-size: 10px;
            color: white;
            font-family: sans-serif;
        }
        #playstream-progress-outer {
            background: gray;
        }
        #playstream-progress {
            height: 3px;
            width: 0%;
            background: #ECC546;
        }
        #playstream-all-button {
            padding: 1px 10px;
            display: none;
            background-color: rgba(0, 0, 0, 0.5);
            justify-content: space-between;
        }
        #playstream-play-icon {
            cursor: pointer;
            color: white;
            height: 20px;
            width: 20px;
            display: flex;
            align-items: center;
        }
        #playstream-right-control-outer {
            display: flex;
            gap: 10px;
            align-items: center;
        }
        #playstream-volume-control {
            display: flex;
            align-items: center;
        }
        #playstream-volume-icon {
            cursor: pointer;
            color: white;
            height: 20px;
            width: 20px;
            display: flex;
            align-items: center;
        }
        #playstream-fullscreen-icon {
            cursor: pointer;
            color: white;
            height: 20px;
            width: 20px;
            display: flex;
            align-items: center;
        }
    `
    document.head.appendChild(style);

    // iframe body style
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100%';
    document.body.style.width = '100%';

    // creating the ad unit ui elements with controls
    // Create the main container for the video ad
    const videoAdContainerElement = document.createElement('div');
    videoAdContainerElement.id = 'playstream-video-ad';

    // Create the ad bar container
    const adBarContainer = document.createElement('div');
    adBarContainer.id = 'playstream-ad-bar';

    // Create the timer container
    const timerContainer = document.createElement('div');
    timerContainer.id = 'playstream-timer';

    // Create the advertisement text and timer
    const advertisementText = document.createElement('span');
    advertisementText.id = 'playstream-advertisment';
    advertisementText.textContent = 'Advertisment: ';

    const advertisementTimer = document.createElement('span');
    advertisementTimer.id = 'playstream-advertisment-timer';

    advertisementText.appendChild(advertisementTimer);

    // Create the progress bar outer container
    const progressOuter = document.createElement('div');
    progressOuter.id = 'playstream-progress-outer';

    // Create the progress bar
    const progress = document.createElement('div');
    progress.id = 'playstream-progress';
    progressOuter.appendChild(progress);

    // Append timer and progress bar to the timer container
    timerContainer.appendChild(advertisementText);
    timerContainer.appendChild(progressOuter);

    // Create the control button container
    const allButtonContainer = document.createElement('div');
    allButtonContainer.id = 'playstream-all-button';

    // Create the left control outer container
    const leftControlOuter = document.createElement('div');
    leftControlOuter.id = 'playstream-left-control-outer';

    // Create the play icon container
    const playIcon = document.createElement('div');
    playIcon.id = 'playstream-play-icon';

    // Create and append the play icon SVG
    playIcon.innerHTML = `
    <svg viewBox="-2.5 -2.5 30.00 30.00" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 6.42004C10 4.76319 8.65685 3.42004 7 3.42004C5.34315 3.42004 4 4.76319 4 6.42004V18.42C4 20.0769 5.34315 21.42 7 21.42C8.65685 21.42 10 20.0769 10 18.42V6.42004Z" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
        <path d="M20 6.42004C20 4.76319 18.6569 3.42004 17 3.42004C15.3431 3.42004 14 4.76319 14 6.42004V18.42C14 20.0769 15.3431 21.42 17 21.42C18.6569 21.42 20 20.0769 20 18.42V6.42004Z" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
    `;
    leftControlOuter.appendChild(playIcon);

    // Create the right control outer container
    const rightControlOuter = document.createElement('div');
    rightControlOuter.id = 'playstream-right-control-outer';

    // Create the volume control container
    const volumeControl = document.createElement('div');
    volumeControl.id = 'playstream-volume-control';

    // Create the volume icon container
    const volumeIcon = document.createElement('div');
    volumeIcon.id = 'playstream-volume-icon';

    // Create and append the volume icon SVG
    volumeIcon.innerHTML = `
    <svg viewBox="-2.5 -2.5 30.00 30.00" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 9.50009L21 14.5001M21 9.50009L16 14.5001M4.6 9.00009H5.5012C6.05213 9.00009 6.32759 9.00009 6.58285 8.93141C6.80903 8.87056 7.02275 8.77046 7.21429 8.63566C7.43047 8.48353 7.60681 8.27191 7.95951 7.84868L10.5854 4.69758C11.0211 4.17476 11.2389 3.91335 11.4292 3.88614C11.594 3.86258 11.7597 3.92258 11.8712 4.04617C12 4.18889 12 4.52917 12 5.20973V18.7904C12 19.471 12 19.8113 11.8712 19.954C11.7597 20.0776 11.594 20.1376 11.4292 20.114C11.239 20.0868 11.0211 19.8254 10.5854 19.3026L7.95951 16.1515C7.60681 15.7283 7.43047 15.5166 7.21429 15.3645C7.02275 15.2297 6.80903 15.1296 6.58285 15.0688C6.32759 15.0001 6.05213 15.0001 5.5012 15.0001H4.6C4.03995 15.0001 3.75992 15.0001 3.54601 14.8911C3.35785 14.7952 3.20487 14.6422 3.10899 14.4541C3 14.2402 3 13.9601 3 13.4001V10.6001C3 10.04 3 9.76001 3.10899 9.54609C3.20487 9.35793 3.35785 9.20495 3.54601 9.10908C3.75992 9.00009 4.03995 9.00009 4.6 9.00009Z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
    `;
    volumeControl.appendChild(volumeIcon);

    // Create and append the volume range input
    const volumeRange = document.createElement('input');
    volumeRange.id = 'playstream-volume-range';
    volumeRange.type = 'range';
    volumeRange.value = '0';
    volumeRange.min = '0';
    volumeRange.max = '100';
    volumeControl.appendChild(volumeRange);

    // Append the volume control to the right control outer container
    rightControlOuter.appendChild(volumeControl);

    // Create the fullscreen icon container
    const fullscreenIcon = document.createElement('div');
    fullscreenIcon.id = 'playstream-fullscreen-icon';

    // Create and append the fullscreen icon SVG
    fullscreenIcon.innerHTML = `
    <svg viewBox="-2.5 -2.5 30.00 30.00" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M3 4C3 3.44772 3.44772 3 4 3H8C8.55228 3 9 3.44772 9 4C9 4.55228 8.55228 5 8 5H6.41421L9.70711 8.29289C10.0976 8.68342 10.0976 9.31658 9.70711 9.70711C9.31658 10.0976 8.68342 10.0976 8.29289 9.70711L5 6.41421V8C5 8.55228 4.55228 9 4 9C3.44772 9 3 8.55228 3 8V4ZM16 3H20C20.5523 3 21 3.44772 21 4V8C21 8.55228 20.5523 9 20 9C19.4477 9 19 8.55228 19 8V6.41421L15.7071 9.70711C15.3166 10.0976 14.6834 10.0976 14.2929 9.70711C13.9024 9.31658 13.9024 8.68342 14.2929 8.29289L17.5858 5H16C15.4477 5 15 4.55228 15 4C15 3.44772 15.4477 3 16 3ZM9.70711 14.2929C10.0976 14.6834 10.0976 15.3166 9.70711 15.7071L6.41421 19H8C8.55228 19 9 19.4477 9 20C9 20.5523 8.55228 21 8 21H4C3.44772 21 3 20.5523 3 20V16C3 15.4477 3.44772 15 4 15C4.55228 15 5 15.4477 5 16V17.5858L8.29289 14.2929C8.68342 13.9024 9.31658 13.9024 9.70711 14.2929ZM20 15C20.5523 15 21 15.4477 21 16V20C21 20.5523 20.5523 21 20 21H16C15.4477 21 15 20.5523 15 20C15 19.4477 15.4477 19 16 19H17.5858L14.2929 15.7071C13.9024 15.3166 13.9024 14.6834 14.2929 14.2929C14.6834 13.9024 15.3166 13.9024 15.7071 14.2929L19 17.5858V16C19 15.4477 19.4477 15 20 15Z" fill="#ffffff"></path>
    </svg>
    `;
    rightControlOuter.appendChild(fullscreenIcon);

    // Append the left and right controls to the control button container
    allButtonContainer.appendChild(leftControlOuter);
    allButtonContainer.appendChild(rightControlOuter);

    // Append the timer container and control button container to the ad bar container
    adBarContainer.appendChild(timerContainer);
    adBarContainer.appendChild(allButtonContainer);

    // Finally, append the main video ad container to the body or any desired parent element
    document.body.appendChild(videoAdContainerElement);
    document.body.appendChild(adBarContainer)

    // ad display logic

    let imasdk = window.parent.google.ima;
    let adsManager;
    let adsLoader;
    let adsRequest;
    let adDisplayContainer;
    let adPlaying = false;

    let countdownTimer;
    let adsProcessController;
    let adPausedTimeout;
    let hoverTimeout;
    let adInMobile = false;

    let sound = false;
    let volume = 0;

    // ads controll settings
    const adsControlButton = document.getElementById('playstream-all-button');

    document.body.addEventListener("mouseenter", () => {
        adsControlButton.style.display = "flex";
    });

    document.body.addEventListener("mouseleave", () => {
        // if ads is paused then show the control bar
        if (!adPlaying) {
            adsControlButton.style.display = "flex";
        } else {
            adsControlButton.style.display = "none";
        }
    });

    document.body.addEventListener("touchstart", () => {
        clearTimeout(hoverTimeout);
        adsControlButton.style.display = "flex";

        if (adInMobile) {
            hoverTimeout = setTimeout(() => {
                adsControlButton.style.display = "none";
            }, 5000);
        } else {
            adsControlButton.style.display = "none";
        }
    })

    document.body.addEventListener("touchend", () => {
        if (!adPlaying) {
            adsControlButton.style.display = "flex";
        } else {
            if (!adInMobile) {
                adsControlButton.style.display = "none";
            }
        }
    });

    // play pause logic
    const adsPlayButton = document.getElementById('playstream-play-icon');

    adsPlayButton.addEventListener('click', function () {
        if (!adPlaying) {
            adsManager.resume();
            adPlaying = true;
        } else {
            adsManager.pause();
            adPlaying = false;
        }
    });

    // volume control slider
    const slider = document.getElementById("playstream-volume-range");
    const adsVolumeButton = document.getElementById('playstream-volume-icon');

    slider.oninput = function () {
        adsManager.setVolume(this.value / 100);
        if (this.value === "0") {
            adsVolumeButton.innerHTML = '<svg viewBox="-2.5 -2.5 30.00 30.00" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M16 9.50009L21 14.5001M21 9.50009L16 14.5001M4.6 9.00009H5.5012C6.05213 9.00009 6.32759 9.00009 6.58285 8.93141C6.80903 8.87056 7.02275 8.77046 7.21429 8.63566C7.43047 8.48353 7.60681 8.27191 7.95951 7.84868L10.5854 4.69758C11.0211 4.17476 11.2389 3.91335 11.4292 3.88614C11.594 3.86258 11.7597 3.92258 11.8712 4.04617C12 4.18889 12 4.52917 12 5.20973V18.7904C12 19.471 12 19.8113 11.8712 19.954C11.7597 20.0776 11.594 20.1376 11.4292 20.114C11.239 20.0868 11.0211 19.8254 10.5854 19.3026L7.95951 16.1515C7.60681 15.7283 7.43047 15.5166 7.21429 15.3645C7.02275 15.2297 6.80903 15.1296 6.58285 15.0688C6.32759 15.0001 6.05213 15.0001 5.5012 15.0001H4.6C4.03995 15.0001 3.75992 15.0001 3.54601 14.8911C3.35785 14.7952 3.20487 14.6422 3.10899 14.4541C3 14.2402 3 13.9601 3 13.4001V10.6001C3 10.04 3 9.76001 3.10899 9.54609C3.20487 9.35793 3.35785 9.20495 3.54601 9.10908C3.75992 9.00009 4.03995 9.00009 4.6 9.00009Z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>';
        } else {
            adsVolumeButton.innerHTML = '<svg viewBox="-2.5 -2.5 30.00 30.00" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M16.0004 9.00009C16.6281 9.83575 17 10.8745 17 12.0001C17 13.1257 16.6281 14.1644 16.0004 15.0001M18 5.29177C19.8412 6.93973 21 9.33459 21 12.0001C21 14.6656 19.8412 17.0604 18 18.7084M4.6 9.00009H5.5012C6.05213 9.00009 6.32759 9.00009 6.58285 8.93141C6.80903 8.87056 7.02275 8.77046 7.21429 8.63566C7.43047 8.48353 7.60681 8.27191 7.95951 7.84868L10.5854 4.69758C11.0211 4.17476 11.2389 3.91335 11.4292 3.88614C11.594 3.86258 11.7597 3.92258 11.8712 4.04617C12 4.18889 12 4.52917 12 5.20973V18.7904C12 19.471 12 19.8113 11.8712 19.954C11.7597 20.0776 11.594 20.1376 11.4292 20.114C11.239 20.0868 11.0211 19.8254 10.5854 19.3026L7.95951 16.1515C7.60681 15.7283 7.43047 15.5166 7.21429 15.3645C7.02275 15.2297 6.80903 15.1296 6.58285 15.0688C6.32759 15.0001 6.05213 15.0001 5.5012 15.0001H4.6C4.03995 15.0001 3.75992 15.0001 3.54601 14.8911C3.35785 14.7952 3.20487 14.6422 3.10899 14.4541C3 14.2402 3 13.9601 3 13.4001V10.6001C3 10.04 3 9.76001 3.10899 9.54609C3.20487 9.35793 3.35785 9.20495 3.54601 9.10908C3.75992 9.00009 4.03995 9.00009 4.6 9.00009Z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>';
        }
    }

    adsVolumeButton.addEventListener('click', function () {
        if (adsManager.getVolume() === 0) {
            adsManager.setVolume(0.2);
            slider.value = volume ?? 20;
            adsVolumeButton.innerHTML = '<svg viewBox="-2.5 -2.5 30.00 30.00" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M16.0004 9.00009C16.6281 9.83575 17 10.8745 17 12.0001C17 13.1257 16.6281 14.1644 16.0004 15.0001M18 5.29177C19.8412 6.93973 21 9.33459 21 12.0001C21 14.6656 19.8412 17.0604 18 18.7084M4.6 9.00009H5.5012C6.05213 9.00009 6.32759 9.00009 6.58285 8.93141C6.80903 8.87056 7.02275 8.77046 7.21429 8.63566C7.43047 8.48353 7.60681 8.27191 7.95951 7.84868L10.5854 4.69758C11.0211 4.17476 11.2389 3.91335 11.4292 3.88614C11.594 3.86258 11.7597 3.92258 11.8712 4.04617C12 4.18889 12 4.52917 12 5.20973V18.7904C12 19.471 12 19.8113 11.8712 19.954C11.7597 20.0776 11.594 20.1376 11.4292 20.114C11.239 20.0868 11.0211 19.8254 10.5854 19.3026L7.95951 16.1515C7.60681 15.7283 7.43047 15.5166 7.21429 15.3645C7.02275 15.2297 6.80903 15.1296 6.58285 15.0688C6.32759 15.0001 6.05213 15.0001 5.5012 15.0001H4.6C4.03995 15.0001 3.75992 15.0001 3.54601 14.8911C3.35785 14.7952 3.20487 14.6422 3.10899 14.4541C3 14.2402 3 13.9601 3 13.4001V10.6001C3 10.04 3 9.76001 3.10899 9.54609C3.20487 9.35793 3.35785 9.20495 3.54601 9.10908C3.75992 9.00009 4.03995 9.00009 4.6 9.00009Z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>';

            window.parent.postMessage({ type: 'ad-volume-unmute', id }, "*")
        } else {
            adsManager.setVolume(0);
            slider.value = 0;
            adsVolumeButton.innerHTML = '<svg viewBox="-2.5 -2.5 30.00 30.00" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M16 9.50009L21 14.5001M21 9.50009L16 14.5001M4.6 9.00009H5.5012C6.05213 9.00009 6.32759 9.00009 6.58285 8.93141C6.80903 8.87056 7.02275 8.77046 7.21429 8.63566C7.43047 8.48353 7.60681 8.27191 7.95951 7.84868L10.5854 4.69758C11.0211 4.17476 11.2389 3.91335 11.4292 3.88614C11.594 3.86258 11.7597 3.92258 11.8712 4.04617C12 4.18889 12 4.52917 12 5.20973V18.7904C12 19.471 12 19.8113 11.8712 19.954C11.7597 20.0776 11.594 20.1376 11.4292 20.114C11.239 20.0868 11.0211 19.8254 10.5854 19.3026L7.95951 16.1515C7.60681 15.7283 7.43047 15.5166 7.21429 15.3645C7.02275 15.2297 6.80903 15.1296 6.58285 15.0688C6.32759 15.0001 6.05213 15.0001 5.5012 15.0001H4.6C4.03995 15.0001 3.75992 15.0001 3.54601 14.8911C3.35785 14.7952 3.20487 14.6422 3.10899 14.4541C3 14.2402 3 13.9601 3 13.4001V10.6001C3 10.04 3 9.76001 3.10899 9.54609C3.20487 9.35793 3.35785 9.20495 3.54601 9.10908C3.75992 9.00009 4.03995 9.00009 4.6 9.00009Z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>';

            window.parent.postMessage({ type: 'ad-volume-mute', id }, "*")
        }
    });

    // progress bar
    const adsControllerProgressBar = document.querySelector('#playstream-ad-bar div div div');

    // timer
    const countdownUi = document.querySelector('#playstream-ad-bar div span span');

    // full screen
    const adsFullScreenButton = document.getElementById('playstream-fullscreen-icon');

    adsFullScreenButton.addEventListener('click', function () {
        window.parent.postMessage({ type: 'ad-fullscreen', id }, "*")
    })
    // 

    const id = window.frameElement.id;

    const videoElementContainer = window.parent.document.getElementById('playstream-video-player-container');
    const videoElement = videoElementContainer.querySelector('video');
    const videoAdContainer = document.getElementById('playstream-video-ad');

    window.addEventListener('resize', () => {
        if (adsManager) {
            const height = window.frameElement.clientHeight;
            const width = window.frameElement.clientWidth;

            adsManager.resize(width, height, imasdk.ViewMode.NORMAL);
        }
    })

    function adManagerLoadedHandler(adsManagerLoadedEvent) {
        if (sound) {
            adsManagerLoadedEvent.getAdsManager(videoElement).setVolume(20 / 100);
        } else {
            adsManagerLoadedEvent.getAdsManager(videoElement).setVolume(0);
        }

        adsManager = adsManagerLoadedEvent.getAdsManager(videoElement);

        adsManager.addEventListener(imasdk.AdErrorEvent.Type.AD_ERROR, adErrorEventHandler);

        adsManager.addEventListener(imasdk.AdEvent.Type.CONTENT_PAUSE_REQUESTED, onAdDisplayedEventHandler);

        adsManager.addEventListener(imasdk.AdEvent.Type.CONTENT_RESUME_REQUESTED, onAdDisplayedEventHandler);

        adsManager.addEventListener(imasdk.AdEvent.Type.COMPLETE, onAdDisplayedEventHandler);

        adsManager.addEventListener(imasdk.AdEvent.Type.SKIPPED, onAdDisplayedEventHandler);

        adsManager.addEventListener(imasdk.AdEvent.Type.IMPRESSION, onAdDisplayedEventHandler);

        adsManager.addEventListener(imasdk.AdEvent.Type.STARTED, onAdDisplayedEventHandler);

        adsManager.addEventListener(imasdk.AdEvent.Type.PAUSED, onAdDisplayedEventHandler);

        adsManager.addEventListener(imasdk.AdEvent.Type.RESUMED, onAdDisplayedEventHandler);

        adsManager.addEventListener(imasdk.AdEvent.Type.FIRST_QUARTILE, onAdDisplayedEventHandler);

        adsManager.addEventListener(imasdk.AdEvent.Type.MIDPOINT, onAdDisplayedEventHandler);

        adsManager.addEventListener(imasdk.AdEvent.Type.THIRD_QUARTILE, onAdDisplayedEventHandler);

        adsManager.addEventListener(imasdk.AdEvent.Type.CLICK, onAdDisplayedEventHandler);

        window.parent.postMessage({ type: 'ad-loaded', id }, "*")
    }

    function onAdDisplayedEventHandler(adEvent) {
        switch (adEvent.type) {
            case imasdk.AdEvent.Type.IMPRESSION:
                {
                    window.parent.postMessage({ type: 'ad-impression', id }, "*")
                    break;
                }
            case imasdk.AdEvent.Type.STARTED:
                {
                    window.parent.postMessage({ type: 'ad-started', id }, "*")


                    if (adEvent.getAd().isLinear()) {
                        if (countdownTimer || adsProcessController) {
                            clearInterval(countdownTimer);
                            clearInterval(adsProcessController);
                            adsControllerProgressBar.style.width = 0 + "%";
                        }

                        let adDuration = adsManager.getRemainingTime();
                        countdownTimer = setInterval(() => {
                            let remainingTime = adsManager.getRemainingTime();
                            let minutes = Math.floor(remainingTime / 60); // Calculate minutes
                            let seconds = remainingTime % 60; // Calculate remaining seconds
                            countdownUi.innerHTML = `${minutes}:${seconds < 10 ? '0' : ''}${parseInt(seconds)} `;
                        }, 1000);

                        adsProcessController = setInterval(() => {
                            let adTime = adsManager.getRemainingTime();
                            let adProgress = (adDuration - adTime) / adDuration;
                            adsControllerProgressBar.style.width = adProgress * 100 <= 100 ? adProgress * 100 + "%" : 100 + "%";
                        });
                    }

                    break;
                }
            case imasdk.AdEvent.Type.SKIPPED:
                {
                    window.parent.postMessage({ type: 'ad-skip', id }, "*")
                    break;
                }
            case imasdk.AdEvent.Type.COMPLETE:
                {
                    window.parent.postMessage({ type: 'ad-complete', id }, "*")
                    break;
                }
            case imasdk.AdEvent.Type.CONTENT_PAUSE_REQUESTED:
                {
                    adPlaying = true;

                    window.parent.postMessage({ type: 'content-pause', id }, "*")
                    break;
                }
            case imasdk.AdEvent.Type.CONTENT_RESUME_REQUESTED:
                {
                    adPlaying = false;
                    if (adsManager) {
                        adsManager.destroy();
                    }
                    if (adsLoader) {
                        adsLoader.contentComplete();
                    }

                    window.parent.postMessage({ type: 'content-play', id }, "*")
                    break;
                }
            case imasdk.AdEvent.Type.FIRST_QUARTILE:
                {
                    window.parent.postMessage({ type: 'ad-first-quartile', id }, "*")
                    break;
                }
            case imasdk.AdEvent.Type.MIDPOINT:
                {
                    window.parent.postMessage({ type: 'ad-midpoint', id }, "*")
                    break;
                }
            case imasdk.AdEvent.Type.THIRD_QUARTILE:
                {
                    window.parent.postMessage({ type: 'ad-third-quartile', id }, "*")
                    break;
                }
            case imasdk.AdEvent.Type.CLICK:
                {
                    window.parent.postMessage({ type: 'ad-click', id }, "*")
                    break;
                }
            case imasdk.AdEvent.Type.RESUMED:
                {
                    adPlaying = true;

                    if (adPausedTimeout) {
                        clearTimeout(adPausedTimeout);
                        adPausedTimeout = null;
                    }
                    adsPlayButton.innerHTML = '<svg viewBox="-2.5 -2.5 30.00 30.00" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M10 6.42004C10 4.76319 8.65685 3.42004 7 3.42004C5.34315 3.42004 4 4.76319 4 6.42004V18.42C4 20.0769 5.34315 21.42 7 21.42C8.65685 21.42 10 20.0769 10 18.42V6.42004Z" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M20 6.42004C20 4.76319 18.6569 3.42004 17 3.42004C15.3431 3.42004 14 4.76319 14 6.42004V18.42C14 20.0769 15.3431 21.42 17 21.42C18.6569 21.42 20 20.0769 20 18.42V6.42004Z" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>';

                    window.parent.postMessage({ type: 'ad-resumed', id }, "*")
                    break;
                }
            case imasdk.AdEvent.Type.PAUSED:
                {
                    adPlaying = false;

                    adPausedTimeout = setTimeout(() => {
                        window.parent.postMessage({ type: 'ad-paused-timeout', id }, "*")
                    }, 15000);
                    adsPlayButton.innerHTML = '<svg viewBox="-2.5 -2.5 30.00 30.00" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M5.46484 3.92349C4.79896 3.5739 4 4.05683 4 4.80888V19.1911C4 19.9432 4.79896 20.4261 5.46483 20.0765L19.1622 12.8854C19.8758 12.5108 19.8758 11.4892 19.1622 11.1146L5.46484 3.92349ZM2 4.80888C2 2.55271 4.3969 1.10395 6.39451 2.15269L20.0919 9.34382C22.2326 10.4677 22.2325 13.5324 20.0919 14.6562L6.3945 21.8473C4.39689 22.8961 2 21.4473 2 19.1911V4.80888Z" fill="#ffffff"></path> </g></svg>';

                    window.parent.postMessage({ type: 'ad-paused', id }, "*")
                    break;
                }

        }
    }

    function adErrorEventHandler(event) {
        if (adsManager) {
            adsManager.destroy();
        }
        if (adsLoader) {
            adsLoader.contentComplete();
        }
        window.parent.postMessage({ type: 'ad-error', id }, "*")
    }

    function unMutePlayer() {
        sound = true;
        updateControlPannel();

        if (adsManager) {
            adsManager.setVolume((volume ?? 20) / 100);
        }
    }

    window.addEventListener('message', (event) => {
        const { data } = event;
        if (data.type === 'ad-play') {
            displayAds(data.fullscreen, data.sound);
        } else if (data.type === 'ad-request') {
            init({ adTagUrl: data.tag, adSound: data.sound, adVolume: data.volume, adInMobile: data.inmobile });
        } else if (data.type === 'dom-unmute') {
            unMutePlayer();
        }
    })

    function displayAds(fullscreen, adSound) {
        if (!adsManager) {
            (console.warn || console.log)('Ads Manager not found');
            return;
        }

        if (adSound) {
            adsManager.setVolume((volume ?? 20) / 100);
        } else {
            adsManager.setVolume(0);
        }

        const height = window.frameElement.clientHeight;
        const width = window.frameElement.clientWidth;

        adDisplayContainer.initialize();
        adsManager.init(width, height, fullscreen ? imasdk.ViewMode.FULLSCREEN : imasdk.ViewMode.NORMAL);
        adsManager.start();
    }

    function updateControlPannel() {
        if (sound) {
            slider.value = volume ?? 20;
            adsVolumeButton.innerHTML = '<svg viewBox="-2.5 -2.5 30.00 30.00" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M16.0004 9.00009C16.6281 9.83575 17 10.8745 17 12.0001C17 13.1257 16.6281 14.1644 16.0004 15.0001M18 5.29177C19.8412 6.93973 21 9.33459 21 12.0001C21 14.6656 19.8412 17.0604 18 18.7084M4.6 9.00009H5.5012C6.05213 9.00009 6.32759 9.00009 6.58285 8.93141C6.80903 8.87056 7.02275 8.77046 7.21429 8.63566C7.43047 8.48353 7.60681 8.27191 7.95951 7.84868L10.5854 4.69758C11.0211 4.17476 11.2389 3.91335 11.4292 3.88614C11.594 3.86258 11.7597 3.92258 11.8712 4.04617C12 4.18889 12 4.52917 12 5.20973V18.7904C12 19.471 12 19.8113 11.8712 19.954C11.7597 20.0776 11.594 20.1376 11.4292 20.114C11.239 20.0868 11.0211 19.8254 10.5854 19.3026L7.95951 16.1515C7.60681 15.7283 7.43047 15.5166 7.21429 15.3645C7.02275 15.2297 6.80903 15.1296 6.58285 15.0688C6.32759 15.0001 6.05213 15.0001 5.5012 15.0001H4.6C4.03995 15.0001 3.75992 15.0001 3.54601 14.8911C3.35785 14.7952 3.20487 14.6422 3.10899 14.4541C3 14.2402 3 13.9601 3 13.4001V10.6001C3 10.04 3 9.76001 3.10899 9.54609C3.20487 9.35793 3.35785 9.20495 3.54601 9.10908C3.75992 9.00009 4.03995 9.00009 4.6 9.00009Z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>';
        }
    }

    function init({ adTagUrl, adSound, adVolume, adInMobile: inmobile }) {
        if (!imasdk) {
            (console.warn || console.log)('IMA SDK not found');
            return;
        }

        adInMobile = inmobile;
        volume = adVolume;
        sound = adSound;
        updateControlPannel();

        imasdk.settings.setDisableCustomPlaybackForIOS10Plus(true);
        imasdk.settings.setVpaidMode(imasdk.ImaSdkSettings.VpaidMode.ENABLED);

        adDisplayContainer = new imasdk.AdDisplayContainer(videoAdContainer, videoElement);
        adsLoader = new imasdk.AdsLoader(adDisplayContainer);

        adsLoader.getSettings().setVpaidMode(imasdk.ImaSdkSettings.VpaidMode.INSECURE);

        adsLoader.addEventListener(imasdk.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, adManagerLoadedHandler, false);
        adsLoader.addEventListener(imasdk.AdErrorEvent.Type.AD_ERROR, adErrorEventHandler, false);

        adsRequest = new imasdk.AdsRequest();
        adsRequest.adTagUrl = adTagUrl;
        adsRequest.linearAdSlotWidth = window.frameElement.clientWidth;
        adsRequest.linearAdSlotHeight = window.frameElement.clientHeight;
        adsRequest.nonLinearAdSlotWidth = window.frameElement.clientWidth;
        adsRequest.nonLinearAdSlotHeight = window.frameElement.clientHeight;
        adsRequest.pageUrl = window.parent.location.href;
        adsRequest.contentDuration = videoElement?.duration;
        adsRequest.vastLoadTimeout = 18000;

        adsLoader.requestAds(adsRequest);
    }

})(window)