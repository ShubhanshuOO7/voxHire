const playwright = require('playwright');
    
    (async () => {
        for (const browserType of ['chromium', 'firefox', 'webkit']) {
            const browser = await playwright[browserType].launch();
            const context = await browser.newContext();
            const page = await context.newPage();
            await page.goto('https://www.linkedin.com/');
            await page.screenshot({ path: `nodejs_${browserType}.png`, fullPage: true });
            await page.waitForTimeout(1000);
            await browser.close();
        }
    })();


