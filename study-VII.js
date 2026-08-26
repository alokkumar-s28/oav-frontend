/**
 * Class VII Study Room - OAV Mantra
 */
function bootStudyRoom() {
    const engine = window.studyEngine || (typeof studyEngine !== 'undefined' ? studyEngine : null);
    if (engine && typeof engine.init === 'function') {
        engine.init("VII");
    } else {
        setTimeout(bootStudyRoom, 50);
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootStudyRoom);
} else {
    bootStudyRoom();
}
