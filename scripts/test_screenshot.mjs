import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to seleccionar-sucursal...');
    await page.goto('http://localhost:3000/seleccionar-sucursal');
    await page.waitForTimeout(4000); // Wait for page to mount
    
    // Take a screenshot
    await page.screenshot({ path: 'C:/Users/PC/.gemini/antigravity/brain/27d61642-f88f-4b60-ac42-392182a626c7/seleccionar_sucursal_screenshot.png' });
    console.log('Screenshot saved.');
    
    // Get text content of elements
    const h3Texts = await page.locator('h3').allTextContents();
    console.log('H3 elements found on page:', h3Texts);
    
    const bodyText = await page.locator('body').innerText();
    console.log('Length of body text:', bodyText.length);
    console.log('Snippet of body text:', bodyText.slice(0, 500));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();
