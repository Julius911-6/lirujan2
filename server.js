// server.js
// Ejemplo de endpoint Node/Express seguro que consulta Supabase con la SERVICE_KEY (no se debe exponer).
// Uso:
// 1) Copia .env.example -> .env y rellena SUPABASE_URL, SUPABASE_SERVICE_KEY y API_KEY.
// 2) npm install express cors dotenv @supabase/supabase-js
// 3) node server.js

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // clave segura (service_role)
const API_KEY = process.env.API_KEY || ''; // clave simple para proteger el endpoint

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Faltan SUPABASE_URL o SUPABASE_SERVICE_KEY en .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Middleware simple de autenticación por encabezado
function checkApiKey(req, res, next) {
  const key = req.headers['x-api-key'] || (req.headers.authorization || '').replace('Bearer ', '');
  if (!API_KEY) return next(); // si no se definió API_KEY, no aplicar check (solo para dev)
  if (!key || key !== API_KEY) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// GET /api/planilla?fecha=YYYY-MM-DD
app.get('/api/planilla', checkApiKey, async (req, res) => {
  const fecha = req.query.fecha || new Date().toISOString().slice(0,10);
  try {
    const { data, error } = await supabase
      .from('salidas')
      .select('id, unidad, chofer, hora, asientos(*)')
      .eq('fecha', fecha)
      .order('hora', { ascending: true });

    if (error) throw error;

    const result = data.map(s => ({
      unidad: s.unidad,
      chofer: s.chofer,
      hora: s.hora,
      asientos: (s.asientos || []).map(a => ({
        nro: a.asiento_nro,
        pasajero: a.pasajero,
        destino: a.destino,
        monto: Number(a.monto || 0)
      }))
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
