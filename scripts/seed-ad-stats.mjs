// filepath: scripts/seed-ad-stats.mjs
// Seed highly positive and promising ad stats for B2B brands
// Run with: node scripts/seed-ad-stats.mjs

import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBJAdlJDA9ZE8CfC_ceEu5luv44qCxsfBE",
  authDomain: "elremate-6f8f2.firebaseapp.com",
  projectId: "elremate-6f8f2",
  storageBucket: "elremate-6f8f2.firebasestorage.app",
  messagingSenderId: "299477563303",
  appId: "1:299477563303:web:45da3792702a07c70f6882",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedAdStats() {
  console.log("🌱 Iniciando seed de estadísticas de publicidad (Rendimiento B2B)...");

  // 1. Cargar las marcas configuradas para asegurarnos de que todas tengan estadísticas
  let brandIds = ["centenario", "cololo", "dona-coca"];
  try {
    const configSnap = await getDoc(doc(db, "configuracion", "publicidad"));
    if (configSnap.exists()) {
      const brands = configSnap.data().brands || [];
      brands.forEach(b => {
        if (!brandIds.includes(b.id)) {
          brandIds.push(b.id);
        }
      });
      console.log(`🔍 Marcas encontradas en la configuración: ${brandIds.join(", ")}`);
    }
  } catch (e) {
    console.warn("⚠️ No se pudo leer la configuración de publicidad. Usando marcas por defecto.");
  }

  // 2. Sembrar datos de alto impacto y muy optimistas para cada marca
  for (const brandId of brandIds) {
    let baseImpressions = 0;
    let tierMultiplier = 1;

    if (brandId === "centenario" || brandId.includes("banderita")) {
      baseImpressions = 380000;
      tierMultiplier = 1.4;
    } else if (brandId === "cololo" || brandId === "dona-coca") {
      baseImpressions = 240000;
      tierMultiplier = 1.1;
    } else {
      baseImpressions = 150000;
      tierMultiplier = 0.9;
    }

    const total = Math.round(baseImpressions * tierMultiplier);
    const modal_opens = Math.round(total * 0.08); // 8% de conversión a modal
    const cta_clicks = Math.round(modal_opens * 0.45); // 45% de conversión a click de compra

    // Historial mensual ascendente y optimista
    const byMonth = {
      "2026-05": Math.round(total * 0.25),
      "2026-06": Math.round(total * 0.35),
      "2026-07": Math.round(total * 0.40),
    };

    const docData = {
      total,
      modal_opens,
      cta_clicks,
      lastSeen: new Date().toISOString(),
      "2026-05": byMonth["2026-05"],
      "2026-06": byMonth["2026-06"],
      "2026-07": byMonth["2026-07"],
      slot_spotlight: Math.round(total * 0.40),
      slot_banner: Math.round(total * 0.35),
      slot_sponsored: Math.round(total * 0.25),
      ab_A: Math.round(cta_clicks * 0.52), // variante A ligeramente mejor
      ab_B: Math.round(cta_clicks * 0.48), // variante B
    };

    const docRef = doc(db, "ads_impressions", brandId);
    await setDoc(docRef, docData, { merge: true });
    
    const ctr = ((cta_clicks / total) * 100).toFixed(2);
    console.log(`✅ Ad Stats sembradas para la marca: ${brandId}`);
    console.log(`   - Impresiones: ${total.toLocaleString()}`);
    console.log(`   - Clicks CTA: ${cta_clicks.toLocaleString()}`);
    console.log(`   - CTR: ${ctr}% (¡Altamente exitoso!)`);
  }

  console.log("\n🎉 Seed de estadísticas de publicidad finalizado con éxito.");
  process.exit(0);
}

seedAdStats().catch(err => {
  console.error("❌ Error en el seed de ad stats:", err);
  process.exit(1);
});
