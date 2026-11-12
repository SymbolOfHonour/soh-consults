type BrowserIdentity = {
  userAgent: string;
  userAgentData?: { mobile?: boolean };
};

// A touchscreen is also present in a phone browser's Desktop site mode.
// Browser identity follows that choice; pointer capability does not.
export function usesMobileLayout(browser: BrowserIdentity): boolean {
  if (typeof browser.userAgentData?.mobile === "boolean") {
    return browser.userAgentData.mobile;
  }
  return /\bMobile\b|\bAndroid\b|\biPhone\b|\biPod\b/i.test(browser.userAgent);
}
