# Roadmap de implementación — Supremo Líder

**Enfoque:** progresión por fases verificables, sin romper el flujo de Higgsfield ni los trabajos aprobados.

## V1.0: unificación operativa (incluida en paquete)
1. Congelar copia de tres motores originales. Mantener rutas y botones existentes.
2. Importar `campana_2026.json`, 17 conceptos y frames F01–F10 sin modificación comercial.
3. Biblioteca local IndexedDB con carga de archivos y carpeta; clasificación SKU.
4. Bridge Creative V10 para enviar imágenes/clips desde dashboard.
5. Cámara 2D: pan/zoom/rotación, PNG/GIF/MP4 mediante Pillow/FFmpeg.
6. Carrusel original y 5 presets C4–C8 con fondo sólido/imagen/blur/transparente.
7. MP4 offline mediante render de frames Canvas, no grabación de ventana.
8. QA manual, estados, JSON de proyecto y documentación.

**Gate V1:** ejecutar `tests/qa_static.py`, abrir dashboard en Windows, importar foto Higgsfield, exportar un PNG/GIF/MP4, reabrir navegador y verificar persistencia. Registrar cualquier desviación antes de usar en campaña.

## V1.1: mejoras de interoperabilidad (prioridad alta)
- Proyecto portátil ZIP con relink automático de binarios por SHA-256, metadatos y manifest de archivos.
- Biblioteca de ángulos por SKU con vista multivista y control de prioridad de foto oficial.
- Migración de líneas de tiempo V10 a contrato común, sin duplicar motores.
- Versionado de composiciones y presets por campaña.
- Validadores de fuente, ortografía, contraste, QR y safe zones para Meta/YouTube.
- Presets por SKU (Cofre/Suelo/Rodante/Obra), y reproducción exacta de marca sin IA.

## V1.2: profesionalización del motor audiovisual
- Timeline multipista con keyframes X/Y/zoom/rotación/opacidad, curvas Bézier, máscaras.
- Export H.264/AAC por frames + mezcla de audio no destructiva, sincronización por timestamps.
- Motion backgrounds en CSS/Canvas exportados consistentemente; backgrounds aislados.
- Carruseles C4–C8 con escenas 3D WebGL/WebGPU opcional y modo 2D seguro.
- Plantillas y paquetes de contraportada por canal; PDF/PNG de portadas individuales.
- Render colas: progreso real con cancelación y reanudación, sin duplicación de outputs.

## V2.0: ecosistema maduro
- Proyecto único basado en SQLite/local-first + IndexedDB para UI; almacenamiento NAS opcional.
- Renderización determinista GPU + WebCodecs/FFmpeg; 4K sostenido con memoria controlada.
- Motor de marketing: campañas, versiones, validación de claims/fecha/promoción, aprobaciones.
- Auditoría de producto: máscaras oficiales, chequeos perceptivos de componentes, reportes QA.
- Importadores profesionales (PSD/SVG/GLB opcional con límites de licencias y formatos).
- Integración con Meta/YouTube/Higgsfield sólo con credenciales explícitas y aprobación por acción.

## Matriz de aceptación y responsables

| Fase | Prueba de éxito | Dependencia |
|---|---|---|
| V1 | JSON guarda estados y frames; video MP4 reproducible | Python, Pillow, FFmpeg local |
| V1.1 | Reabrir proyecto en nuevo equipo sin perder medios | ZIP portable / manifest por hash |
| V1.2 | Audio sincronizado y fondo idéntico entre preview/MP4 | motor offline de render en cola |
| V2 | QA SKU reduce errores y permite aprobación humana | bibliotecas oficiales y masters revisados |

### Riesgos prioritarios
- **Alta:** geometría errónea de productos generados en IA. Mitigar usando foto oficial como ancla e invalidar deformaciones.
- **Alta:** carrusel con fondo de export distinto al preview. Mitigar un solo motor de dibujo para ambas salidas.
- **Alta:** cambios de logo y QR. Mitigar inserción de PNG real y prueba de lectura.
- **Media:** alta memoria / tiempo render video a 4K. Mitigar proxies 720/1080 y export determinista por lotes.
- **Media:** persistencia IndexedDB bajo limpieza del navegador. Mitigar respaldos JSON y export ZIP binario V1.1.
