import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  
  try {
    console.log('Navigating directly to catalog page with sucursal=canelones...');
    await page.goto('http://localhost:3000/catalogo?sucursal=canelones');
    
    console.log('Waiting 10 seconds to let everything load...');
    await page.waitForTimeout(10000);
    
    await page.screenshot({ path: 'C:/Users/PC/.gemini/antigravity/brain/27d61642-f88f-4b60-ac42-392182a626c7/catalog_debug_screenshot.png' });
    console.log('Screenshot saved.');
    
    // Check if there are .card elements
    const cardCount = await page.locator('.card').count();
    console.log('Number of .card elements:', cardCount);
    
    if (cardCount > 0) {
      const firstCardText = await page.locator('.card').first().innerText();
      console.log('First card content:', firstCardText);
    } else {
      console.log('No cards found. Let\'s inspect the page content.');
      const text = await page.locator('body').innerText();
      console.log('Body text length:', text.length);
      console.log('Snippet of body text:', text.slice(0, 1000));
    }
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
  }
})();
