import puppeteer from 'puppeteer';

(async () => {
    let browser;
    try {
        console.log('Launching browser...');
        browser = await puppeteer.launch({ 
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1440, height: 900 });
        
        console.log('Navigating to local site...');
        await page.goto('http://localhost:5173/', { waitUntil: 'load', timeout: 30000 });
        
        console.log('Waiting for alerts to load...');
        await new Promise(resolve => setTimeout(resolve, 3000)); // wait for animations and data
        
        console.log('Taking screenshot...');
        await page.screenshot({ path: 'public/security-alert.png', fullPage: true });
        
        console.log('✅ Screenshot saved successfully as public/security-alert.png!');
        console.log('You can now use this real image of your project.');
    } catch (e) {
        console.error('❌ Error taking screenshot:', e.message);
    } finally {
        if (browser) await browser.close();
        process.exit(0);
    }
})();
