CREATE TABLE IF NOT EXISTS roce_pruebas (
    id TEXT PRIMARY KEY,
    fecha TEXT NOT NULL,
    turno INTEGER NOT NULL,
    codigo_sap TEXT NOT NULL,
    producto TEXT NOT NULL,
    lote TEXT NOT NULL,
    resultados JSONB NOT NULL,
    usuario TEXT NOT NULL,
    creado_el TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
