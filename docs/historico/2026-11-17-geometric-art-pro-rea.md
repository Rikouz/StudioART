# Diagnóstico técnico — Supremo Líder / Geometric Art PRO / REA

> **Registro histórico recibido:** 17 de noviembre de 2026. Se conserva el diagnóstico y su backlog como material de referencia; esta actualización no ejecuta las tareas GEO-* ni REA-*.
>
> **Nota de revisión y procedencia:** se descargaron, sin ejecutar su código, los tres paquetes de referencia enlazados. Sus ZIP contienen respectivamente 28, 10 y 21 entradas; los dos paquetes REA describen explícitamente límites de selección/cobertura y análisis estático, coherentes con las cautelas del diagnóstico. El paquete Maestro V4 trata calendarios y marketing, no el editor geométrico. El dominio `geometric-art.com` no se verificó de forma independiente desde este entorno. La versión 1.3.4 que el diagnóstico anotaba como inaccesible quedó disponible después y se incorporó por separado desde `STUDIOART_1_3_4_DISENO_UNICO_Y_CONTOUR.zip`; su auditoría propia se conserva en [docs/AUDITORIA_1_3_4.md](../AUDITORIA_1_3_4.md). Esto no cambia retroactivamente el alcance declarado en el diagnóstico.
>
> **Integridad de las fuentes recibidas (SHA-256):**
> - `STUDIOART_1_3_4_DISENO_UNICO_Y_CONTOUR.zip`: `c002fd1e02e4a5efaf9d1432bd55a7ca42369e851b49d5468f86500405dedfb3`
> - `MSCCS_Auditoria_REA_Geometric_avance.zip`: `40af665ebb8d1956a176759aeb42f203a758dd682e9fb3a4e461a46a130efab8`
> - `MSCCS_REA_Geometric_Parte_2_Manual_Semilla.zip`: `dd5b407d832cf2821d978450fcf06360ca757ab859eca572ad4187c5f0536635`
> - `MSCCS_PACK_MAESTRO_AUDITADO_V4.zip`: `557f00bb853d69b66f45c4cd9b3a646aa7fe6c6be7590b605b45e451f6c3ba44`

**Fecha:** 17 noviembre 2026  
**Alcance:** grabación `12-41-02.mp4` (38,03 s, 1280×1024 a 30 fps), sitio y manual públicos de Geometric Art PRO, dos paquetes REA accesibles y la V3 del carrusel MSCCS disponible en el contexto de la conversación. **No es una auditoría de la nueva versión enlazada**: Google Drive devolvió `404 File not found` para `16yKwERVsuCGfQQCNjQ2oh1g_nFxti1lG`.

## 1. Dictamen

La brecha principal no es estética; es arquitectónica. La línea V3 disponible construye **tarjetas HTML con transformaciones 3D y filtros CSS** y utiliza Canvas/WebCodecs para renderizar sus transiciones. Geometric Art PRO realiza **análisis del contenido de cada fotograma**, distribuye formas y contornos en función de ese análisis, mezcla capas generadas, incorpora movimiento y exporta utilizando los parámetros reales del efecto. Para aspirar a resultados comparables se necesita un motor fuente→análisis→generación→composición→exportación, no más presets CSS.

**Límite de evidencia:** no conocemos qué de esto ya implementa la última versión de Supremo Líder porque la descarga proporcionada está inaccesible. La V3 se usa solo como punto de comparación histórico; no se asignan estados "ausente" a la última versión.

## 2. Fuentes y estado

| Material | Acceso / observación | Alcance de lo comprobado |
|---|---|---|
| Geometric Art PRO | [geometric-art.com/en/pro](https://geometric-art.com/en/pro) | Interfaz pública y apartados de control |
| Manual PRO (actualizado 2026-09-14) | [geometric-art.com/en/manual](https://geometric-art.com/en/manual) | 23 entradas del índice, límites documentados, exportación y preservación |
| Video del usuario | 38,03 s; muestras 0–37,5 s | Variaciones en la misma fotografía, paneles, alternancia con vista limpia y resultados geométricos |
| REA Parte 1 | `MSCCS_Auditoria_REA_Geometric_avance.zip`, 28 archivos | Código público empaquetado, análisis estático y ensayos puntuales |
| REA Parte 2 | `MSCCS_REA_Geometric_Parte_2_Manual_Semilla.zip`, 10 archivos | Comparación 23 secciones, análisis complementario y pruebas limitadas de semilla |
| MSCCS Pack Maestro V4 | `MSCCS_PACK_MAESTRO_AUDITADO_V4.zip` | Calendarios/marketing; **no** versión del editor geométrico |
| Versión actualizada del usuario | Drive ID `16yKwERVsuCGfQQCNjQ2oh1g_nFxti1lG` | **No disponible** por error 404 de Drive, sin revisión de código |
| Carrusel MSCCS V3 anterior | Archivo autónomo local adjunto en conversación | Tarjetas 3D, estilos, reproducción, MP4 Canvas/WebCodecs; no es la versión más reciente |

## 3. Qué se observa en el video

Se analizaron 20 puntos temporales en una grabación de pantalla de la aplicación de referencia. Observaciones verificables:

- 0–12 s: sobre una fuente fotográfica vertical se muestran cambios drásticos de tratamiento: imagen casi intacta, bicromía/alto contraste, fragmentación y variaciones cromáticas.
- 14–26 s: el área central pasa a una vista más despejada de presentación, conservando la composición y permitiendo alternar resultados.
- 28–37,5 s: se regresa a paneles de edición y aparecen tratamientos adicionales sobre la misma imagen: duotono intenso, líneas geométricas y tratamiento de tipo impresión digital.

La grabación no demuestra FPS internos exactos, comportamiento de controles no accionados, calidad del archivo exportado ni arquitectura privada del servidor.

## 4. Qué contiene la referencia Geometric

**Fuente y campo:** importa JPG/PNG/WEBP y vídeo compatible. Normaliza brillo/luminancia, gradientes de bordes, máximos locales y conexiones geométricas. El producto describe RAW FRAME → SOBEL X/Y → LOCAL MAX → DELAUNAY; el análisis de código complementario identifica trazado de isolíneas y flujos tangentes.

**Familias de tratamiento:** Source Contours (Topographic, Flow Engraving), nodos de geometría, conexiones (Proximity, Delaunay, Edge Chain, Radial, Orthogonal, Hybrid), motivos, cadenas circulares, retícula editorial/fragment/data, cortina espectral, ventana de retrato, Dither Print (Atkinson, Floyd–Steinberg, Bayer 4×4, etiquetado Blue Noise), Pixel Memory (archive/echo/glyph), máscaras de sujetos/personas y color/mezcla.

**Variación:** FIELD RANDOM modifica campo geométrico y semilla; RANDOMIZE ALL cambia además familias/colores/capas/movimiento bajo restricciones; un look conserva un conjunto completo de ajustes. **La semilla sola no alcanza para reproducir cualquier ROLL** porque la selección de parámetros utiliza otras llamadas aleatorias independientes.

**Temporalidad/exportación:** programas de movimiento, respuesta a audio, fase congelada para fuentes fijas, PNG, MP4 y alternativa WebM; formatos 1:1, 4:5, 9:16, 16:9. El manual indica exportación MP4 H.264 a 30 fps para perfiles sociales y archivo de look separado de las fuentes.

**Distinción de evidencias:** las capacidades anteriores figuran en la interfaz y/o manual y parte de la implementación es visible en el código cliente entregado en la auditoría. Ninguna extracción estática autoriza afirmar fidelidad pixel-perfect, rendimiento de producción o equivalencia de servidor.

## 5. Qué REA ya resolvió y qué no

- Parte 1: dos JS seleccionados (`studio`, `index`) de nueve inventariados en ese momento; otros siete no seleccionados; límite semántico de 20.000 nodos por archivo, múltiples relaciones desconocidas. La evidencia no ejecuta la aplicación por sí misma.
- Parte 2: cuatro archivos seleccionados (`src` y tres workers) de 15 inventariados en esa ejecución, 11 no seleccionados; análisis parcial y límite semántico. **Los dos análisis no se pueden sumar como si constituyeran cobertura exhaustiva**.
- Los archivos de análisis identifican **tres workers** de contornos, personas y sujetos, referencias a MediaPipe y herramientas de codificación.
- El análisis de código describe luminancia lineal ponderada, isolíneas estilo marching squares, líneas tangentes, generadores de retículas, dither real, variantes pixel memory y campos de protección facial.
- Las pruebas históricas adjuntas comprobaron PNG 1080×1920, MP4 H.264 a 30 fps (caso sin audio) y dos PNG congelados con bytes idénticos bajo la misma sesión/configuración. La prueba pura de hash y campo temporal repetibles se limita a funciones aisladas.
- No hay un registro HAR completo, medición reproducible de rendimiento, verificación exhaustiva de todos los controles, prueba de audio end-to-end, comparación visual de equivalencia o auditoría de servidor.

**Próxima revisión REA:** completar inventario de recursos, analizar cada módulo faltante con límites adaptados, fusionar grafo de importaciones y trabajadores, validar ejecuciones dinámicas legales y autorizadas, recopilar HAR redaccionado, medir exportaciones/tiempos, guardar matrices de evidencia y no inventar funciones no observadas.

## 6. Brechas técnicas por desarrollar en Supremo Líder

| Área | Capacidades necesarias | Entregable verificable |
|---|---|---|
| Motor de fuentes | decode, color management, coordenadas uniformes, memoria acotada, tamaños/ratios | Misma imagen y encuadre desde preview a PNG/MP4 |
| Análisis de imagen | luminancia, Sobel/gradiente, supresión no máxima, contorno, fuerza/tangentes, interés espacial | Mapas de bordes/contorno mostrables en debug |
| Generación geométrica | nodos anclados en bordes, grafos de conexiones, jerarquía, seed, distribuciones | 4 looks realmente distintos y reproducibles para una misma fotografía |
| Familias avanzadas | Topographic/Flow, retículas, Dither, Pixel Memory, espectro, ventanas | Cada efecto cambia píxeles medibles según contenido y controles |
| Compositor de capas | escena no destructiva, máscaras, alfa, modos de mezcla, visibilidad y z-order | Comparación fuente/efectos sin destrucción y exportación idéntica |
| Protección de producto MSCCS | máscaras editables, bloqueo SKU/logotipo/QR/textos, reglas de exclusión | Sin nuevos cajones/ruedas/puertas ni deformación en zonas bloqueadas |
| Temporalidad | tiempo determinista, animaciones por capa, líneas/partículas, timeline | Buscar a t=5 s obtiene mismo fotograma en preview/export |
| Audio/video | análisis por bandas y beat, H.264/AAC mux, validación técnica | MP4 completo, sin pantalla, sin clips audio saturados ni saltos |
| Sistema de proyectos | JSON versionado + activos, deshacer/rehacer, autosave seguro, importación | Reabrir proyecto recupera layout, parámetros, bloqueos y seed |
| UI/UX | editor/pro/público, paneles contextuales, presets, zoom, atajos, diseño responsive | Usuarios editan/ven/publican sin confusión ni pérdida de personalidad |
| Publicación web | recursos empaquetados, URL relativas, caché, carga diferida, accesibilidad | ZIP web se publica y funciona sin cargar imágenes manualmente |
| QA | pruebas unitarias, visuales y de integración, benchmark de memoria | Informe automatizado con defectos trazables por módulo y caso |

## 7. Arquitectura propuesta

```text
ENTRADA (foto / video / audio)
   │
   ├─ Decoder & Color Pipeline ── Asset/Project Store
   │
   ├─ Analysis Worker
   │    ├─ Luminance + gradients + contour atlas
   │    ├─ Saliency / objects + editable protection masks
   │    └─ Temporal delta (video)
   │
   ├─ Procedural Look Engine (PRNG determinista + estado serializable)
   │    ├─ Contours / Nodes / Connections
   │    ├─ Grid / Dither / Pixel Memory
   │    └─ Surface / Motion / Audio Modulators
   │
   └─ Scene Graph & Compositor
        ├─ Source | Effects | Product Locks | Text | Logo | QR
        ├─ Render Frame(t, outputW, outputH)
        ├─ Interactive Preview
        ├─ PNG Export
        ├─ H.264/AAC MP4 Export (misma función de render)
        └─ Public Web Player / Carousel
```

Diseño propio: estudiar comportamiento público y documentación de tercero no implica copiar código propietario, identidad visual ni activos de tercero sin licencia.

## 8. Priorización para el siguiente ciclo de desarrollo

**P0 — motor mínimo operativo**

1. Crear `ProjectDocument` versionado y test de serializar/reabrir, con fuentes, capas, seed, tiempo y protecciones.
2. Unificar preview, still PNG y MP4 con `renderFrame(project,t,format)` compartido.
3. Implementar análisis de bordes y debug con mapas visibles; luego contornos y tangentes.
4. Crear generador con PRNG controlada y pruebas de repetibilidad (misma semilla + mismos parámetros + misma imagen = mismo resultado).

**P1 — profundidad visual real**

5. Cuatro tratamientos competentes: Contour, Editorial Grid, Dither Print y Pixel Memory.
6. Máscaras editables y exclusiones de SKU, identidad, QR; gestión de luz/posición para integración comercial.
7. Presets de look, undo/redo por transacciones y variación por familias con locks selectivos.

**P2 — movimiento, video y UX**

8. Timeline por capas, motion programs, congelar fase, audio bandas y mux AAC.
9. UI fácil/pro/publicación con paneles dependientes, 3D del carrusel y cursor personalidad recuperados.
10. Exportación adaptable, perfiles sociales, verificación de salida y fallback documentado.

**P3 — robustez y publicación**

11. Gestión de grandes bibliotecas, miniaturas, lazy load, workers, memoria, caché y carga diferida.
12. Empaquetado web/publicación, plantillas y evaluación multi-dispositivo.
13. Matriz REA ampliada más comparación de referencia con permisos y pruebas visuales reproducibles.

## 9. Criterios de aceptación que impiden "mejoras cosméticas"

1. **Control real:** alterar `edgeThreshold` o `contourLevels` cambia el mapa geométrico, no solo opacidad CSS.
2. **Reproducibilidad:** mismo proyecto + activos + seed + fase + versión motor produce frame idéntico o con tolerancia numérica documentada según GPU.
3. **Diferencia creativa:** las cuatro variantes cambian distribución y familia geométrica, no solo tono/borde/sombra.
4. **Fidelidad comercial:** producto bloqueado conserva cada cajón, rueda, puerta, etiqueta y relación de escala; excepciones intencionales deben marcarse explícitamente.
5. **Capas seguras:** logo/QR/textos quedan en capas superiores independientes y no reciben dither, deformaciones ni recortes por accidente.
6. **Export completo:** sin `getDisplayMedia`, número exacto de cuadros, duración y fps verificables con `ffprobe`; audio se examina por niveles de pico y continuidad.
7. **Paridad visual:** preview y export usan mismo compositor; diferencias de recorte, posiciones y fase deben disparar pruebas.
8. **Operación offline:** el editor permanece funcional sin red para fotos/local; funciones que requieren descargas de modelos se identifican como dependientes y se ofrecen paquetes locales autorizados. WebCodecs se detecta y se ofrece alternativa, sin afirmar compatibilidad universal con `file://`.
9. **Publicación real:** visitantes reciben medios desde el paquete web desplegado sin importación manual y sin herramientas de edición.

## 10. Escenario de prueba de referencia

- Mismo retrato vertical usado en la grabación (si hay permiso de uso), con 4 looks y 4 variantes de seed, fase congelada y fase en movimiento.
- Foto original SHOPMAX 962703A7 y 965209S7, con máscaras que deben impedir cambios en cajones, ruedas, tapa y marcas.
- Máquina YARDMAX y operador en entorno real para probar máscaras, interacción con persona, escalas y sombras.
- Un clip de 5 segundos para comprobar fotogramas, audio, reproducibilidad y exportación sin captura de pantalla.
- Salidas mínimas: 1080×1920, 1920×1080, 1080×1080, 1080×1350, y 4K cuando lo permita el equipo.

## 11. Qué falta para una comparación definitiva de la versión nueva

Recuperar el contenido de la versión vinculada a `STUDIOART_1_3_4_DISENO_UNICO_Y_CONTOUR` (resubir ZIP/HTML o habilitar acceso al conector). En cuanto esté disponible: inventariar módulos reales, identificar implementado/parcial/inexistente, ejecutar pruebas de navegador y exportación, documentar cada error con ubicación de código y **actualizar este diagnóstico sin sobrescribir trabajo no verificado**.

---

**Referencias:** [Geometric Art PRO](https://geometric-art.com/en/pro); [Manual Geometric Art PRO](https://geometric-art.com/en/manual); paquetes `MSCCS_Auditoria_REA_Geometric_avance.zip` y `MSCCS_REA_Geometric_Parte_2_Manual_Semilla.zip` (11 nov 2026); video del usuario `12-41-02.mp4`.

# Backlog ejecutable de motor geométrico — Supremo Líder (propuesta)

**Regla de evolución:** un cambio comprobable por ciclo; tests de regresión antes de declarar éxito. Estado inicial: **pendiente de confirmar en el código más reciente**. Este documento no autoriza sobrescribir main ni aprobar ramas pendientes.

| ID | Prioridad | Dependencia | Implementación | Prueba de aceptación | Estado |
|---|---|---|---|---|---|
| GEO-01 | P0 | — | Schema `ProjectDocument` versionado, con activos, ratios, máscaras, seed y tiempo | Guardar/cargar sin pérdida y migraciones probadas | Por verificar |
| GEO-02 | P0 | GEO-01 | `renderFrame(project,t,w,h)` compartido por preview y salidas | PNG y cuadro MP4 reproducen posiciones y composición | Por verificar |
| GEO-03 | P0 | GEO-02 | Luminancia, Sobel, gradientes, supresión máxima y mapas de debug en worker | Al variar umbral cambia mapa medible sin congelar UI | Por verificar |
| GEO-04 | P0 | GEO-03 | Topographic contour y flujo tangente | Contornos siguen rasgos y no son simples overlays decorativos | Por verificar |
| GEO-05 | P0 | GEO-01,03 | PRNG determinista, `LookDocument` y lock de parámetros | Variantes repetibles a misma seed; variación distinta con seed distinta | Por verificar |
| GEO-06 | P1 | GEO-03,05 | Geometry nodes y enlaces (proximidad, Delaunay) | Alineación verificable con bordes y líneas soportadas | Por verificar |
| GEO-07 | P1 | GEO-02,03 | Grid editorial/fragment/data | Celdas y negativos dependen del contenido fuente | Por verificar |
| GEO-08 | P1 | GEO-02,03 | Dither Atkinson/Floyd/Bayer/ruido validado | Imagen realmente redifundida, tono y grano corregibles | Por verificar |
| GEO-09 | P1 | GEO-02,03,05 | Pixel memory (cells/echo/windows/glyph) | Mismo estado temporal + seed produce resultado estable | Por verificar |
| GEO-10 | P1 | GEO-01,02 | Máscaras editables: producto, marca, logo, QR, texto | Ningún efecto atraviesa región protegida sin permiso | Por verificar |
| GEO-11 | P1 | GEO-01,05 | Presets, undo/redo transaccional y variación con exclusiones | Reabrir/undo restaura composición exacta | Por verificar |
| GEO-12 | P2 | GEO-02,05 | Timeline determinista y módulos motion | `renderFrame(t)` reproducible en reproducción, seek, export | Por verificar |
| GEO-13 | P2 | GEO-02,12 | Audio análisis y H.264/AAC mux | MP4 con duración/fps/picos/continuidad válidos | Por verificar |
| GEO-14 | P2 | GEO-10,11 | UI fácil, avanzada y pública manteniendo 3D/patita | Efectos y bloqueo visibles, controles públicos excluidos | Por verificar |
| GEO-15 | P3 | GEO-01,02 | Asset manager: miniaturas, lazy load, memoria/workers | Importar bibliotecas voluminosas sin bloquear UI | Por verificar |
| GEO-16 | P3 | GEO-02,14 | Paquete publicable web, CSP/paths, export import | Funciona desplegado con medios y sin paneles editor | Por verificar |
| GEO-17 | P3 | Todos | QA visual, exportaciones y matriz multipantalla | Reporte automático paso/fallo + pruebas manuales firmadas | Por verificar |
| REA-01 | P0 referencia | — | Inventario de bundles y alcance REA completo | Manifiesto con cada archivo seleccionado/omitido/limitación | Por verificar |
| REA-02 | P1 referencia | REA-01 | Ensayos autorizados de random/undo/looks | Tabla inputs/outputs reproducibles y capturas | Por verificar |
| REA-03 | P2 referencia | REA-02 | Captura autorizada HAR, audio, export y benchmarks | Evidencia de comportamiento, privacidad/performance sin supuestos | Por verificar |

## Nota de revisión posterior — 2026-11-17

- La inspección del V3 local confirma el contraste descrito: la interfaz usa `perspective`, `translate3d`/`rotateY` y filtros CSS; la ruta MP4 usa `VideoEncoder`/`VideoFrame` de WebCodecs. Esto verifica la descripción de esa copia local, no la del servidor de Geometric.
- El ZIP de la versión 1.3.4 quedó accesible después de redactarse este diagnóstico y se importó al repositorio. El paquete incluye su propio informe, `docs/AUDITORIA_1_3_4.md`; se mantiene separado de este registro histórico y no se reescribe la limitación de alcance original.
- La auditoría ART posterior, basada en esa misma versión, quedó archivada con sus documentos, PDF, plan, backlog de 31 tareas, matriz de 48 casos y logs en [docs/historico/1.3.4-art/](1.3.4-art/README.md). Sus tareas siguen sin implementarse.
- La auditoría del paquete 1.3.4 registra 17 comprobaciones aprobadas. En este checkout, las validaciones de manifiesto (84 rutas), sintaxis (29 JS), auditoría de recursos, enlaces locales, portátiles y las regresiones de Biblioteca/Cámara/Carrusel pasan. `python3 scripts/qa_all.py`, ejecutado con `@napi-rs/canvas` 1.1.1, se detiene en `qa/studio_composition.cjs:157` por una aserción de píxeles. Las otras regresiones del conjunto se ejecutaron individualmente y pasaron. No se modificó la aplicación ni el backlog para ocultar este resultado.
- No se realizó en este entorno una auditoría visual en navegador real ni una verificación independiente del sitio público. Las tareas GEO-* y REA-* permanecen como propuestas históricas, no ejecutadas.
