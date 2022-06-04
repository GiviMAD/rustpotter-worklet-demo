const { NoiseDetectionMode } = require('rustpotter-worklet');

/** @typedef { import('rustpotter-worklet').RustpotterService } RustpotterService */
(async () => {
    const USER_NAME = "rustpotter@Demo";
    let state = {
        selectedWakeword: null,
        selectedWakewordBytes: null,
        selectedThreshold: 0.5,
        selectedAvgThreshold: 0.2,
        selectedNoiseDectection: null,
        eagerMode: true,
        /**
         * @type {RustpotterService}
         */
        rustpotterService: null,
    };
    window.addEventListener('load', onWindowsLoad());
    try {
        await checkRecordCapabilities();
        document.querySelector("#wakeword_selector").addEventListener('change', onWakewordSelectionChange);
        document.querySelector("#wakeword_threshold").addEventListener('input', onThresholdInput);
        document.querySelector("#wakeword_avg_threshold").addEventListener('input', onAvgThresholdInput);
        // document.querySelector("#noise_detection_selector").addEventListener('change', onNoiseDetectionChange);
        document.querySelector("#eager_mode").addEventListener('input', onEagerModeChecked);
        document.querySelector("#record").addEventListener('click', onRecordClick);
        document.querySelector("#pause").addEventListener('click', onPauseClick);
        document.querySelector("#stop").addEventListener('click', onStopClick());
    } catch (error) {
        printError(error.message ?? error);
    }
    // event listeners
    function onThresholdInput(ev) {
        state.selectedThreshold = ev.target.value;
    }
    function onAvgThresholdInput(ev) {
        state.selectedAvgThreshold = ev.target.value;
    }
    function onEagerModeChecked(ev) {
        state.eagerMode = ev.target.checked;
    }
    function onStopClick() {
        return async () => {
            enableButtons(false);
            state.rustpotterService.stop().then(state.rustpotterService.close()).then(() => {
                state.rustpotterService = null;
                enableElement('record');
                enableOptions(true);
            }).catch(err => {
                printError(err.message ?? err);
            });
        };
    }
    function onPauseClick() {
        enableButtons(false);
        state.rustpotterService.pause().then(() => {
            enableElement('record');
        }).catch(err => {
            printError(err.message ?? err);
        });
    }
    async function onRecordClick() {
        try {
            const { RustpotterService } = await import("rustpotter-worklet");
            enableElement("record", false);
            enableOptions(false);
            if (state.rustpotterService != null) {
                state.rustpotterService.resume();
                enableElement("pause");
                enableElement("stop");
                return;
            }
            const wasmModuleUrl = new URL('../node_modules/rustpotter-worklet/dist/rustpotter_wasm_bg.wasm', import.meta.url);
            const workletModuleUrl = new URL('../node_modules/rustpotter-worklet/dist/rustpotterWorklet.js', import.meta.url);
            state.rustpotterService = new RustpotterService({
                workletPath: workletModuleUrl.href,
                wasmPath: wasmModuleUrl.href,
                averagedThreshold: state.selectedAvgThreshold,
                threshold: state.selectedThreshold,
                eagerMode: state.eagerMode,
                noiseMode: state.selectedNoiseDectection,
                noiseSensitivity: 0.5,
            });
            state.rustpotterService.onspot = (name, score) => {
                printLog(`detection: '${name}'[${score}]`);
            };
            state.rustpotterService.onstart = function () {
                printLog('rustpotterService is started');
            };

            state.rustpotterService.onstop = function () {
                printLog('rustpotterService is stopped');
            };

            state.rustpotterService.onpause = function () {
                printLog('rustpotterService is paused');
            };
            state.rustpotterService.onresume = function () {
                printLog('rustpotterService is resumed');
            };
            await state.rustpotterService.start();
            if (state.selectedWakeword == 'manual') {
                state.rustpotterService.addWakeword(state.selectedWakewordBytes);
            } else {
                state.rustpotterService.addWakewordByPath(state.selectedWakeword);
            }
            enableElement("pause");
            enableElement("stop");
        } catch (error) {
            printError(error.message ?? err);
        }
    }
    function onNoiseDetectionChange(ev) {
        const selected_value = ev.target.value;
        if (selected_value == "none") {
            state.selectedNoiseDectection = null;
        } else {
            let mode = null;
            switch (selected_value) {
                case "Easiest":
                    mode = NoiseDetectionMode.easiest;
                    break;
                case "Easy":
                    mode = NoiseDetectionMode.easy;
                    break;
                case "Normal":
                    mode = NoiseDetectionMode.normal;
                    break;
                case "Hard":
                    mode = NoiseDetectionMode.hard;
                    break;
                case "Hardest":
                    mode = NoiseDetectionMode.hardest;
                    break;
            }
            state.selectedNoiseDectection = mode;
        }
    }
    function onWakewordSelectionChange(ev) {
        const selected_value = ev.target.value;
        state.selectedWakewordBytes = null;
        if (selected_value == "manual") {
            enableButtons(false);
            const wakeword_panel = document.querySelector("#wakeword_input_container");
            wakeword_panel.innerHTML += '<input id="wakeword_input" type="file" accept=".rpw">';
            document.querySelector("#wakeword_input").addEventListener('change', onFileInputChange);
        } else {
            let input = document.querySelector("#wakeword_input");
            if (input) input.remove();
            enableElement('record');
        }
        state.selectedWakeword = selected_value;
    }
    function onFileInputChange(evt) {
        const reader = new FileReader();
        reader.onload = function () {
            state.selectedWakewordBytes = this.result;
            enableElement('record');
        };
        reader.onerror = function () {
            printError("Unable to read wakeword file.");
            enableButtons(false);
        };
        reader.readAsArrayBuffer(this.files[0]);
    }

    function onWindowsLoad() {
        printLog("loading available wakewords...");
        enableButtons(false);
        enableOptions(false);
        fetch("wakewords.json")
            .then((resp) => resp.json())
            .then((wakewords) => {
                const wakeword_selector = document.querySelector("#wakeword_selector");
                const wakewordEntries = Object.entries(wakewords);
                wakewordEntries.forEach((entry) => {
                    wakeword_selector.innerHTML += '<option value="' + entry[1] + '">' + entry[0] + '</option>';
                });
                wakeword_selector.innerHTML += '<option value="manual">from file...</option>';
                state.selectedWakeword = wakewordEntries[0][1];
                wakeword_selector.disabled = false;
                enableOptions(true);
                enableElement('record');
                printLog("wakewords list loaded");
            })
            .catch(err => {
                printError(err.message ?? err);
                enableButtons(false);
            });
    }

    // utils
    async function checkRecordCapabilities() {
        const { RustpotterService } = await import("rustpotter-worklet");
        if (!RustpotterService.isRecordingSupported()) {
            const errorMessage = "Unable to record in this browser :(";
            alert(errorMessage);
            throw new Error(errorMessage);
        }
    }
    function enableElement(id, enabled = true) {
        document.querySelector("#" + id).disabled = !enabled;
    }
    function enableOptions(enabled) {
        document.querySelector("#wakeword_panel")
            .querySelectorAll("input,select")
            .forEach(btn => btn.disabled = !enabled);
    }
    function enableButtons(enabled) {
        document.querySelector("#btn_panel")
            .querySelectorAll("button")
            .forEach(btn => btn.disabled = !enabled);
    }
    function printLog(str) {
        console.log(str);
        var el = document.querySelector("#terminal");
        el.innerHTML += '<span style="color: grey">' + USER_NAME + '</span> % <span class="ok">' + str + '</span><br>';
        el.parentElement.scrollTop = el.parentElement.scrollHeight;
    }
    function printError(str) {
        console.error(str);
        var el = document.querySelector("#terminal");
        el.innerHTML += '<span style="color: grey">' + USER_NAME + '</span> % <span class="error">' + str + '</span><br>';
        el.parentElement.scrollTop = el.parentElement.scrollHeight;
    }
})();
