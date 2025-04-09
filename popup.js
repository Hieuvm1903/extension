document.getElementById("saveTabs").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "saveTabs" });
});

document.getElementById("openTabs").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "openSavedTabs" });
});
document.getElementById("loginTwitter").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "loginTwitter" });
});
document.getElementById("loginGoogle").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "loginGoogle" });
});

document.addEventListener("DOMContentLoaded", () => {
    loadHexList();
    document.getElementById("clearHex").addEventListener("click", clearHexStorage);
});
function loadHexList() {
    chrome.storage.local.get("hexStrings", (data) => {
        let list = document.getElementById("hexList");
        list.innerHTML = "";
        (data.hexStrings || []).forEach(item => {
            let li = document.createElement("li");
            li.textContent = `${item.hex} (Saved: ${new Date(item.time).toLocaleString()})`;
            li.dataset.url = item.decoded;
            li.ondblclick = () => {
                chrome.runtime.sendMessage({ action: "openIncognito", url: li.dataset.url });
            };
            list.appendChild(li);
        });
    });
}

function clearHexStorage() {
    chrome.storage.local.set({ hexStrings: [] }, loadHexList);
}