# Planilla Diaria — LIRUJHAN

Este repositorio incluye una demo para generar una "Planilla Diaria" PDF agrupada por unidad (bus) / salida y varias utilidades para integrarlo con Supabase o con un endpoint seguro.

Contenido añadido:

- `planilla.html` — Interfaz demo (fecha, otros ingresos, formato PDF, logo, firmas).
- `planilla.js` — Lógica para render, cálculo de subtotales y generación del PDF con `html2pdf.js`.
- `planilla-db.js` — Módulo cliente que decide entre usar un endpoint seguro o Supabase cliente.
- `planilla.config.example.js` — Ejemplo de configuración que NO debe subirse con claves reales.
- `server.js` — Ejemplo de endpoint Node/Express que consulta Supabase con la clave de servicio.
- `.env.example` — Variables de entorno de ejemplo.

Instrucciones rápidas

1. Configuración local (recomendada)

- Copia `planilla.config.example.js` a `planilla.config.js` y rellena los valores (NO commit).
  - Si prefieres seguridad, **configura `ENDPOINT_PLANILLA`** apuntando a tu servidor (recomendado).
  - Si necesitas una opción rápida y controlas RLS, puedes poner las variables `SUPABASE_URL` y `SUPABASE_ANON_KEY`.

- Si usas el endpoint seguro, despliega `server.js` en un servidor que tenga las variables de entorno (ver `.env.example`).

2. Ejecutar el servidor (ejemplo)

- Instala dependencias:

  ```bash
  npm install express cors dotenv @supabase/supabase-js
  ```

- Crea `.env` basándote en `.env.example` y rellena `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` y `API_KEY`.

- Inicia el servidor:

  ```bash
  node server.js
  ```

3. Probar localmente la página

- Asegúrate de tener `planilla.html`, `planilla.js`, `planilla-db.js` y `planilla.config.js` en el mismo directorio.
- Abre `planilla.html` en el navegador (no necesita servidor).
- Selecciona la fecha y pulsa "📄 Descargar Planilla Diaria en PDF".

Seguridad y buenas prácticas

- Nunca subas claves privadas al repositorio. Usa `planilla.config.js` local o variables de entorno.
- Si usas Supabase desde el cliente, activa Row Level Security (RLS) y policies que limiten el acceso.
- Preferible: usar `server.js` con la `SUPABASE_SERVICE_KEY` server-side y que el frontend consulte solo el endpoint público.

Adaptaciones

- Si tu esquema de base de datos usa otros nombres de tabla/columnas, adapta las consultas en `planilla-db.js` o en `server.js`.
- Si quieres soporte multi-página (muchas salidas) o tablas muy largas, puedo adaptar html2pdf/jsPDF para paginado y encabezados repetidos.

¿Necesitas que haga el deploy del endpoint o cree la rama con PR? Abre un issue o responde aquí y lo continuo.
