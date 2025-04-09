

// Fill email and proceed
function fillEmail() {
    let emailInput = document.querySelector('input[type="email"]');
    if (emailInput) {
        emailInput.value = email;
        emailInput.dispatchEvent(new Event("input", { bubbles: true }));

        setTimeout(() => {
            if (clickGotIt()) {
                console.log("Handled 'Got it' popup after email input.");
                setTimeout(clickNext, 1000); // Wait before clicking "Next"
            } else {
                clickNext();
            }
        }, 1000);
    } else {
        console.error("Email input not found.");
    }
}

function clickGotIt() {
    let gotItButton = [...document.querySelectorAll('button')]
        .find(btn => btn.innerText.includes("Got it"));
    if (gotItButton) {
        gotItButton.click();
        return true;
    }
    return false;
}

function clickNext() {
    let nextButton = [...document.querySelectorAll('button')]
        .find(btn => btn.innerText.includes("Next"));
    if (nextButton) {
        nextButton.click();
    } else {
        console.error("'Next' button not found.");
    }
}

function fillPassword() {
    let passwordInput = document.querySelector('input[type="password"]');
    if (passwordInput) {
        passwordInput.value = password;
        passwordInput.dispatchEvent(new Event("input", { bubbles: true }));

        setTimeout(clickNext, 1000);
    } else {
        console.error("Password input not found.");
    }
}

// Wait and determine which step we're on
setTimeout(() => {
    if (document.querySelector('input[type="email"]')) {
        fillEmail();
    } else if (document.querySelector('input[type="password"]')) {
        
        fillPassword();
    }
}, 2000);