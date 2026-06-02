import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

(async () => {
  console.log('Iniciando simulación de preparación de pedidos para empleados...');
  
  const videoDir = 'C:/Users/PC/.gemini/antigravity/brain/27d61642-f88f-4b60-ac42-392182a626c7';
  const targetOrderName = 'Renato (Pedido de Entrenamiento)';
  
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
  
  const page = await context.newPage();
  
  // Manejador automático de diálogos/alertas
  page.on('dialog', async dialog => {
    console.log(`Diálogo detectado: [${dialog.type()}] "${dialog.message()}"`);
    await dialog.accept();
    console.log('Diálogo aceptado.');
  });
  
  try {
    // 1. Login
    console.log('Navegando al panel de login...');
    await page.goto('http://localhost:3000/admin/login');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(videoDir, 'emp_step1_login.png') });
    
    console.log('Haciendo 5 clicks en el título para revelar bypass...');
    const adminHeader = page.locator('h1', { hasText: 'ADMIN' }).first();
    for (let i = 0; i < 5; i++) {
      await adminHeader.click();
      await page.waitForTimeout(200);
    }
    
    console.log('Haciendo click en botón de auto-login local...');
    const autoLoginBtn = page.locator('text=AUTO-LOGIN ADMIN DIOS');
    await autoLoginBtn.click();
    await page.waitForTimeout(4000); // esperar redirección y compilación
    
    console.log('URL de administración cargada:', page.url());
    await page.screenshot({ path: path.join(videoDir, 'emp_step2_dashboard.png') });
    
    // Ocultar PWA Install Banner si aparece
    console.log('Verificando banner de instalación PWA...');
    const ahoraNoBtn = page.locator('text=Ahora no');
    if (await ahoraNoBtn.isVisible()) {
      console.log('Haciendo click en "Ahora no"...');
      await ahoraNoBtn.click();
      await page.waitForTimeout(1000);
    }
    
    // 2. Click en Simular Pedido
    console.log('Haciendo click en "Simular Pedido"...');
    await page.click('button:has-text("SIMULAR PEDIDO")');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(videoDir, 'emp_step3_pedido_simulado.png') });
    
    // Esperar a que el pedido aparezca en la lista
    console.log(`Esperando que aparezca el pedido "${targetOrderName}" en el panel...`);
    await page.waitForSelector(`text=${targetOrderName}`, { timeout: 15000 });
    
    // Ubicar la tarjeta del pedido
    const orderCard = page.locator('.group').filter({ hasText: targetOrderName }).first();
    await orderCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    
    // 3. Empezar preparación
    console.log('Cambiando estado a "Preparando" (Pendiente)...');
    const startPrepBtn = orderCard.locator('button', { hasText: 'EMPEZAR PREPARACIÓN' });
    await startPrepBtn.click();
    await page.waitForTimeout(2500); // esperar transición
    await page.screenshot({ path: path.join(videoDir, 'emp_step4_preparando.png') });
    
    // 4. Ver recibo estructurado
    console.log('Abriendo recibo de picking...');
    const receiptBtn = orderCard.locator('button', { hasText: 'RECIBO' });
    await receiptBtn.click();
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(videoDir, 'emp_step5_recibo.png') });
    
    console.log('Cerrando recibo...');
    const closeReceiptBtn = orderCard.locator('button', { hasText: 'Cerrar Recibo' });
    await closeReceiptBtn.click();
    await page.waitForTimeout(1500);
    
    // 5. Completar carga (finalizar pedido)
    console.log('Cambiando estado a "Cargado" (Completado)...');
    const completeLoadBtn = orderCard.locator('button', { hasText: 'COMPLETAR CARGA' });
    await completeLoadBtn.click();
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(videoDir, 'emp_step6_cargado.png') });
    
    // 6. Eliminar pedido de prueba para limpiar Firestore
    console.log('Limpiando base de datos: Eliminando pedido de prueba...');
    const deleteBtn = orderCard.locator('button[title="Eliminar Pedido"]');
    await deleteBtn.click();
    await page.waitForTimeout(2000);
    console.log('Pedido de prueba eliminado de Firestore.');
    
  } catch (error) {
    console.error('Error durante la simulación de empleado:', error);
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
      const newPath = path.join(videoDir, 'simulacion_preparacion_empleado.webm');
      if (fs.existsSync(newPath)) {
        fs.unlinkSync(newPath); // eliminar viejo si existe
      }
      fs.renameSync(oldPath, newPath);
      console.log(`Video de empleado guardado exitosamente como: ${newPath}`);
    } else {
      console.log('No se pudo encontrar el archivo de video en la carpeta.');
    }
  }
})();
