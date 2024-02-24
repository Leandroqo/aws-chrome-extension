function waitForElementToExist(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
    });
  });
}

function waitingFor(time, done) {
  console.log(`WAITING FOR ${time}`);
  setTimeout(() => {
    done();
  }, time);
}

const IS_CHROME = window.navigator.userAgent.match(/CHROME/i);
const IS_FIREFOX = window.navigator.userAgent.match(/FIREFOX/i);

function setLocalStorage(key, value) {
  console.log("BROWSER");
  if (IS_CHROME) {
    console.log("CHROME");
    chrome.storage.local.set({ [key]: value });
  } else if (IS_FIREFOX) {
    console.log("IS FIREFOX");
    browser.storage.local.set({ [key]: value });
  }
}

function getLocalStorage(key, callback) {
  if (IS_CHROME) {
    chrome.storage.local.get([key], callback);
  } else if (IS_FIREFOX) {
    browser.storage.local.get(key).then(callback);
  }
}

(async () => {
  const SSO_PAGE = window.location.hostname.match(/\.signin\.aws/) !== null;
  const CONSOLE_PAGE =
    window.location.hostname.match(/\.console\.aws\.amazon\.com/) !== null;
  const ACCOUNTS_PAGE =
    window.location.hostname.match(/\.awsapps\.com/) !== null;

  if (SSO_PAGE) {
    const src = chrome.runtime.getURL("sso.js");
    const addAccountAsQS = await import(src);

    addAccountAsQS.execute();
  } else if (ACCOUNTS_PAGE || CONSOLE_PAGE) {
    const src = chrome.runtime.getURL("account-info.js");
    const accountInfo = await import(src);

    if (ACCOUNTS_PAGE) {
      accountInfo.storeData();
    } else if (CONSOLE_PAGE) {
      accountInfo.getData();
    }
  }
})();
