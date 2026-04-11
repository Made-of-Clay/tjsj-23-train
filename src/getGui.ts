import GUI from "lil-gui";

let gui: GUI;

export const guiConf = {
    showStats: false,
};

export function getGui() {
    const urlParams = new URLSearchParams(window.location.search);
    const showGui = urlParams.has("gui");

    if (!showGui) return null;

    if (!gui) gui = new GUI({ title: "🐞 Debug GUI", width: 300 });

    return gui;
}
