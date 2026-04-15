import puppeteer from 'puppeteer';

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        
        // Go to the local app
        await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
        
        // The dashboard already has demo alerts active according to alertsEngine.js
        // Wait a small amount of time to ensure animations/renders finish
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Take a screenshot
        await page.screenshot({ path: 'security-warning-screenshot.png', fullPage: true });
        
        await browser.close();
        console.log('Screenshot saved as security-warning-screenshot.png');
    } catch (e) {
        console.error('Error taking screenshot:', e);
    }
})();
