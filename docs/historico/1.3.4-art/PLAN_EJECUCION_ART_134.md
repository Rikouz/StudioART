# PLAN DE EJECUCIÓN ART — Evolución desde StudioART 1.3.4

**Alcance:** mejoras incrementales sobre el ZIP 1.3.4 auditado, nunca sobre carrusel V3 ni otro baseline. **Estado:** plan aprobado técnicamente para priorización; no constituye código implementado.

**Regla de preservación:** conservar interfaz actual, patita de gato donde aplique, diseño Fácil/Pro, fuente Saira/IBM Plex, integración MSCCS, motores anteriores, proyectos antiguos y acceso offline. Abrir en un branch dedicado. La revisión humana de integración se reserva al cierre; cada gate necesita QA verificable.

**Uso con la evolución horaria:** una tarea SA-xxx verificable por ciclo. No resetear `main`, ni borrar ramas/candidatas existentes, ni saltarse tareas pendientes sin evidencia; mantener el proyecto base limpio. El plan anterior `docs/PLAN_IMPLEMENTACION.md` sigue vigente para automatización y compatibilidad: este ART es un backlog adicional.

## Gates de entrega

| Gate | Resultado exigido |
|---|---|
| **G0 / Baseline** | SHA ZIP, repositorio de trabajo, fixtures y QA real del usuario en Chrome/Edge. |
| **G1 / SceneGraph** | Cada efecto respeta las máscaras, recortes, transformaciones y planos; señales antiguas combinables sin regresión. |
| **G2 / Geometría** | Contornos multiescala, nodos y conexiones, retículas por fuente, impresión y memoria de píxeles avanzadas. |
| **G3 / Tipo** | Palabras y letras editables, geometría tipográfica y motion de glifos sin alterar texto comercial. |
| **G4 / Seed** | 9 canales versionados, 1 diseño por pulsación, 4 variaciones opcionales, replay exacto y filtro de calidad. |
| **G5 / Producción** | Capas no destructivas, máscaras comercialmente fieles, render determinista y video con perfil soportado. |
| **G6 / Aceptación** | 48 combinaciones visuales, reabrir proyectos legacy, Windows Chrome/Edge, publicación web, cero P0 abiertos. |

## Tickets con ruta, dependencias y definición de hecho

### SA-000 · Congelar baseline 1.3.4, SHA y motor legacy

- **Gate:** G0; **Prioridad:** P0.
- **Código a inspeccionar:** `VERSION_SUPREMO.json; package; scripts/prepare_source.py`.
- **Depende de:** -.
- **Aceptación:** Zip intacto, commit base propio, rutas y manifest sin cambios; rollback verificado.

### SA-001 · QA Chrome/Edge Windows real, file:// y flujo de publicación

- **Gate:** G0; **Prioridad:** P0.
- **Código a inspeccionar:** `AUDITORIA_AUTOMATICA.html; qa/; STUDIOART_PORTATIL.html`.
- **Depende de:** SA-000.
- **Aceptación:** Capturas verificadas de importar/diseñar/guardar/reabrir/PNG/GIF/MP4 y logs sin errores.

### SA-002 · Fixtures con 18 muestras, foto limpia, producto aislado y audio

- **Gate:** G0; **Prioridad:** P0.
- **Código a inspeccionar:** `qa/fixtures; docs/MATRIZ_QA_OFFLINE_SUPREMO.md`.
- **Depende de:** SA-000.
- **Aceptación:** Al menos 6 clases de activo, máscara SKU manual, hashes, derechos documentados.

### SA-003 · QA de comparación visual y medidas de diversidad

- **Gate:** G0; **Prioridad:** P0.
- **Código a inspeccionar:** `qa/structural_design.cjs; nuevo qa/art_quality`.
- **Depende de:** SA-002.
- **Aceptación:** Reporte: layout IoU, legibilidad, saliencia, contraste, clipping y diferencias de geometría, no solo píxeles.

### SA-004 · Unificar coordenadas fuente/mundo/lienzo y matrices

- **Gate:** G1; **Prioridad:** P0.
- **Código a inspeccionar:** `modulos/estudio_v5/ESTUDIO_V5.html; contour_design.js`.
- **Depende de:** SA-000.
- **Aceptación:** Cada nodo recibe sourceTransform y canvasTransform; tests 9:16,4:5,1:1,16:9.

### SA-005 · Overlay de contornos por máscara y ventana

- **Gate:** G1; **Prioridad:** P0.
- **Código a inspeccionar:** `contour_design.js; ESTUDIO_V5.html:cover`.
- **Depende de:** SA-004.
- **Aceptación:** Split/circle/triptych/contact sin trazos fantasmas ni desalineación.

### SA-006 · Crear SignalGraph e integrar fx heredados como nodos

- **Gate:** G1; **Prioridad:** P0.
- **Código a inspeccionar:** `design_engine.js; ESTUDIO_V5.html:overlayEffects; js/layer_motion.js`.
- **Depende de:** SA-004.
- **Aceptación:** 3 capas geométricas independientes activables y ordenables sin pérdida seed-6.

### SA-007 · Eliminar apagado forzado del legado para rutas seed-7

- **Gate:** G1; **Prioridad:** P0.
- **Código a inspeccionar:** `ESTUDIO_V5.html:generateStructuralDesign`.
- **Depende de:** SA-006.
- **Aceptación:** seed-6 old PNG hashes intactos; nuevo look combine nodes/grid/contour/dither.

### SA-008 · Separar monolito HTML y overrides de render

- **Gate:** G1; **Prioridad:** P1.
- **Código a inspeccionar:** `ESTUDIO_V5.html; js/; scripts/build_portable.py`.
- **Depende de:** SA-004.
- **Aceptación:** Fuentes modularizadas con salida PORTATIL idéntica, old projects abren.

### SA-009 · Mapa de señal multiescala y campos Sobel NMS curvatura

- **Gate:** G2; **Prioridad:** P0.
- **Código a inspeccionar:** `contour_design.js; nuevo js/geometry_analysis.js`.
- **Depende de:** SA-005.
- **Aceptación:** Mapas a múltiples escalas, reproducciones iguales, comparados con fixture de alta frecuencia.

### SA-010 · Render vectorial/tiled de contornos a 1080/4K

- **Gate:** G2; **Prioridad:** P0.
- **Código a inspeccionar:** `contour_design.js; nuevo js/contour_renderer.js`.
- **Depende de:** SA-009.
- **Aceptación:** Sin pérdida de detalle ni costuras en tiles; parámetros normalizados a 1080.

### SA-011 · Conexiones por borde y motivos ancla

- **Gate:** G2; **Prioridad:** P1.
- **Código a inspeccionar:** `ESTUDIO_V5.html:FieldFX; nuevo js/connection_motifs.js`.
- **Depende de:** SA-009;SA-006.
- **Aceptación:** Proximidad,Delaunay,Chain,radial,ortogonal + confidence; curvas, arcos y nodos de tamaño jerárquico.

### SA-012 · Retícula recursiva según imagen y espacio negativo

- **Gate:** G2; **Prioridad:** P1.
- **Código a inspeccionar:** `contour_design.js; nuevo js/layout_grammar.js`.
- **Depende de:** SA-009.
- **Aceptación:** 4 composiciones estructuralmente distintas, sin cortar un SKU protegido.

### SA-013 · Familias de impresión y memoria desarrolladas

- **Gate:** G2; **Prioridad:** P1.
- **Código a inspeccionar:** `contour_design.js; nuevo js/print_surface.js`.
- **Depende de:** SA-009;SA-006.
- **Aceptación:** Atkinson/Floyd/Bayer/BlueNoise, Ink/Paper, ecos, ventanas y glyph cloud configurables.

### SA-014 · Contornos y grabado temporal con campos coherentes

- **Gate:** G2; **Prioridad:** P1.
- **Código a inspeccionar:** `js/layer_motion.js; contour_design.js`.
- **Depende de:** SA-009.
- **Aceptación:** Flujos continuos sin blinking, tiempo cero fijo, frame t reproducible.

### SA-015 · Modelo TextNode con runs, cajas y constraints

- **Gate:** G3; **Prioridad:** P0.
- **Código a inspeccionar:** `ESTUDIO_V5.html:drawHeadline/layerUI; nuevo js/text_model.js`.
- **Depende de:** SA-008.
- **Aceptación:** Contenido exacto UTF-8, 2 fuentes originales, preservación legacy y edición reversible.

### SA-016 · GlyphGeometry y tipografía como fuente de máscaras

- **Gate:** G3; **Prioridad:** P0.
- **Código a inspeccionar:** `nuevo js/text_geometry.js; fuentes bajo licencias existentes`.
- **Depende de:** SA-015.
- **Aceptación:** Texto en path/máscara; per-letra transform; acentos, números, teléfono y SKU idénticos.

### SA-017 · 10 programas tipográficos creativos

- **Gate:** G3; **Prioridad:** P1.
- **Código a inspeccionar:** `nuevo js/text_effects.js`.
- **Depende de:** SA-016;SA-006.
- **Aceptación:** Letter Grid, Word Collage, TypePath, Knockout, Contour, Modular, Echo, Split, SignalGlyph, Kinetic.

### SA-018 · Tipografía animada en Video/Carrusel

- **Gate:** G3; **Prioridad:** P1.
- **Código a inspeccionar:** `js/layer_motion.js; js/video_export.js; js/carousel.js`.
- **Depende de:** SA-017.
- **Aceptación:** Keyframes por palabra/caracter, sin texto inventado; mismo render en export.

### SA-019 · Motor msccs-seed-7 versionado con 9 dominios

- **Gate:** G4; **Prioridad:** P0.
- **Código a inspeccionar:** `ESTUDIO_V5.html; nuevo js/seed_v7.js`.
- **Depende de:** SA-006;SA-012;SA-015.
- **Aceptación:** Hash por canal, source/version/asset; seeds 1-6 reproducidos sin cambios.

### SA-020 · Selección de variantes basada en calidad y diversidad

- **Gate:** G4; **Prioridad:** P1.
- **Código a inspeccionar:** `nuevo js/design_candidate_scorer.js`.
- **Depende de:** SA-019;SA-003.
- **Aceptación:** 1 diseño por pulsación; comparar cuatro opcional, scores y causas visibles, filtros QA.

### SA-021 · Guardar looks, máscaras, semillas y operadores por capa

- **Gate:** G4; **Prioridad:** P1.
- **Código a inspeccionar:** `ESTUDIO_V5.html:snapshotStudio/restoreStudio; js/storage.js`.
- **Depende de:** SA-019.
- **Aceptación:** Reabrir y obtener mismos píxeles/cajas; proyecto anterior migrado no destructivamente.

### SA-022 · Máscaras, oclusiones y protección de producto separadas

- **Gate:** G5; **Prioridad:** P0.
- **Código a inspeccionar:** `ESTUDIO_V5.html:productPlacement/drawIntegratedProduct; nuevo js/mask_graph.js`.
- **Depende de:** SA-004;SA-021.
- **Aceptación:** SKU oficial intacto, sin halo, sombra de contacto, manos y suelo coherentes.

### SA-023 · Seguidor sujeto y selección manual progresiva

- **Gate:** G5; **Prioridad:** P1.
- **Código a inspeccionar:** `nuevo js/subject_mask.js; SceneGraph`.
- **Depende de:** SA-022.
- **Aceptación:** Mascarilla editable sobre foto plana; no depender de modelo remoto para abrir offline.

### SA-024 · Editor de capas completo: groups, blend, masks, snapping

- **Gate:** G5; **Prioridad:** P1.
- **Código a inspeccionar:** `ESTUDIO_V5.html:render/layerUI; nuevo js/layer_graph.js`.
- **Depende de:** SA-006;SA-016.
- **Aceptación:** Undo/redo de transform/propiedades, máscaras, grupos y bloqueos sin desplazamientos.

### SA-025 · RenderAt(t) puro compartido y timeline multipista

- **Gate:** G5; **Prioridad:** P1.
- **Código a inspeccionar:** `js/layer_motion.js; js/browser_render.js; js/video_export.js`.
- **Depende de:** SA-006;SA-021.
- **Aceptación:** Mismo frame a mismo tiempo/semilla en preview/PNG/MP4, con perfil medido.

### SA-026 · Export frame-accurate WebCodecs/FFmpeg local opcional

- **Gate:** G5; **Prioridad:** P1.
- **Código a inspeccionar:** `js/browser_render.js; nuevo js/render_queue.js`.
- **Depende de:** SA-025.
- **Aceptación:** 1080 y 4K condicionados por equipo; fps/timestamps, audio y duración verificados; fallback claro.

### SA-027 · QA cromático y fotométrico de integración

- **Gate:** G5; **Prioridad:** P2.
- **Código a inspeccionar:** `ESTUDIO_V5.html:sceneReference/productLook; nuevo qa/product_fidelity`.
- **Depende de:** SA-022.
- **Aceptación:** Superposición antes/después, color, etiquetas, cajones, ruedas, QR, texto verificable.

### SA-028 · Proyecto portátil con assets SHA y relink

- **Gate:** G5; **Prioridad:** P2.
- **Código a inspeccionar:** `js/storage.js; scripts/build_portable.py`.
- **Depende de:** SA-021.
- **Aceptación:** JSON/ZIP reabre sin conexión y reporta media ausentes; sin base64 masivo.

### SA-029 · Matriz visual de 48 combinaciones + QA SKU

- **Gate:** G6; **Prioridad:** P0.
- **Código a inspeccionar:** `qa/; docs/; fixtures aprobados`.
- **Depende de:** SA-020;SA-024;SA-026.
- **Aceptación:** 4 ratios x 4 estilos x 3 tipos de contenido; revisión visual humana y código reproducible.

### SA-030 · Aceptación publicable y regresión legacy

- **Gate:** G6; **Prioridad:** P0.
- **Código a inspeccionar:** `STUDIOART_PORTATIL.html; ABRIR_SIN_SERVIDOR.html`.
- **Depende de:** SA-029.
- **Aceptación:** Chrome/Edge Win: import/edición/seed/export/reopen/publicación, rollback, seguridad; sin fallas críticas.

## Secuencia mínima de desarrollo

1. Corregir render de ventana con `SourceWindow` y clipping; añadir geometría como nodos versionados. **No** desactivar motores anteriores globalmente.
2. Medir 4 salidas de la misma foto: estudio de contornos, impresión, malla de nodos y collage tipográfico. Cada una debe distinguirse por topología, no por color solamente.
3. Añadir SeedLab y campos de variación por dominio; preservar “un diseño por pulsación”.
4. Consolidar edición por capas con grupos, máscaras, tipografía generativa, efectos y persistencia de proyecto.
5. Unificar preview/export y corregir deformaciones, sincronización y clipping en PNG/MP4.
6. Realizar gate visual con producto SHOPMAX aislado, escena real, las 18 imágenes publicitarias como referencia de textos y video/audio.

## Exclusiones y riesgos

- No prometer reproducción idéntica del código de Geometric; tomar referencia de experiencia y técnicas públicas.
- No habilitar reemplazo generativo de componentes críticos del producto o marcas sin fotografía oficial.
- No interpretar porcentaje de pixeles cambiados como calidad estética.
- No confundir codificación en tiempo real Canvas/MediaRecorder con exportación frame-accurate.
- No sobrescribir proyectos 1.3.4 y anteriores ni cambiar el comportamiento `seed-6` en un proyecto existente.
- No forzar modelos descargables externos como dependencia del modo offline.

## La primera intervención aceptable

**SA-004 + SA-005**: introducir `SourceWindow` y prueba de overlay para `split/circle/triptych/contact` antes de ampliar el número de efectos. Resolver este fallo elimina desalineaciones y hace posible construir capas de señal de mayor nivel sin defectos de composición. Luego proceder a **SA-006/SA-007** para recuperar el potencial de los sistemas geométricos ya presentes.
