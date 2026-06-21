-- Función RPC para incrementar vistas de documento
-- Usada por document.service.ts -> incrementViewCount()

CREATE OR REPLACE FUNCTION increment_doc_views(doc_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE documents
  SET view_count = view_count + 1
  WHERE id = doc_id;
END;
$$;
