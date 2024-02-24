/*
  this block of code get the account name and set as query string in the url
*/
export function execute() {
  console.log("AWS SIGNIN PAGE");

  waitForElementToExist("[data-testId='test-header']").then((element) => {
    const awsAccountName = element?.innerText?.split(" ")?.reverse()?.[0];
    console.log("AWS ACCOUNT NAME: ", awsAccountName);
    history.pushState({}, "", `?${awsAccountName}`);
  });
}
