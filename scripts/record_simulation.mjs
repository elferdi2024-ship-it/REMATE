import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

(async () => {
  console.log('Iniciando simulación de compra con Playwright...');
  
  const videoDir = 'C:/Users/PC/.gemini/antigravity/brain/27d61642-f88f-4b60-ac42-392182a626c7';
  
  // Lanzar chromium
  const browser = await chromium.launch({
    headless: true
  });
  
  // Crear contexto simulando un iPhone (Mobile Viewport)
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    isMobile: true,
    hasTouch: true,
    recordVideo: {
      dir: videoDir,
      size: { width: 390, height: 844 }
    }
  });
  
  // Mockear IntersectionObserver antes de crear la página para cargar todo el catálogo inmediatamente
  await context.addInitScript(() => {
    class MockIntersectionObserver {
      constructor(callback) {
        this.callback = callback;
      }
      observe(element) {
        setTimeout(() => {
          this.callback([{ isIntersecting: true, target: element }]);
        }, 100);
      }
      unobserve() {}
      disconnect() {}
    }
    window.IntersectionObserver = MockIntersectionObserver;
  });
  
  const page = await context.newPage();
  
  const closeModal = async () => {
    console.log('Haciendo click en cerrar modal...');
    // El primer botón dentro del modal es el botón de cerrar
    const closeBtn = page.locator('.fixed.z-\\[101\\] button').first();
    await closeBtn.click();
    console.log('Esperando que el modal se oculte...');
    await page.waitForSelector('.fixed.z-\\[101\\]', { state: 'hidden', timeout: 5000 });
    await page.waitForTimeout(1000);
  };
  
  try {
    // 1. Ir a la página de selección de sucursal
    console.log('Navegando a seleccionar-sucursal...');
    await page.goto('http://localhost:3000/seleccionar-sucursal');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: path.join(videoDir, 'step1_sucursales.png') });
    
    // 2. Seleccionar la sucursal "Canelones"
    console.log('Seleccionando sucursal "Canelones"...');
    const canelonesCard = page.locator('.group').filter({ hasText: 'Canelones' }).first();
    await canelonesCard.click();
    await page.waitForTimeout(4000);
    
    console.log('URL actual:', page.url());
    
    // 3. Ocultar PWA Install Banner si aparece
    console.log('Verificando banner de instalación PWA...');
    const ahoraNoBtn = page.locator('text=Ahora no');
    if (await ahoraNoBtn.isVisible()) {
      console.log('Haciendo click en "Ahora no"...');
      await ahoraNoBtn.click();
      await page.waitForTimeout(1000);
    }
    
    await page.screenshot({ path: path.join(videoDir, 'step2_catalogo.png') });
    
    // Esperar a que se carguen los productos
    console.log('Esperando que carguen las tarjetas de productos...');
    await page.waitForSelector('.card', { timeout: 10000 });
    
    // 4. Añadir primer producto desde el Grid
    console.log('Abriendo vista rápida del primer producto...');
    const firstCard = page.locator('.card').first();
    await firstCard.click();
    
    console.log('Esperando modal de producto...');
    await page.waitForSelector('text=AGREGAR AL PEDIDO', { timeout: 5000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(videoDir, 'step3_quickview1.png') });
    
    console.log('Añadiendo bulto de 12 unidades...');
    const preset12 = page.locator('button', { hasText: '12 u.' }).first();
    await preset12.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(videoDir, 'step4_quickview1_added.png') });
    
    await closeModal();
    
    // 5. Añadir segundo producto
    console.log('Abriendo vista rápida del segundo producto...');
    const secondCard = page.locator('.card').nth(1);
    await secondCard.click();
    
    console.log('Esperando modal del segundo producto...');
    await page.waitForSelector('text=AGREGAR AL PEDIDO', { timeout: 5000 });
    await page.waitForTimeout(1000);
    
    console.log('Añadiendo bulto de 6 unidades...');
    const preset6 = page.locator('button', { hasText: '6 u.' }).first();
    await preset6.click();
    await page.waitForTimeout(1500);
    
    await closeModal();
    
    // 6. Abrir el carrito
    console.log('Abriendo el carrito...');
    await page.click('button.float-cart');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(videoDir, 'step5_carrito.png') });
    
    // 7. Cerrar publicidad si aparece
    console.log('Verificando si hay publicidad emergente...');
    const adCloseBtn = page.locator('button.ad-popup__close');
    if (await adCloseBtn.isVisible()) {
      console.log('Cerrando publicidad...');
      await adCloseBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(videoDir, 'step5_carrito_sin_ad.png') });
    }
    
    // 8. Rellenar los campos del comercio
    console.log('Completando datos del comercio...');
    await page.fill('#clientName', 'Almacén Don Batlle');
    await page.waitForTimeout(800);
    
    await page.fill('#clientTel', '099555123');
    await page.waitForTimeout(800);
    
    const addressInput = page.locator('#clientDir');
    if (await addressInput.isVisible()) {
      await addressInput.fill('General Flores 348, Canelones');
      await page.waitForTimeout(800);
    }
    
    await page.fill('#clientNotes', 'Entregar por favor por la tarde. Muchas gracias.');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(videoDir, 'step6_datos_completos.png') });
    
    // 9. Enviar pedido (simulado)
    console.log('Haciendo click en enviar pedido por WhatsApp...');
    await page.click('button.btn-whatsapp');
    
    // Esperar a que se procese el pedido y aparezca el Toast
    console.log('Esperando confirmación del pedido y descarga de comprobante...');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: path.join(videoDir, 'step7_finalizado.png') });
    
  } catch (error) {
    console.error('Error durante la simulación:', error);
  } finally {
    // Cerrar browser
    await context.close();
    await browser.close();
    console.log('Simulación finalizada. Navegador cerrado.');
    
    // Buscar el archivo de video creado y renombrarlo
    const files = fs.readdirSync(videoDir);
    const videoFile = files.find(f => f.endsWith('.webm'));
    if (videoFile) {
      const oldPath = path.join(videoDir, videoFile);
      const newPath = path.join(videoDir, 'simulacion_compra_comerciante.webm');
      if (fs.existsSync(newPath)) {
        fs.unlinkSync(newPath); // eliminar viejo si existe
      }
      fs.renameSync(oldPath, newPath);
      console.log(`Video guardado exitosamente como: ${newPath}`);
    } else {
      console.log('No se pudo encontrar el archivo de video en la carpeta.');
    }
  }
})();
