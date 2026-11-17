# StudioART 1.3.4 — Auditoría de arquitectura, diseño generativo y brecha frente a GEOMETRIC

**Fecha:** 17 de noviembre de 2026  
**Base exclusiva de análisis:** `STUDIOART_1_3_4_DISENO_UNICO_Y_CONTOUR.zip` (110 entradas, 3,727,715 bytes).  
**SHA-256:** `c002fd1e02e4a5efaf9d1432bd55a7ca42369e851b49d5468f86500405dedfb3`  
**Naturaleza:** auditoría de código y evidencia documental; **no es una versión corregida del software**. Ningún archivo fuente del usuario fue alterado.  
**Referencias:** https://geometric-art.com/en/pro y https://geometric-art.com/en/manual (manual actualizado 14-09-2026). El video adjunto `12-41-02.mp4` se utiliza como referencia visual, no como prueba de código interno de Geometric.

## 1. Dictamen ejecutivo

StudioART 1.3.4 **no es una versión primitiva**: integra el motor `msccs-seed-6`, treinta perfiles visuales, diez arquitecturas, seis tratamientos de fondo, rutas de isolíneas (Sobel + marching squares), grabado tangente, aproximación por primitivas, composición por planos, capas editables, máscaras poligonales, historial de capas, canales independientes de semilla, Play y exportación GIF/video. Biblioteca, Cámara, Carrusel y Video tienen interfaces y regresiones propias. Se debe **conservar el diseño, los archivos de proyecto y los motores acumulados**.

**La principal brecha con Geometric no es el número de botones.** Es que StudioART elige una arquitectura editorial predefinida y un tratamiento principal; Geometric orquesta simultáneamente análisis de señales, geometría jerárquica y capas de efectos que responden a la imagen. Más relevante aún, el paso `seed-6` **apaga explícitamente la retícula/nodos/contornos/dither heredados** al escoger su tratamiento; por ello varios motores que ya existen no participan en la nueva generación automática. Es una pérdida de expresividad por orquestación, no una ausencia completa de algoritmos.

**Segunda falla estructural:** el render de fondo dibuja ventanas y recortes, pero su overlay de contornos se dibuja a pantalla completa en coordenadas de la fotografía de origen. El overlay no hereda la misma máscara ni cada transformación del tríptico/contacto. Así pueden aparecer contornos en zonas sin fotografía y efectos desalineados.

**Tercera brecha:** la tipografía es editable y puede tener máscaras/cajas, pero todavía no es geometría generativa: se renderiza principalmente con `fillText`, sin contornos de glifo como nodos, sistemas por palabra/carácter, texto sobre rutas o máscaras de texto enlazadas al motor de señales.

**La meta propuesta:** evolucionar a `msccs-seed-7` con motor de escena + grafo de efectos + geometría adaptativa + geometría tipográfica. No sustituir ni borrar los motores seed-1 a seed-6.

## 2. Qué se comprobó directamente

| Evidencia | Archivo/ruta | Resultado |
|---|---|---|
| 30 familias de diseño | `modulos/estudio_v5/design_engine.js` | Perfiles de estilo parametrizados; no son treinta algoritmos geométricos independientes. |
| 10 arquitecturas | `modulos/estudio_v5/contour_design.js` | Plantillas con ventanas y posiciones de título (`rects`, `title`). |
| 6 tratamientos | mismo archivo | `photo`, `contours`, `engraving`, `pixels`, `duo`, `ribbons`. |
| Generador nuevo | `modulos/estudio_v5/ESTUDIO_V5.html`, `generateStructuralDesign` | `msccs-seed-6`, un diseño por pulsación; arquitectura/treatment seleccionados por canales de semilla. |
| Canales de semilla | mismo HTML, `seedDomains` | Solo `layout`, `color`, `field`; reproducibles, pero tipografía, máscara, iluminación y motion carecen de canales creativos dedicados. |
| Desactivación de señales | mismo HTML, `generateStructuralDesign` | `fxNodes:false`, `fxGrid:false`, `fxContour:false`, `fxDither:'off'`, `fxFinish:'none'`. |
| Overlay global | mismo HTML, override de `cover()` | `ctx.drawImage(overlay,0,0,W,H)` tras dibujar las ventanas; sin clip/transform de cada ventana. |
| Resolución de análisis | mismo HTML, `designMapFor`, `contourMapFor` | Proxy de diseño aprox. 42 × 94 máx.; proxy de contornos aprox. 110 × 150 máx. Depende del formato. |
| Capas tipográficas | mismo HTML, `drawHeadline`, `layerUI`, `render` | Texto editable, 2 fuentes incluidas, pesos, tamaño, caja, máscaras, rotación, opacidad, z-order. Sin operadores de glifo geométrico. |
| Integración de producto | mismo HTML, `productPlacement`, `sceneReference`, `drawIntegratedProduct` | Colocación, soporte, ajuste cromático y sombra **existen**; falta segmentación semántica de una fotografía plana y control automático fiable de oclusiones. |
| Exportación de video de Estudio | `js/browser_render.js` / HTML embebido | `canvas.captureStream(0)` + `MediaRecorder`, **no grabación de pantalla**. Codificación en tiempo real con reloj; MP4 depende del navegador; WebM de respaldo. Corto de salida fijo en 720 px. |
| Pruebas del motor | `qa/structural_design.cjs` | Testa 20 diseños, 10 arquitecturas, 6 tratamientos, reproducción PNG y diferencia de píxeles >12% en fixture sintético. No califica sofisticación visual. |
| Documentación de límites | `docs/AUDITORIA_1_3_4.md` | Reconoce ausencia de segmentación semántica, seguimiento temporal real desde video y QA integral Chrome/Edge. |

### Estado de las pruebas ejecutadas en esta auditoría

- **Aprobadas:** `scripts/qa_static.py`, `qa/qa_source_release.py`, `qa/qa_module_links.py` dentro de `qa_all.py`, y siete pruebas Node independientes: `camera_revision`, `carousel_revision`, `design_maps`, `library_persistence`, `primitive_engine`, `scene_bridge`, `video_export`.
- **No verificadas aquí:** pruebas nativas Canvas (falta `@napi-rs/canvas` en el entorno), pruebas que indirectamente requieren esa dependencia, y ejecución completa mediante Chrome/Edge. El intento de captura de Chromium no devolvió una pantalla verificable.
- **Limitación histórica:** `qa/legacy_seed3.cjs` invoca `git show` para leer un commit, pero el ZIP distribuido no contiene `.git`; falla por falta de historial en esta copia, no demuestra un defecto funcional de seed-3.
- **Aviso estático:** referencia a un visor editorial opcional ausente; sin errores de rutas locales críticos detectados.

**No afirmamos que esta sesión reprodujo las diecisiete aprobaciones publicadas en `docs/AUDITORIA_1_3_4.md`.** Esas diecisiete son evidencia declarada por el propio proyecto; la verificación independiente de esta sesión es parcial y queda registrada en los logs adjuntos.

## 3. Por qué StudioART todavía no logra el aspecto de Geometric

### 3.1. Presets frente a gramática generativa

En `design_engine.js`, cada familia está resumida en ancho, escala de fuente, margen, opacidad, colores, tipo de campo y marcador. Cambiar de una familia a otra puede mejorar una composición comercial, pero no construye por sí mismo nuevas relaciones entre contornos, imágenes, símbolos y texto. Las diez arquitecturas contienen rectángulos normalizados y posiciones de titular **fijas**. No son una retícula fragmentaria que se divide en respuesta a zonas de alta información o saliencia.

**Corrección:** diseñar una gramática de composición por reglas y restricciones: dividir/combinar módulos, jerarquía visual, regiones de silencio, pesos de contorno, tamaños micro/medio/héroe, ventanas vinculadas a objetos y legibilidad del titular. Seleccionar y evaluar candidatos antes de renderizarlos.

### 3.2. Las capas geométricas no se pueden combinar suficientemente

El tratamiento `photo/contours/engraving/pixels/duo/ribbons` se elige como alternativa única. Al entrar en seed-6 se desactivan sistemas existentes `fxNodes`, `fxGrid`, `fxContour` y `fxDither`. Geometric documenta una composición por **capas de señal** con nodos, conexiones, motivos, círculos, retículas, impresión, extrusiones y memoria de píxeles, cada una con visibilidad y parámetros independientes.

**Corrección:** un **grafo de operadores** con capas independientes (ON/OFF, intensidad, máscara, mezcla, semilla, animación, orden), más un catálogo de looks que active combinaciones coherentes. Reactivar lo existente como nodos adaptadores en vez de duplicarlo.

### 3.3. Los contornos tienen resolución y tratamiento insuficientes para microdetalle

El motor actual sí implementa Sobel, marching squares y flujos tangentes: eso debe conservarse. Pero usa un proxy pequeño y parámetros globales. El trazado de grabado tiene integraciones cortas y el programa `pixels` dibuja celdas de tamaño fijo con poca relación estructural con el contorno; `duo` es un umbral simple. No existe un pipeline multiescala coherente para líneas finas 1080/4K, ni un sistema equivalente de ventanas de memoria, ecos, glifos y jerarquías geométricas combinables.

**Corrección:** pirámide de imagen + mapas de borde/confianza/curvatura/tangente/saliencia; extracción de segmentos fuertes con non-maximum suppression, simplificación de polilíneas por error y densidad adaptativa; render por mosaicos a resolución de salida.

### 3.4. El generador trata el texto como contenido, no como material visual

`drawHeadline()` hace `fillText()` con una caja; las capas de texto admiten formato y transformación general. No permite descomponer palabras o caracteres para diseñar retículas de glifos, caligramas, deformaciones locales, proyección de contornos, fragmentación modular ni motion sincronizado por glifo. El estilo “Collage tipográfico” pertenece al catálogo de perfiles, pero no es todavía un motor tipográfico comparable a una gramática de letras.

**Corrección:** `TypographyGeometryEngine`: texto como `TextNode` editable con modelos de glifos, cajas, trayectorias vectoriales, jerarquías, reglas semánticas y animaciones, manteniendo la cadena exacta original para exportación y accesibilidad. No convertir texto comercial en píxeles irreversibles.

### 3.5. Escena, recortes y producto requieren datos geométricos compartidos

Cuando el sujeto forma parte de una fotografía plana, el sistema no conoce su máscara. `protectProduct` y las herramientas de contacto sí trabajan bien cuando se aporta una capa separada. Una arquitectura puede recortar un producto ya integrado en una foto; un contorno full-frame puede cruzar una zona vacía o un título.

**Corrección:** `SceneGraph` con capas y máscaras en coordenadas fuente → mundo → lienzo, detección de sujeto **opcional**, máscara manual refinable y protección de piezas, logos y QR. La geometría debe respetar la máscara de cada ventana y los planos de oclusión. El compositor comercial debe aplicar después ajustes de temperatura/luz, perspectiva, punto de apoyo, sombra de contacto y defringe, sin modificar cajones/ruedas/etiquetas originales.

### 3.6. La semilla actual genera diversidad visible, no necesariamente diversidad estética

Una matriz de 30 × 10 × 6 no implica 1,800 lenguajes creativos independientes. Las familias comparten el mismo renderer, los layouts están predefinidos y los tratamientos son mutuamente excluyentes. Los tres canales iniciales reciben el mismo valor de raíz y se pueden variar por separado posteriormente; el sistema no mide semejanza compositiva ni descarta resultados débiles. El test de “12% de píxeles diferentes” también se supera cambiando grandes fondos, sin mejorar la calidad.

**Corrección:** seed-7 con canales `structure`, `typography`, `geometry`, `surface`, `palette`, `lighting`, `motion`, `decoration`, `integration`; hashes por canal + `engineVersion` + hashes de assets y fuentes. Generar 8–16 candidatos internos, puntuar reglas comerciales y diversidad; **mantener un resultado por pulsación** y ofrecer una galería de cuatro variantes solo cuando el usuario active Comparar. Guardar receta exacta. Es fundamental distinguir **aleatoriedad** de **variedad de diseño**.

### 3.7. La exportación no es todavía una tubería de producción determinista

`browser_render.js` genera cuadros Canvas a tiempos objetivo y los ingresa en `MediaRecorder`, que depende del reloj real y la capacidad del navegador. Esto **no captura la pantalla** y es una mejora real frente a `getDisplayMedia`; pero la salida puede sufrir tiempos irregulares con mucha carga, caer a WebM o no sostener los fps previstos. El render de Studio usa 720 px en el lado corto para video y no acredita 1080/4K. El proyecto carece de una aceptación integral real con medios del usuario.

**Corrección:** `renderAt(t, recipe, resolution, frameIndex)` común para preview, PNG, GIF, MP4 y navegador; codificación WebCodecs con timestamps y muxing donde se soporte, más alternativa FFmpeg local opcional y fallback MediaRecorder etiquetado como “tiempo real”. Probar repetición por hashes de frames, duración, cortes, audio y memoria. No prometer MP4 si el navegador solo admite WebM.

## 4. Motores a consolidar o crear

| Motor | Estado 1.3.4 | Trabajo requerido | Prioridad |
|---|---|---|---|
| **GeometryAnalysisEngine** | Sobel, mapas de actividad, tangentes y primitivas parciales | Pirámide multiescala, NMS, curvatura, saliencia, segmentación opcional y mapas compartidos | P0 |
| **SceneGraph / MaskEngine** | Planos, máscaras poligonales, producto separado | Matrices de transformación, clipping por ventana, máscaras alfa no destructivas, oclusiones y coordenadas unificadas | P0 |
| **SignalGraph / NodeComposer** | Efectos antiguos más tratamientos excluyentes | Integrar nodos heredados y nuevos en pila multipaso; blend, orden, semilla y máscara por nodo | P0 |
| **LayoutGrammarEngine** | 10 plantillas fijas; 30 perfiles | Retícula recursiva, fragmentación guiada, collage editorial por reglas, evaluación de espacio libre | P0 |
| **TypographyGeometryEngine** | FillText y capas editables | Glifos/path, texto sobre curvas, recorte por letras, collage, composición variable por palabra/caracter y motion | P1 |
| **SeedLab v7** | 3 canales independientes seed-6 | 9 canales, recetas versionadas, diversificación supervisada, four-way preview, replay exacto | P1 |
| **PrintSurfaceEngine** | `duo` y dither heredado | Floyd/Atkinson/Bayer/ruido azul, pitch físico, dos tintas y bordes protegidos, ecos | P1 |
| **ContourFlowEngine 2** | marching squares y tangente | Integración adaptable, simplificación, continuidad entre tiles, densidad y fase temporal | P1 |
| **ConnectionMotifEngine** | Nodos y Delaunay heredados | Confianza de aristas, radial/ortogonal/híbrido, motivo en anclas y círculo encadenado | P1 |
| **ProductIntegrationEngine** | Escena/contactos/luz con calibración | Validación SKU, sombras de contacto, perspectiva, máscara de sujeto, fotometría comparativa | P1 |
| **MotionTimelineEngine** | Play y 21 efectos en módulos | Keyframes por nodo/texto, motion temporal con persistencia de fase, audio por bandas, mismo render | P2 |
| **RenderExportEngine** | MediaRecorder + GIF/cámara + video | Frame-accurate WebCodecs/FFmpeg opcional, multiperfil 1080/4K, pruebas A/V | P2 |
| **AssetGraph / QA Visual** | JSON con medios y bibliotecas | SHA-256, proyecto portable, recursos enlazados, QA de marca, comparativa vista/export | P2 |

## 5. Correcciones de código inmediatas, sin sustituir la interfaz

1. **SA-001: eliminar la desactivación forzada de campos en `generateStructuralDesign`.** No se recomienda simplemente borrar la línea: primero convertir `fxNodes/Grid/Contour/Dither` en nodos del compositor y conservar la compatibilidad seed-6. Activar combinaciones mediante un nuevo preset versionado. Prueba: Arquitectura *split* + contornos + nodos + tinta, cada capa conmuta de forma aislada.
2. **SA-002: acoplar geometry overlay al clipping de la imagen.** Sustituir `ctx.drawImage(overlay,0,0,W,H)` global por render por `SourceWindow` con la **misma** máscara y `sourceTransform` que cada panel del background. Prueba: split, circle, triptych, contact; ningún trazo de fuente fuera de las ventanas sin que un nodo deliberadamente lo ordene.
3. **SA-003: unificar unidades de detalle.** Los grosores y pitches deben especificarse en unidades del lado corto normalizado a 1080 px, no en celdas fijas de proxy de 5 px. Prueba a 1:1, 9:16 y 16:9: mismo tamaño físico relativo y sin bordes pixelados.
4. **SA-004: impedir trabajo en bucle de render.** `contourMapFor` debe cachear mapas multiescala por hash de fuente/proxy/versión, reusar geometría entre frame y trasladar al GPU/worker solo si conviene. Test: 30 fps sostenidos en proxy y memoria liberada al reemplazar fuente.
5. **SA-005: introducir QA visual significativo.** Sustituir “12% de píxeles distintos” como objetivo estético por una batería que mida bounding boxes, cobertura de sujeto, intersección de texto/producto, contraste, nitidez, diversidad de estructura y fidelidad del color de marca. Mantener el 12% solo como humo de diferencia.
6. **SA-006: desacoplar el HTML de 2,518 líneas.** El `ESTUDIO_V5.html` modifica `render`, `cover`, `drawAll`, `getVisual` y `putVisual` en capas de overrides; separar en módulos independientes y contrato `EditorState`, `Scene`, `Renderer`, `Effects`, `History`, `Exporter`, sin romper el `STUDIOART_PORTATIL.html` de distribución.
7. **SA-007: test real de exportación.** Retener `MediaRecorder` como fallback. Implementar ruta determinista y comprobar para cada formato el primer, medio y último fotograma, fps, duración, audio, transición y compatibilidad offline.
8. **SA-008: preservar edición comercial.** El texto original, CTA, fuente, marca y SKU se mantienen como datos editables; nunca depender de AI para reproducir fielmente un logo/QR o componentes de una máquina.

## 6. Criterios de diseño del motor tipográfico

**TextNode editable**: contenido UTF-8, locale, familia/peso reales, runs de estilo, interletrado, interlineado, tracking, kerning, line breaks, baseline, bounding box, constraints, z-order y transform local. **GlyphGeometry**: contornos por glifo procedentes de las fuentes con licencia/importadas, sin reemplazar ni inventar caracteres. **Tratamientos:** (a) Letter Grid, (b) Word Collage, (c) Type on Path, (d) Knockout Type, (e) Contour Type, (f) Modular Type, (g) Type Echo, (h) Split Letter, (i) Signal Glyphs, (j) Kinetic Type. Cada tratamiento requiere semilla y máscara propios. La exportación conserva una representación accesible del texto en el proyecto; PNG/MP4 son arte rasterizado por naturaleza.

**Seguridad comercial:** NO alterar letras, precios, número telefónico, SKUs, logotipo ni URL cuando el tipo de capa sea protegido. Los tratamientos pueden ser decorativos, pero el texto legal/CTA debe permanecer legible. Test automático con comprobación de la cadena fuente y de contraste; la lectura del arte raster final puede requerir comprobación humana.

## 7. QA de aceptación y benchmarks

Conjunto mínimo: (A) imagen sintética con rampa, puntos, bordes y curvas; (B) fotografía real de taller sin publicidad; (C) producto SHOPMAX recortado independiente; (D) una composición de tus 18 carteles anteriores, **solo como benchmark de textos y formato — sus titulares ya están horneados en píxeles**; (E) rostro y cuerpo humano con permiso; (F) video corto con audio original. Se comparará a Geometric por familia de salida y experiencia, no mediante copia de código o UI protegida.

Gates obligatorios:

- **Visual:** cuatro looks de una misma fuente con **arquitecturas diferentes**, no sólo color; al menos 3 operadores geométricos independientes combinados; originales intactos; no halos ni overlaps críticos.
- **Geometría:** contornos continuos; bordes y conexiones guiadas por fuente; trazos alineados entre `split`, `triptych`, `circle` y sus máscaras; test de coherencia en 9:16, 4:5, 1:1 y 16:9.
- **Texto:** un titular de dos líneas con palabras y glifos estilizados, editable/reversible; línea comercial intacta y legible; el mismo look reproduce glifos y posiciones con la misma semilla.
- **Reproducibilidad:** misma semilla+receta+versión+hashes de assets = mismos frames y cajas. Semilla distinta debe superar umbrales geométricos (cambios de layout y distribución) además de diferencia de píxeles.
- **Capas:** bloquear capa/texto/producto, generar variante, comprobar que no cambian; máscaras, rotación, orden, recorte y undo/redo persisten al reabrir JSON.
- **Video:** preview y PNG del frame N coinciden con frame N exportado dentro de tolerancias documentadas; MP4/H.264 si es compatible, o fallback explícito sin etiquetar WebM como MP4; sin saltos ni distorsión del producto.
- **Offline:** abrir y reabrir desde `file://` en Windows Chrome/Edge; no fetch remoto obligatorio para el editor; empacado independiente de redes y fuentes; proyecto portable con hashes.

## 8. Qué se mantiene sin tocar

Se conserva íntegra la estética actual de StudioART 1.3.4, la navegación Fácil/Pro, colores y personalidad de la interfaz, el modo sin servidor, las funciones comerciales MSCCS, catálogo, Higgsfield, Biblioteca, Cámara, Carrusel y Video. El código de la versión 1.3.4 sigue siendo el baseline. `seed-7` es **aditivo**, y un proyecto `seed-1…6` se debe abrir con su motor original por compatibilidad. No extraer/codificar Geometric propietario; solo construir implementaciones originales de técnicas públicas y comportamientos documentados.

## 9. Orden de entrega propuesto

**Gate G0:** fijar baseline 1.3.4, completar QA/browser, fixtures y métricas.  
**Gate G1:** corregir clipping/matriz de transformaciones y resucitar capas heredadas en un SignalGraph.  
**Gate G2:** motor geométrico multiescala + composición guiada y variaciones de estructura.  
**Gate G3:** tipografía generativa, máscaras de glifo y animación por palabra/carácter.  
**Gate G4:** seed-7 con variedad controlable, estilos combinables y revisión/guardado de looks.  
**Gate G5:** integración comercial, QA SKU, video frame-accurate, export multi-formato y publicación.  
**Gate G6:** aceptación integral en Chrome/Edge Windows con materiales MSCCS, resultados visuales aprobados y regresiones en modelos anteriores.

**Estado final:** diagnóstico y plan listos. **Las correcciones no se han aplicado al software en este informe**; primero se preserva el proyecto y se establece la batería de aceptación. Adjuntamos backlog de ejecución, matriz QA y logs.
