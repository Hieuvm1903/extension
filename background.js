chrome.runtime.onInstalled.addListener(() => {
    // Create a top-level menu for better visibility
    chrome.contextMenus.create({
        id: "mainMenu",
        title: "🔥 Quick Actions",
        contexts: ["all"]
    });

    // Add individual menu items under the top-level menu
    const menuItems = [
        { id: "convertHex", title: "🔀 Convert Hex & Open (Incognito)", contexts: ["selection"] },
        { id: "saveTabs", title: "💾 Save Open Tabs", contexts: ["all"] },
        { id: "openSavedTabs", title: "🔓 Open Saved Tabs (Incognito)", contexts: ["all"] },
        { id: "loginTwitter", title: "🐦 Login to Twitter with Google", contexts: ["all"] },
        { id: "searchText", title: "🔍 Search in Incognito", contexts: ["selection"] }
    ];

    // Attach them under the main menu
    menuItems.forEach(item => chrome.contextMenus.create({ ...item, parentId: "mainMenu" }));

    // Force Chrome to refresh menu so it stays on top
    setTimeout(() => {
        chrome.contextMenus.update("mainMenu", { visible: false }, () => {
            chrome.contextMenus.update("mainMenu", { visible: true });
        });
    }, 100);
});

// Handle menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "convertHex") {
        try{
            let decoded = hexToString(info.selectionText.trim());
            if (isValidUrl(decoded)) {
                openInIncognito(decoded);
                saveHexString(decoded)
            }
        }
        catch{
console.log("bruh")
        }
      
    } 
    else if (info.menuItemId === "saveTabs") {
        saveTabs();
    } 
    else if (info.menuItemId === "openSavedTabs") {
        openSavedTabs();
    } 
    else if (info.menuItemId === "loginTwitter") {
        loginToTwitter();
    } 
    else if (info.menuItemId === "searchText") {
        openInIncognito("https://www.google.com/search?q=" + encodeURIComponent(info.selectionText));
    } 
    
});
function isValidUrl(string) {
    try {
        let url = new URL(string);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
        return false;
    }
}

// Convert hex to string
function hexToString(hex) {
    hex = hex.replace(/[-\s]/g, ""); // Remove dashes and spaces
    let raw = [];

    for (let i = 0; i < hex.length; i += 2) {
        try {
            raw.push(String.fromCharCode(parseInt(hex.substr(i, 2), 16)));
        } catch (e) {
            // Ignore errors, just like your C# code does
        }
    }

    return raw.join(""); // Convert array to string
}
function saveHexString(decoded) {
    chrome.storage.local.get("hexStrings", (data) => {
        let hexStrings = data.hexStrings || [];
        hexStrings.unshift({ decoded, time: new Date().toISOString() });
        chrome.storage.local.set({ hexStrings });
    });
}

// Open URL in incognito mode
function openInIncognito(url) {
    
    chrome.windows.getAll({ populate: true }, (windows) => {
        let incognitoWindow = windows.find(w => w.incognito);
        if (incognitoWindow) {
            chrome.tabs.create({ windowId: incognitoWindow.id, url: url });
        } else {
            chrome.windows.create({ url: url, incognito: true });
        }
    });
    navigator.clipboard.writeText(url);
}

// Save all open tabs
function saveTabs() {
    chrome.tabs.query({}, (tabs) => {
        let tabUrls = tabs.map(tab => tab.url);
        chrome.storage.local.set({ savedTabs: { date: new Date().toISOString(), urls: tabUrls } });
        console.log("Tabs saved!");
    });
}

// Open saved tabs in incognito
function openSavedTabs() {
    chrome.storage.local.get("savedTabs", (data) => {
        if (data.savedTabs && data.savedTabs.urls.length > 0) {
            chrome.windows.getAll({ populate: true }, (windows) => {
                let incognitoWindow = windows.find(w => w.incognito);
                
                if (incognitoWindow) {
                    // Open tabs in existing incognito window
                    data.savedTabs.urls.forEach(url => {
                        chrome.tabs.create({ windowId: incognitoWindow.id, url: url });
                    });
                } else {
                    // Create new incognito window with all URLs
                    chrome.windows.create({ url: data.savedTabs.urls, incognito: true });
                }
            });
        } else {
            console.warn("No saved tabs found.");
        }
    });
}

function loginToTwitter() {
    chrome.windows.getAll({ populate: true }, (windows) => {
        let incognitoWindow = windows.find(w => w.incognito);

        if (incognitoWindow) {
            // Find an existing Twitter tab
            chrome.tabs.query({ windowId: incognitoWindow.id }, (tabs) => {
                let twitterTab = tabs.find(tab => tab.url.includes("twitter.com"));

                if (twitterTab) {
                    // If Twitter tab already exists, activate and login
                    chrome.tabs.update(twitterTab.id, { active: true });
                    login({ tabs: [twitterTab] });
                } else {
                    // Open Twitter in existing incognito window
                    chrome.tabs.create({ windowId: incognitoWindow.id, url: "https://twitter.com/i/flow/login" }, login);
                }
            });
        } else {
            // Open Twitter in a new incognito window
            chrome.windows.create({ url: "https://twitter.com/i/flow/login", incognito: true }, login);
        }
    });
}

const login = (win) => {
    if (!win.tabs || win.tabs.length === 0) {
        console.error("No tabs found in the incognito window.");
        return;
    }
    
    // Click "Login with Google"
    chrome.scripting.executeScript({
        target: { tabId: win.tabs[0].id },
        function: clickGoogleLogin
    });

    // Wait for Google login popup
    const onWindowCreated = (newWin) => {
        let email = "nhokbiniuzyn@gmail.com";
        let password = "High_Evolut10n";    
        chrome.windows.onCreated.removeListener(onWindowCreated); // Remove listener after triggering
        setTimeout(() => {
            chrome.scripting.executeScript({
                target: { tabId: newWin.tabs[0].id },
                function: fillGoogleLogin,
                args: [email, password]
            });
        }, 3000); // Wait for login form to load
    };

    chrome.windows.onCreated.addListener(onWindowCreated);
};

function clickGoogleLogin() {
    const waitForGoogleLoginButton = () => {
        let googleLoginBtn = [...document.querySelectorAll("div[role='button']")]
            .find(el => el.innerText.includes("Google"));

        if (googleLoginBtn) {
            googleLoginBtn.click();
            console.log("Clicked 'Sign in with Google' button.");
        } else {
            console.log("Google login button not found yet, retrying...");
            setTimeout(waitForGoogleLoginButton, 1000);
        }
    };

    setTimeout(waitForGoogleLoginButton, 2000);
}

function fillGoogleLogin(email, password) {
    function clickGotIt() {
        let gotItButton = [...document.querySelectorAll("button")]
            .find(btn => btn.innerText.includes("Got it"));
        if (gotItButton) {
            gotItButton.click();
            console.log("Clicked 'Got it' button.");
        }
    }

    function fillField(selector, value) {
        let input = document.querySelector(selector);
        if (input) {
            input.value = value;
            input.dispatchEvent(new Event("input", { bubbles: true }));
        }
    }

    function clickNextButton() {
        let nextButton = [...document.querySelectorAll("button")]
            .find(btn => btn.innerText.includes("Next"));
        if (nextButton) nextButton.click();
    }

    setTimeout(clickGotIt, 500);
    setTimeout(() => fillField('input[type="email"]', email), 1000);
    setTimeout(clickNextButton, 2000);
    setTimeout(() => fillField('input[type="password"]', password), 4000);
    setTimeout(clickNextButton, 5000);
}
