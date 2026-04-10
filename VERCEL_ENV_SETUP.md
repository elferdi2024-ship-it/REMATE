# 🚀 Configuración de Variables de Entorno en Vercel

## Problema
El build de Vercel falla con `FirebaseError: Firebase: Error (auth/invalid-api-key)` porque las variables de entorno no están configuradas en Vercel.

---

## ✅ Solución: Configurar Variables en Vercel

### Paso 1: Ir al Dashboard de Vercel
1. Entrá a https://vercel.com
2. Seleccioná tu proyecto **REMATE**

### Paso 2: Ir a Configuración de Variables de Entorno
1. Click en **Settings** (Configuración)
2. Click en **Environment Variables** (Variables de Entorno)

### Paso 3: Agregar las Variables
Agregá estas variables en **Production**, **Preview**, y **Development**:

| Variable | Valor |
|----------|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyBJAdlJDA9ZE8CfC_ceEu5luv44qCxsfBE` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `elremate-6f8f2.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `elremate-6f8f2` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `elremate-6f8f2.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `299477563303` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:299477563303:web:45da3792702a07c70f6882` |
| `NEXT_PUBLIC_WA_NUMBER` | `59894717052` |
| `NEXT_PUBLIC_NEGOCIO_NOMBRE` | `El Remate Canelones` |

### Paso 4: Re-deploy
Después de agregar las variables:
1. Ir a **Deployments**
2. Click en el deployment más reciente
3. Click en **Redeploy** (o hacer un nuevo push a Git)

---

## 🔒 Seguridad
- ⚠️ **NUNCA** subas `.env.local` a Git (ya está en `.gitignore`)
- ✅ `.env.local.example` tiene los valores de ejemplo para referencia
- ✅ Las variables en Vercel están encriptadas y seguras

---

## 🧪 Verificación
Después de configurar, el build debería pasar sin errores de Firebase.
