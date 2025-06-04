const EMAIL = "nhokbiniuzyn@gmail.com";
const PASSWORD = "High_Evolut10n";

chrome.runtime.onInstalled.addListener(() => {
  // Create a top-level menu for better visibility
  chrome.contextMenus.create({
    id: "mainMenu",
    title: "🔥 Quick Actions",
    contexts: ["all"],
  });

  // Add individual menu items under the main menu
  const menuItems = [
    {
      id: "convertHex",
      title: "🔀 Convert Hex & Open (Incognito)",
      contexts: ["selection"],
    },
    { id: "saveTabs", title: "💾 Save Open Tabs", contexts: ["all"] },
    {
      id: "openSavedTabs",
      title: "🔓 Open Saved Tabs (Incognito)",
      contexts: ["all"],
    },
    {
      id: "loginTwitter",
      title: "🐦 Login to Twitter with Google",
      contexts: ["all"],
    },
    {
      id: "searchText",
      title: "🔍 Search in Incognito",
      contexts: ["selection"],
    },
  ];

  // Attach them under the main menu
  menuItems.forEach((item) =>
    chrome.contextMenus.create({ ...item, parentId: "mainMenu" })
  );

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
    try {
      let decoded = hexToString(info.selectionText.trim());
      if (isValidUrl(decoded)) {
        openInIncognito(decoded);
        saveHexString(decoded);
      }
    } catch {
      console.log("bruh");
    }
  } else if (info.menuItemId === "saveTabs") {
    saveTabs();
  } else if (info.menuItemId === "openSavedTabs") {
    openSavedTabs();
  } else if (info.menuItemId === "loginTwitter") {
    loginToTwitter();
  } else if (info.menuItemId === "searchText") {
    openInIncognito(
      "https://www.google.com/search?q=" +
        encodeURIComponent(info.selectionText)
    );
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

// Open URL in incognito mode then back to the original tab
function openInIncognito(url) {
  navigator.clipboard.writeText(url);
  chrome.windows.getAll({ populate: true }, (windows) => {
    let incognitoWindow = windows.find((w) => w.incognito);
    if (incognitoWindow) {
      chrome.tabs.create({ windowId: incognitoWindow.id, url: url });
    } else {
      chrome.windows.create({ url: url, incognito: true });
    }
  });
  // Switch back to the original tab
  if (chrome.tabs && chrome.tabs.query) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.update(tabs[0].id, { active: true });
      }
    });
  } else {
    console.warn(
      "Unable to switch back to the original tab, tabs API not available."
    );
  }
}

// Save all open tabs
function saveTabs() {
  chrome.tabs.query({}, (tabs) => {
    let tabUrls = tabs.map((tab) => tab.url);
    chrome.storage.local.set({
      savedTabs: { date: new Date().toISOString(), urls: tabUrls },
    });
    console.log("Tabs saved!");
  });
}

// Open saved tabs in incognito and login to X if applicable
async function openSavedTabs() {
  try {
    await loginToX();
    const data = await new Promise((resolve) => {
      chrome.storage.local.get("savedTabs", resolve);
    });

    if (
      !data.savedTabs ||
      !data.savedTabs.urls ||
      data.savedTabs.urls.length === 0
    ) {
      console.warn("No saved tabs found.");
      return;
    }

    const windows = await new Promise((resolve) => {
      chrome.windows.getAll({ populate: true }, resolve);
    });
    let incognitoWindow = windows.find((w) => w.incognito);

    let createdTabs = [];
    if (incognitoWindow) {
      // Open tabs in existing incognito window
      for (const url of data.savedTabs.urls) {
        const tab = await new Promise((resolve) => {
          chrome.tabs.create(
            { windowId: incognitoWindow.id, url: url },
            resolve
          );
        });
        createdTabs.push(tab);
      }
    } else {
      // Create new incognito window with all URLs
      const newWindow = await new Promise((resolve) => {
        chrome.windows.create(
          { url: data.savedTabs.urls[0], incognito: true },
          resolve
        );
      });
      incognitoWindow = newWindow;
      createdTabs.push(newWindow.tabs[0]);
      // Open remaining URLs
      for (const url of data.savedTabs.urls.slice(1)) {
        const tab = await new Promise((resolve) => {
          chrome.tabs.create(
            { windowId: incognitoWindow.id, url: url },
            resolve
          );
        });
        createdTabs.push(tab);
      }
    }

    // Check for X login page and trigger login
    
    
  } catch (error) {
    console.error("Error in openSavedTabs:", error);
  }
}

function loginToTwitter() {
  loginToX();
}

async function loginToX(tabId = null) {
  try {
    // Get all windows
    const windows = await new Promise((resolve) => {
      chrome.windows.getAll({ populate: true }, resolve);
    });

    const incognitoWindow = windows.find((w) => w.incognito);

    let tab;
    if (tabId) {
      // Use provided tabId (from openSavedTabs)
      tab = await new Promise((resolve) => {
        chrome.tabs.get(tabId, resolve);
      });
    } else if (incognitoWindow) {
      // Open new tab in existing incognito window
      tab = await new Promise((resolve) => {
        chrome.tabs.create(
          {
            windowId: incognitoWindow.id,
            url: "https://x.com/i/flow/login",
            active: true, // Ensure tab is focused
          },
          resolve
        );
      });
    } else {
      // Create new incognito window with login page
      const newWindow = await new Promise((resolve) => {
        chrome.windows.create(
          { url: "https://x.com/i/flow/login", incognito: true },
          resolve
        );
      });
      tab = newWindow.tabs[0];
    }

    // Ensure tab is active to avoid scripting issues
    await chrome.tabs.update(tab.id, { active: true });

    // Wait for X login page to load and Google button to be present
    await waitForPageLoad(tab.id, "https://x.com/i/flow/login");

    // Click Google login button with retry
    let buttonClicked = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: clickGoogleLoginButton,
      });
      if (result && result.result) {
        buttonClicked = true;
        break;
      }
      console.log(`Retrying Google button click... Attempt ${attempt}/3`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    if (!buttonClicked) {
      throw new Error("Failed to click Google login button after retries");
    }

    // Wait for Google login window
    const googleTab = await waitForGoogleLoginTab();

    // Fill Google login credentials with retry
    let credentialsFilled = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: googleTab.id },
        func: fillGoogleCredentials,
        args: [EMAIL, PASSWORD],
      });
      if (result && result.result) {
        credentialsFilled = true;
        break;
      }
      console.log(`Retrying credential fill... Attempt ${attempt}/3`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    if (!credentialsFilled) {
      throw new Error("Failed to fill Google credentials after retries");
    }
  } catch (error) {
    console.error("Error in loginToX:", error);
  }
}

async function waitForPageLoad(tabId, expectedUrl) {
  // Wait for tab to be ready and URL to match
  for (let i = 0; i < 60; i++) {
    console.log(`Waiting for page load... Attempt ${i + 1}/60`);
    const tab = await new Promise((resolve) => {
      chrome.tabs.get(tabId, resolve);
    });
    if (tab.url.includes(expectedUrl)) {
      // Check if Google login button is present
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const buttons = Array.from(
            document.querySelectorAll('div[role="button"]')
          );
          return {
            buttonFound: buttons.some((button) =>
              Array.from(button.querySelectorAll("*")).some((el) =>
                el.textContent?.toLowerCase().includes("google")
              )
            ),
          };
        },
      });
      if (result.result.buttonFound) {
        console.log("Page loaded with Google login button:", tab.url);
        return true;
      }
      console.log(`Google button not found, retrying... Attempt ${i + 1}/60`);
    } else {
      console.log(`Waiting for page to load... Attempt ${i + 1}/60`);
    }
    await new Promise((resolve) => setTimeout(resolve, 500)); // Shorter interval for finer granularity
  }
  throw new Error("Page load timeout or Google login button not found");
}

async function waitForGoogleLoginTab() {
  for (let i = 0; i < 60; i++) {
    const tabs = await new Promise((resolve) => {
      chrome.tabs.query({}, resolve);
    });
    const googleTab = tabs.find((tab) =>
      tab.url.includes("accounts.google.com")
    );
    if (googleTab) {
      // Ensure tab is active
      await chrome.tabs.update(googleTab.id, { active: true });
      // Wait for Google login page to be fully loaded
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: googleTab.id },
        func: () => {
          return {
            inputFound: !!document.querySelector('input[type="email"]'),
          };
        },
      });
      if (result.result.inputFound) {
        console.log("Google login page loaded:", googleTab.url);
        return googleTab;
      }
      console.log(
        `Google login input not found, retrying... Attempt ${i + 1}/60`
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Google login tab not found");
}

function clickGoogleLoginButton() {
  const buttons = Array.from(document.querySelectorAll('div[role="button"]'));
  const googleButton = buttons.find((button) =>
    Array.from(button.querySelectorAll("*")).some((el) =>
      el.textContent?.toLowerCase().includes("google")
    )
  );

  if (googleButton) {
    googleButton.click();
    return true;
  } else {
    console.error("Google login button not found");
    return false;
  }
}

function fillGoogleCredentials(email, password) {
  // Handle email input
  const emailInput = document.querySelector('input[type="email"]');
  if (emailInput) {
    emailInput.value = email;
    emailInput.dispatchEvent(new Event("input", { bubbles: true }));

    const nextButton = document.querySelector("#identifierNext");
    if (nextButton) {
      setTimeout(() => nextButton.click(), 1000);
    } else {
      console.error("Email next button not found");
      return false;
    }
  } else {
    console.error("Email input not found");
    return false;
  }

  // Handle password input
  setTimeout(() => {
    const passwordInput = document.querySelector('input[type="password"]');
    if (passwordInput) {
      passwordInput.value = password;
      passwordInput.dispatchEvent(new Event("input", { bubbles: true }));

      const submitButton = document.querySelector("#passwordNext");
      if (submitButton) {
        setTimeout(() => submitButton.click(), 1000);
      } else {
        console.error("Password submit button not found");
        return false;
      }
    } else {
      console.error("Password input not found");
      return false;
    }
  }, 3000);
  return true;
}
