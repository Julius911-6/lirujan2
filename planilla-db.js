/*
  planilla-db.js
  Módulo cliente ligero para obtener las ventas del día.
  Decide automáticamente entre usar el endpoint seguro (ENDPOINT_PLANILLA) o Supabase en cliente (si está configurado).

  Uso: incluir <script src="planilla.config.js"></script> antes de este archivo o definir window.PLANILLA_CONFIG globalmente.
  Luego planilla.js llamará a window.fetchVentasDelDia(fechaISO) internamente.
*/
(function(){
  const cfg = window.PLANILLA_CONFIG || {};

  function hoyISO(date = new Date()) { return date.toISOString().slice(0,10); }

  async function fetchFromEndpoint(fechaISO) {
    if (!cfg.ENDPOINT_PLANILLA) throw new Error('ENDPOINT_PLANILLA no configurado');
    const url = new URL(cfg.ENDPOINT_PLANILLA);
    url.searchParams.set('fecha', fechaISO);
    const res = await fetch(url.toString(), { method: 'GET', credentials: 'include' });
    if (!res.ok) throw new Error(`Error en endpoint: ${res.status}`);
    return res.json();
  }

  async function fetchFromSupabaseSalidas(fechaISO) {
    if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) throw new Error('Supabase no configurado en planilla.config.js');
    if (typeof supabaseJs === 'undefined') throw new Error('Biblioteca supabase-js no cargada');

    const supabase = supabaseJs.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
    const { data, error } = await supabase
      .from('salidas')
      .select('id, unidad, chofer, hora, asientos(*)')
      .eq('fecha', fechaISO)
      .order('hora', { ascending: true });

    if (error) throw error;

    return data.map(s => ({
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
  }

  async function getVentasDelDia(fechaISO = hoyISO()) {
    // Prefer endpoint seguro
    if (cfg.ENDPOINT_PLANILLA) {
      return fetchFromEndpoint(fechaISO);
    }
    // Fallback a Supabase cliente
    if (cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY) {
      return fetchFromSupabaseSalidas(fechaISO);
    }
    throw new Error('Ninguna configuración disponible: configura ENDPOINT_PLANILLA o SUPABASE_URL/SUPABASE_ANON_KEY');
  }

  window.planillaDB = {
    hoyISO,
    fetchFromEndpoint,
    fetchFromSupabaseSalidas,
    getVentasDelDia
  };

  // Compatibilidad: alias global que planilla.js puede usar
  window.fetchVentasDelDia = getVentasDelDia;
})();
