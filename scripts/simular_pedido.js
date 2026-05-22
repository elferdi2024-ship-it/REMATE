// filepath: scripts/simular_pedido.js
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuración de interfaz de terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

// 1. Cargar configuración de Firestore desde .env.local
let projectId = 'elremate-6f8f2'; // Default de respaldo
try {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/NEXT_PUBLIC_FIREBASE_PROJECT_ID=(.+)/);
    if (match && match[1]) {
      projectId = match[1].trim();
    }
  }
} catch (e) {
  console.log('⚠️ No se pudo leer .env.local de forma automática. Usando ID por defecto.');
}

console.clear();
console.log('\x1b[36m%s\x1b[0m', '════════════════════════════════════════════════════════════');
console.log('\x1b[36m%s\x1b[0m', '   🚀 SIMULADOR DE FLUJO DE PEDIDO INTERACTIVO - EL REMATE');
console.log('\x1b[36m%s\x1b[0m', '════════════════════════════════════════════════════════════');
console.log('Este script simulará un pedido real ingresado por un cliente.');
console.log('Podrás ver e interactuar con él en tu panel web de administración.');
console.log('------------------------------------------------------------');

async function iniciarSimulacion() {
  console.log('\n\x1b[33m%s\x1b[0m', '⏳ Creando pedido de prueba en tu base de datos de Firestore...');

  // Estructura del pedido en formato Firestore REST API
  const pedidoData = {
    fields: {
      clienteNombre: { stringValue: 'Renato (Simulador Interactivo)' },
      clienteTelefono: { stringValue: '099 265 952' },
      clienteDireccion: { stringValue: 'RETIRO EN LOCAL - Sucursal Atlantida' },
      total: { doubleValue: 1450 },
      notas: { stringValue: 'Pedido interactivo creado para entrenamiento de personal. ¡Hola Renato!' },
      status: { stringValue: 'no_leido' },
      fecha: { timestampValue: new Date().toISOString() },
      items: {
        arrayValue: {
          values: [
            {
              mapValue: {
                fields: {
                  codigo: { stringValue: '7730124002903' },
                  nombre: { stringValue: 'Yerba Mate Premium 1kg' },
                  cantidad: { integerValue: '2' },
                  precioUnitario: { doubleValue: 350 }
                }
              }
            },
            {
              mapValue: {
                fields: {
                  codigo: { stringValue: '876543210012' },
                  nombre: { stringValue: 'Aceite de Oliva Extra Virgen 500ml' },
                  cantidad: { integerValue: '1' },
                  precioUnitario: { doubleValue: 750 }
                }
              }
            }
          ]
        }
      }
    }
  };

  try {
    // 2. Insertar el documento en Firestore usando la REST API pública
    const response = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/pedidos_globales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pedidoData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error en Firebase: ${errorText}`);
    }

    const docCreated = await response.json();
    // Extraer el documentId
    const documentName = docCreated.name;
    const documentId = documentName.split('/').pop();

    console.log('\x1b[32m%s\x1b[0m', '✅ ¡Pedido creado en Firestore con éxito!');
    console.log(`🆔 ID del Pedido: ${documentId}\n`);
    
    console.log('\x1b[35m%s\x1b[0m', '📢 INSTRUCCIONES - PASO 1: Recibir el Pedido');
    console.log('1. Abre tu panel de administración en tu navegador: \x1b[4mhttp://localhost:3000/admin/pedidos\x1b[0m');
    console.log('2. Deberías haber escuchado la \x1b[1malerta sonora\x1b[0m al crearse el pedido.');
    console.log('3. Busca el pedido en rojo de \x1b[1m"Renato (Simulador Interactivo)"\x1b[0m.');
    console.log('4. Haz clic en el botón naranja: \x1b[41m 📦 EMPEZAR PREPARACIÓN \x1b[0m');
    console.log('\x1b[33m⏳ Esperando a que hagas clic en la web para avanzar en este tutorial...\x1b[0m');

    // 3. Loop para escuchar el cambio a "pendiente"
    let status = 'no_leido';
    while (status === 'no_leido') {
      await new Promise(resolve => setTimeout(resolve, 2000));
      status = await obtenerStatusPedido(documentId);
    }

    console.log('\n\x1b[32m%s\x1b[0m', '🎉 ¡Excelente! Detecté que cambiaste el estado a "PENDIENTE" (Amarillo) en la web.');
    console.log('------------------------------------------------------------');
    console.log('\x1b[35m%s\x1b[0m', '📢 INSTRUCCIONES - PASO 2: Impresión y Picking');
    console.log('El pedido ahora está en preparación.');
    console.log('1. En la tarjeta en pantalla, haz clic en el botón \x1b[1m"Imprimir Ticket"\x1b[0m para ver la visualización de 80mm.');
    console.log('2. Haz clic en \x1b[1m"Copiar Resumen"\x1b[0m para probar la integración con tu portapapeles.');
    console.log('3. Haz clic en el botón verde de WhatsApp para ver cómo enlaza directamente.');
    console.log('4. Cuando el pedido esté embalado en la vida real y listo en el camión, presiona el botón en la web:');
    console.log('   \x1b[42m 🚚 COMPLETAR CARGA \x1b[0m');
    console.log('\x1b[33m⏳ Esperando que completes la carga en la web...\x1b[0m');

    // 4. Loop para escuchar el cambio a "cargado"
    while (status === 'pendiente') {
      await new Promise(resolve => setTimeout(resolve, 2000));
      status = await obtenerStatusPedido(documentId);
    }

    console.log('\n\x1b[32m%s\x1b[0m', '🏆 ¡Espectacular! El pedido ha pasado a "CARGADO" (Verde).');
    console.log('La orden ha completado con éxito todo su ciclo logístico en la web real.');
    console.log('------------------------------------------------------------');

    const cleanAnswer = await question('❓ ¿Deseas eliminar este pedido de prueba para mantener la base de datos limpia? (S/N): ');
    if (cleanAnswer.toLowerCase() === 's' || cleanAnswer.toLowerCase() === 'si' || cleanAnswer === '') {
      console.log('⏳ Limpiando base de datos...');
      await eliminarPedidoPrueba(documentId);
      console.log('\x1b[32m%s\x1b[0m', '✅ Pedido de prueba eliminado correctamente.');
    } else {
      console.log('📌 El pedido se conservó en tu historial de hoy.');
    }

    console.log('\n\x1b[36m%s\x1b[0m', '👋 ¡Simulación interactiva completada! Gracias por probar el flujo real de El Remate.');

  } catch (error) {
    console.error('\n❌ Ocurrió un error en el simulador:', error.message);
  } finally {
    rl.close();
  }
}

async function obtenerStatusPedido(documentId) {
  try {
    const response = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/pedidos_globales/${documentId}`);
    if (response.ok) {
      const data = await response.json();
      return data.fields.status.stringValue;
    }
  } catch (e) {
    // Silencioso, reintenta
  }
  return 'no_leido';
}

async function eliminarPedidoPrueba(documentId) {
  try {
    await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/pedidos_globales/${documentId}`, {
      method: 'DELETE'
    });
  } catch (e) {
    console.log('⚠️ No se pudo eliminar el pedido automáticamente. Puedes borrarlo desde el panel admin.');
  }
}

iniciarSimulacion();
