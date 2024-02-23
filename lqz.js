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

// BITWARDEN
/*
  this block of code get the account name and set as query string in the url
*/
if (window.location.hostname.match(/\.signin\.aws/) !== null) {
  console.log("AWS Signin Page");

  waitForElementToExist("[data-testId='test-header']").then((element) => {
    const awsAccountName = element?.innerText?.split(" ")?.reverse()?.[0];
    console.log("AWS Account Name: ", awsAccountName);
    history.pushState({}, "", `?${awsAccountName}`);
  });
}

// PERSIST ACCOUNT NAME IN COOKIE BASED ON ID
if (window.location.hostname.match(/\.awsapps\.com/) !== null) {
  console.log("AWS account Page");

  waitForElementToExist(".portal-instance-section").then(() => {
    const portalInstances = document.querySelectorAll(
      ".portal-instance-section"
    );

    let accounts = [];
    portalInstances?.forEach((instance) => {
      const id = instance
        ?.querySelector(".accountId")
        ?.innerText?.replace("#", "");
      const name = instance?.querySelector(".name")?.innerText;
      console.log("ID: ", id);
      console.log("Name: ", name);
      accounts.push({ id, name });
    });

    chrome.storage.local.set({ accounts });
  });
}

// RETRIEVE ACCOUNT NAME FROM COOKIE BASED ON ID
if (window.location.hostname.match(/\.console\.aws\.amazon\.com/) !== null) {
  chrome.storage.local.get(["accounts"], function (accounts) {
    if (!accounts) {
      console.log("ACCOUNTS NOT FOUND");
      return;
    }

    console.log("FOUND ACCOUNTS: ", accounts);

    waitForElementToExist(
      "[data-testid='awsc-nav-account-menu-button'] > span"
    ).then((element) => {
      waitingFor(1000, () => {
        let currentAccountId = element?.title
          ?.split(" ")
          ?.reverse()?.[0]
          ?.replaceAll("-", "");

        console.log("CURRENT ACCOUNT ID: ", currentAccountId);

        const account = accounts?.accounts?.find(
          (account) => account.id === currentAccountId
        );

        console.log("FOUND ACCOUNT: ", account);

        // ADD DIV TO SHOW ACCOUNT NAME
        if (!document.querySelector("#lqz-account-name")) {
          const topNav = document.querySelector("#awsc-top-level-nav");
          const div = document.createElement("div");
          div.id = "lqz-account-name";
          div.style = `
            background-color: #1c8c1c;
            padding: 5px 10px;
            border-radius: 10px;
            height: 12px;
            justify-content: center;
            display: flex;
            align-items: center;
            font-size: 12px;
            font-weight: bold;
            font-family: "Amazon Ember","HelveticaNeue","Helvetica Neue","Amazon Ember",Roboto,"Roboto-Regular","Amazon Ember",Helvetica,Arial,sans-serif;
            color: white;
            margin: 9px;
          `;

          div.textContent = account?.name;

          topNav.appendChild(div);
        }
      });
    });
  });
}
