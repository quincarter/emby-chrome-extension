The waitForSelector timeout of 15s
wasn't enough because it was being called before hydration. The fix is: for JustWatch, don't use waitForSelector in the setup — instead
wait for the SPA to hydrate with a delay, then the selectors will be there.
Actually, looking back at the test code — the waitForSelector is called AFTER goto with domcontentloaded, but JustWatch's buybox is
rendered by client-side JS. It needs time. Let me increase the timeout in setupLiveContentScript or change the approach:
