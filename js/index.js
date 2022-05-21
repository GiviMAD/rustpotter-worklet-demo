(async () => {
    const wasmModuleUrl = new URL('../node_modules/rustpotter-worklet/dist/rustpotter_wasm_bg.wasm', import.meta.url);
    const workletModuleUrl = new URL('../node_modules/rustpotter-worklet/dist/rustpotterWorklet.js', import.meta.url);
    try {
        const { RustpotterService } = await import("rustpotter-worklet");
        if (!RustpotterService.isRecordingSupported()) {
            alert("Unable to record in this browser :(");
        }
        var el = document.querySelector("#record");
        el.addEventListener('click', async () => {
            var rustpotterService = new RustpotterService({
                workletPath: workletModuleUrl.href,
                wasmPath: wasmModuleUrl.href,
                averagedThreshold: 0.25,
                threshold: 0.662,
            });
            rustpotterService.onspot = (name, score) => {
                console.log(`detection: '${name}'[${score}]`);
            };
            rustpotterService.onstart = function () {
                console.info('rustpotterService is started');
            };

            rustpotterService.onstop = function () {
                console.info('rustpotterService is stopped');
            };

            rustpotterService.onpause = function () {
                console.info('rustpotterService is paused');
            };

            rustpotterService.onresume = function () {
                console.info('rustpotterService is resuming');
            };
            rustpotterService
                .start()
                .then(() => rustpotterService.addWakewordByPath("wakeword.rpw"))
                .catch(err => console.error(err));
        });
    } catch (error) {
        console.error(error);
    }
})();

