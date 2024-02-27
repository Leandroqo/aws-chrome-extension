/*
  Store all accounts id, name and URL
*/
export function storeData() {
  console.log("AWS ACCOUNT PAGE");

  let accounts = [];
  waitForElementToExist(".portal-instance-section").then(() => {
    const portalInstances = document.querySelectorAll(
      ".portal-instance-section"
    );

    portalInstances?.forEach((instance) => {
      const id = instance
        ?.querySelector(".accountId")
        ?.innerText?.replace("#", "");
      const name = instance?.querySelector(".name")?.innerText;
      console.log("ID: ", id);
      console.log("NAME: ", name);
      accounts.push({ id, name });
    });
    setLocalStorage("accounts", accounts);
  });

  waitForElementToExist(".portal-instance-section .profile-link").then(
    (element) => {
      const token = element?.href?.split("/").reverse()?.[0];

      const url = `${window.location.origin}/start/#/saml/custom/{id}%20%28{name}%29/${token}`;
      setLocalStorage("sso", { url, token });
    }
  );
}

export function getData() {
  getLocalStorage("accounts", function (accounts) {
    if (!accounts) {
      console.log("ACCOUNTS NOT FOUND");
      return;
    }

    waitForElementToExist(
      "[data-testid='awsc-nav-account-menu-button'] > span"
    ).then((element) => {
      waitingFor(1000, () => {
        let currentAccountId = element?.title
          ?.split(" ")
          ?.reverse()?.[0]
          ?.replaceAll("-", "");
        const account = accounts?.accounts?.find(
          (account) => account.id === currentAccountId
        ) || { name: currentAccountId || "Unknown", id: "Unknown" };

        // ADD DIV TO SHOW ACCOUNT NAME
        if (!document.querySelector("#lqz-account-name")) {
          const topNav = document.querySelector("#awsc-top-level-nav");
          const div = document.createElement("div");
          div.id = "lqz-account-name";
          topNav.appendChild(div);
          mountMenu(div, accounts?.accounts, account);
          style();
        }
      });
    });
  });
}

function style() {
  const hasStyle = document.querySelectorAll("style[lqz]");

  if (hasStyle.length >= 1) {
    return;
  }

  var style = document.createElement("style");
  style.setAttribute("utk", "loaded");
  style.type = "text/css";
  style.innerHTML = `
    #lqz-account-name {
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
      position: relative;
      cursor: pointer;
    }

    #lqz-account-name > button {
      background: none;
      border: none;
      cursor: pointer;
      color: #ffffff;
      font-weight: bold;
    }

    #lqz-account-name:hover > ul {
      display: block;
    }

    #lqz-account-name > ul:hover {
      display: block;
    }

    #lqz-account-name > ul {
      display: none;
      position: absolute;
      top: 10px;
      right: 5px;
      padding: 0;
      min-width: 400px;
    }

    .lqz-item > a {
      background: #232f3e;
      color: white;
      padding: 10px;
      display: block;
      text-decoration: none;
      border-bottom: 1px solid #414750;
    }

    .lqz-item:hover > a {
      background-color: #1c8c1c;
    }

    .lqz-show {
      display: block !important;
    }

    .lqz-hide {
      display: hidden !important;
    }
  `;

  document.head.appendChild(style);
}

function mountMenu(lqzMenu, accounts, account) {
  getLocalStorage("sso", function ({ sso }) {
    let liAccounts = "";
    accounts?.forEach((acc) => {
      const url = sso?.url?.replace("{id}", acc.id).replace("{name}", acc.name);
      liAccounts += `<li class="lqz-item"><a href="${url}">${acc.name}</a></li>`;
    }) || "";

    lqzMenu.innerHTML = `
      <button>${account?.name}</button>
      <ul>${liAccounts}</ul>
    `;

    document
      .querySelector("#lqz-account-name > button")
      ?.addEventListener("click", function (event) {
        const list = document.querySelector("#lqz-account-name > ul");
        if (list.className === "lqz-show") {
          list.classList.remove("lqz-show");
          list.classList.add("lqz-hide");
        } else {
          list.classList.remove("lqz-hide");
          list.classList.add("lqz-show");
        }
      });
  });
}
