import { RustpotterService, ScoreMode } from "rustpotter-worklet";

(async () => {
    const USER_NAME = "rustpotter@Demo";
    const state = {
        selectedWakeword: null as string | null,
        selectedWakewordBytes: null as ArrayBuffer | null,
        selectedThreshold: 0.5,
        selectedAvgThreshold: 0.2,
        gainNormalizer: false,
        minGain: 0.5,
        maxGain: 1,
        gainRef: null as number | null,
        bandPass: false,
        bandPassLowCutoff: 80 as number | null,
        bandPassHighCutoff: 400 as number | null,
        scoreMode: ScoreMode.max,
        minScores: 10,
        rustpotterService: null as RustpotterService | null,
    };
    window.addEventListener('load', onWindowsLoad, { once: true });
    try {
        await checkRecordCapabilities();
        document.querySelector("#wakeword_selector")?.addEventListener('change', onWakewordSelectionChange);
        document.querySelector("#wakeword_threshold")?.addEventListener('input', onThresholdInput);
        document.querySelector("#wakeword_avg_threshold")?.addEventListener('input', onAvgThresholdInput);
        document.querySelector("#score_mode_selector")?.addEventListener('change', onScoreModeChange);
        document.querySelector("#min_scores")?.addEventListener('input', onMinScoresInput);
        document.querySelector("#gain_normalizer_check")?.addEventListener('input', onGainNormalizerChecked);
        document.querySelector("#min_gain")?.addEventListener('input', onMinGainInput);
        document.querySelector("#max_gain")?.addEventListener('input', onMaxGainInput);
        document.querySelector("#gain_ref")?.addEventListener('input', onGainRefInput);
        document.querySelector("#band_pass_check")?.addEventListener('input', onBandPassChecked);
        document.querySelector("#low_cutoff")?.addEventListener('input', onBandPassLowCutoffInput);
        document.querySelector("#high_cutoff")?.addEventListener('input', onBandPassHighCutoffInput);
        document.querySelector("#record")?.addEventListener('click', onRecordClick);
        document.querySelector("#pause")?.addEventListener('click', onPauseClick);
        document.querySelector("#stop")?.addEventListener('click', onStopClick());
    } catch (error) {
        onError(error);
    }
    // event listeners
    function onThresholdInput(ev: Event) {
        state.selectedThreshold = Number((ev.target as HTMLInputElement).value);
    }
    function onAvgThresholdInput(ev: Event) {
        state.selectedAvgThreshold = Number((ev.target as HTMLInputElement).value);
    }
    function onMinScoresInput(ev: Event) {
        const value = (ev.target as HTMLInputElement).value;
        const numberValue = Number((ev.target as HTMLInputElement).value?.trim());
        state.minScores = value != null && value.length && !isNaN(numberValue) ? numberValue : 0;
        validateInputs();
    }
    function onGainNormalizerChecked(ev: Event) {
        state.gainNormalizer = (ev.target as HTMLInputElement).checked;
        if (state.gainNormalizer) {
            document.querySelector("#gain_normalizer_options")?.classList.remove("hidden");
        } else {
            document.querySelector("#gain_normalizer_options")?.classList.add("hidden");
        }
        validateInputs();
    }
    function onMinGainInput(ev: Event) {
        state.minGain = Number((ev.target as HTMLInputElement).value);
    }
    function onMaxGainInput(ev: Event) {
        state.maxGain = Number((ev.target as HTMLInputElement).value);
    }
    function onGainRefInput(ev: Event) {
        const value = (ev.target as HTMLInputElement).value;
        const numberValue = Number((ev.target as HTMLInputElement).value?.trim());
        state.gainRef = value != null && value.length && !isNaN(numberValue) ? numberValue : null;
        validateInputs();
    }
    function onBandPassChecked(ev: Event) {
        state.bandPass = (ev.target as HTMLInputElement).checked;
        if (state.bandPass) {
            document.querySelector("#band_pass_options")?.classList.remove("hidden");
        } else {
            document.querySelector("#band_pass_options")?.classList.add("hidden");
        }
        validateInputs();
    }
    function onBandPassLowCutoffInput(ev: Event) {
        const value = (ev.target as HTMLInputElement).value;
        const numberValue = Number((ev.target as HTMLInputElement).value?.trim());
        state.bandPassLowCutoff = value != null && value.length && !isNaN(numberValue) ? numberValue : null;
        validateInputs();
    }
    function onBandPassHighCutoffInput(ev: Event) {
        const value = (ev.target as HTMLInputElement).value;
        const numberValue = Number((ev.target as HTMLInputElement).value?.trim());
        state.bandPassHighCutoff = value != null && value.length && !isNaN(numberValue) ? numberValue : null;
        validateInputs();
    }
    function onStopClick() {
        return async () => {
            enableButtons(false);
            state.rustpotterService?.stop().then(() => state.rustpotterService?.close()).then(() => {
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
        state.rustpotterService?.pause().then(() => {
            enableElement('record');
        }).catch(err => {
            printError(err.message ?? err);
        });
    }
    async function onRecordClick() {
        try {
            enableElement("record", false);
            enableOptions(false);
            if (state.rustpotterService != null) {
                state.rustpotterService.resume();
                enableElement("pause");
                enableElement("stop");
                return;
            }
            const wasmModuleUrl = new URL('../node_modules/rustpotter-worklet/dist/rustpotter_wasm_bg.wasm', import.meta.url);
            const workletModuleUrl = new URL('../node_modules/rustpotter-worklet/dist/rustpotter-worklet.min.js', import.meta.url);
            state.rustpotterService = new RustpotterService({
                workletPath: workletModuleUrl.href,
                wasmPath: wasmModuleUrl.href,
                averagedThreshold: state.selectedAvgThreshold,
                threshold: state.selectedThreshold,
                scoreMode: state.scoreMode,
                minScores: state.minScores,
                gainNormalizerEnabled: state.gainNormalizer,
                minGain: state.minGain,
                maxGain: state.maxGain,
                gainRef: state.gainRef ?? undefined,
                bandPassEnabled: state.bandPass,
                bandPassLowCutoff: state.bandPassLowCutoff ?? 80,
                bandPassHighCutoff: state.bandPassHighCutoff ?? 400,
            });
            state.rustpotterService.onspot = (detection) => {
                const currDate = new Date();
                let hour = `${currDate.getHours().toString().padStart(2, "0")}:${currDate.getMinutes().toString().padStart(2, "0")}:${currDate.getSeconds().toString().padStart(2, "0")}`;
                printLog(`[T${hour}] ${JSON.stringify(detection)}`);
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
                if (state.selectedWakewordBytes) await state.rustpotterService.addWakeword(state.selectedWakewordBytes);
            } else {
                if (state.selectedWakeword) await state.rustpotterService.addWakewordByPath(state.selectedWakeword);
            }
            enableElement("pause");
            enableElement("stop");
        } catch (error) {
            onError(error);
        }
    }
    function onScoreModeChange(ev: Event) {
        const selected_value = (ev.target as HTMLSelectElement).value;
        switch (selected_value) {
            case "Avg":
                state.scoreMode = ScoreMode.avg;
                break;
            case "Median":
                state.scoreMode = ScoreMode.median;
                break;
            case "Max":
                state.scoreMode = ScoreMode.max;
                break;
            case "P25":
                state.scoreMode = ScoreMode.p25;
                break;
            case "P50":
                state.scoreMode = ScoreMode.p50;
                break;
            case "P75":
                state.scoreMode = ScoreMode.p75;
                break;
            case "P80":
                state.scoreMode = ScoreMode.p80;
                break;
            case "P90":
                state.scoreMode = ScoreMode.p90;
                break;
            case "P95":
                state.scoreMode = ScoreMode.p95;
                break;
        }
    }
    function onWakewordSelectionChange(ev: Event) {
        const selected_value = (ev.target as HTMLSelectElement).value;
        state.selectedWakewordBytes = null;
        if (selected_value == "manual") {
            enableButtons(false);
            const wakeword_panel = document.querySelector("#wakeword_input_container");
            if (wakeword_panel)
                wakeword_panel.innerHTML += '<input id="wakeword_input" type="file" accept=".rpw">';
            document.querySelector("#wakeword_input")?.addEventListener('change', onFileInputChange);
        } else {
            document.querySelector("#wakeword_input")?.remove();
            enableElement('record');
        }
        state.selectedWakeword = selected_value;
    }
    function onFileInputChange(this: HTMLInputElement, _: Event) {
        const reader = new FileReader();
        reader.onload = function () {
            state.selectedWakewordBytes = this.result as ArrayBuffer;
            enableElement('record');
        };
        reader.onerror = function () {
            printError("Unable to read wakeword file.");
            enableButtons(false);
        };
        if (this.files)
            reader.readAsArrayBuffer(this.files[0]);
    }
    function validateInputs() {
        const inputIds = [
            "min_scores",
        ];
        if (state.gainNormalizer) {
            inputIds.push('gain_ref');
        }
        if (state.bandPass) {
            inputIds.push('low_cutoff');
            inputIds.push('high_cutoff');
        }
        enableElement('record', inputIds.every(id => document.querySelector<HTMLInputElement>(`#${id}`)?.validity.valid));
    }
    function onWindowsLoad() {
        printLog("this is a demo web site for testing the library spot capabilities");
        printLog("loading available wakewords...");
        enableButtons(false);
        enableOptions(false);
        const versionLink = document.querySelector<HTMLAnchorElement>("#rustpotter_version");
        if (versionLink) {
            versionLink.innerHTML = "rustpotter-v" + APP_VERSION;
            versionLink.href = "https://github.com/GiviMAD/rustpotter-cli/releases/tag/v" + APP_VERSION;
        }
        fetch("wakewords.json")
            .then((resp) => resp.json())
            .then((wakewords: { [key: string]: string }) => {
                const wakeword_selector = document.querySelector<HTMLSelectElement>("#wakeword_selector");
                const wakewordEntries = Object.entries(wakewords);
                if (wakeword_selector) {
                    wakewordEntries.forEach((entry) => {
                        wakeword_selector.innerHTML += '<option value="' + entry[1] + '">' + entry[0] + '</option>';
                    });
                    wakeword_selector.innerHTML += '<option value="manual">from file...</option>';
                    state.selectedWakeword = wakewordEntries[0][1];
                    wakeword_selector.disabled = false;
                }
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
    function enableElement(id: string, enabled = true) {
        const el = document.querySelector<any>("#" + id);
        if (el)
            el.disabled = !enabled;
    }
    function enableOptions(enabled: boolean) {
        document.querySelector("#wakeword_panel")
            ?.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input,select")
            .forEach(el => el.disabled = !enabled);
    }
    function enableButtons(enabled: boolean) {
        document.querySelector("#btn_panel")
            ?.querySelectorAll("button")
            .forEach(btn => btn.disabled = !enabled);
    }
    function printLog(str: string) {
        console.log(str);
        const el = document.querySelector("#terminal");
        if (!el) return;
        el.innerHTML += '<span style="color: grey">' + USER_NAME + '</span> % <span class="ok">' + str + '</span><br>';
        if (el.parentElement)
            el.parentElement.scrollTop = el.parentElement.scrollHeight;
    }
    function printError(str: string, log = true) {
        if (log) console.error(str);
        const el = document.querySelector<HTMLDivElement>("#terminal");
        if (!el) return;
        el.innerHTML += '<span style="color: grey">' + USER_NAME + '</span> % <span class="error">' + str + '</span><br>';
        if (el.parentElement)
            el.parentElement.scrollTop = el.parentElement.scrollHeight;
    }
    function onError(error: Error | string | unknown) {
        console.error(error);
        printError(error instanceof Error ? "unexpected error:" + error.message : error + '', false);
    }
})();
