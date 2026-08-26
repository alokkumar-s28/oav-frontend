/**
 * Class VI Study Room - OAV Mantra
 */
function bootStudyRoom() {
    const engine = window.studyEngine || (typeof studyEngine !== 'undefined' ? studyEngine : null);
    if (engine && typeof engine.init === 'function') {
        engine.init("VI");
    } else {
        setTimeout(bootStudyRoom, 50);
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootStudyRoom);
} else {
    bootStudyRoom();
}
