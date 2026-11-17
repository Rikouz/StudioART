# QA · Supremo Líder V1

**Corte:** 10/11/2026  
**Tipo de prueba:** estática, API local, navegador en harness de contenido aislado. No sustituye QA final en Windows/XAMPP.

## 1. Resultados verificados

| Prueba | Resultado | Alcance |
|---|---|---|
| 17 conceptos: 9 SHOPMAX + 8 YARDMAX | PASS | Campaña del ZIP, sin productos ficticios |
| 170 fotogramas F01–F10 | PASS | 10 por concepto |
| Prompts de imagen y video hasta 3,000 caracteres | PASS | Ningún exceso de límite |
| Todos los archivos SKU e identidad existen | PASS | Comprobación de rutas |
| QR original | PASS | `https://wa.me/526563119913` recuperado por decodificador |
| Sintaxis app.js, storage.js, camera.js, carousel.js y Creative V10 | PASS | Node `--check` |
| IDs HTML duplicados | PASS | Ninguno |
| Funciones dashboard (harness Chromium) | PASS | 17 filas, prompt limpio 1,564 caracteres, diez frames, cambio de páginas |
| Carrusel (harness Chromium) | PASS | Cinco tarjetas iniciales, selección C7, render de controles |
| Cámara (harness Chromium) | PASS | Lienzo 540 × 960 y controles; sin medios reales en harness |
| Exportador HTML público | PASS | HTML autocontenido generado con cinco tarjetas y ejecutado sin JS errors |
| GIF real vía `/api/render` | PASS | 8 fotogramas, archivo GIF animado validado con Pillow |
| MP4 real vía `/api/render` | PASS | H.264, 1.00 s, `ffprobe` correcto |
| MP4 + audio de menor duración | PASS | H.264 + AAC, video mantiene duración 1.00 s por padding de silencio |
| `server.py` local /api/health | PASS | HTTP 200 y capacidades ffmpeg/Pillow |
| 5 estilos C4–C8 configurables | PASS estático | Misma función Canvas de preview y video; estética requiere QA visual con fotos |
| Fondo violeta fijo del carrusel clásico | Corregido en código | Mismo fondo escogido en `frameAt`, se necesita exportar MP4 en navegador real |

## 2. Incidencias reales detectadas y corregidas

1. **Clave de prompt limpia equivocada.** La campaña usa `SIN_LETRAS` y no `FOTO_LIMPIA`. Corrigí el dashboard; prompt BF-I01 ahora carga 1,564 caracteres.
2. **El MP4 podía terminar antes si el audio era corto.** Añadí `apad` a FFmpeg; comprobado con fuente WAV más corta.
3. **Fondo transparente tratado como fondo negro al exportar MP4.** Se añadió aplanado al color configurado antes de codificación, conservando transparencia sólo en PNG.
4. **V3 exportaba un degradado violeta fijo.** Sustituido el fondo del render por `SL_LEGACY_BG`, con panel de color/imagen.
5. **El HTML autónomo público requería verificación de script embebido.** La prueba creó cinco tarjetas y las ejecutó sin errores.

## 3. Límites de validación

- El Chromium automatizado bloqueó navegar a `http://127.0.0.1` con `ERR_BLOCKED_BY_ADMINISTRATOR` en este entorno. Para verificar controles del dashboard se utilizaron scripts y campaña inyectados en un documento aislado. Esto no prueba todas las cargas de assets desde el servidor local.
- La transferencia `postMessage` entre dashboard y Creative V10 está implementada y pasó comprobación estática; **no fue probada extremo a extremo** con un iframe navegando en localhost.
- IndexedDB y `webkitdirectory` requieren prueba real en navegador con perfil persistente. Las pruebas aisladas usaron biblioteca vacía simulada.
- La vista completa de C4–C8 usando fotografías reales, su audio y exportación de secuencias largas **requieren QA en la computadora del usuario**. El motor FFmpeg sí fue probado con fotogramas independientes.
- No se certificó la fidelidad geométrica de los recortes YARDMAX frente a fuentes del fabricante; siguen identificados como QA pendiente.
- Ninguna herramienta implementada hace upscaling IA real ni inventa piezas de producto.

## 4. Test mínimo recomendado en Windows (15 minutos de validación manual)

1. Abrir `INICIAR_WINDOWS.bat` y comprobar estado «motor local conectado».
2. En Higgsfield, copiar BF-I01 `SIN_LETRAS` y F01, marcar estado y guardar JSON.
3. En Biblioteca cargar una foto de Higgsfield y una carpeta de diferentes ángulos del mismo SKU; confirmar miniaturas, SKU y persistencia al refrescar.
4. Pulsar «Enviar foto seleccionada» en Editor Imagen: debe aparecer importada en Creative V10.
5. En Cámara, hacer zoom lento; exportar GIF, abrirlo y comprobar tres instantes diferentes.
6. En Carruseles C7, seleccionar fondo sólido blanco o gris, añadir cuatro fotos, exportar MP4 y confirmar que **no hay degradado violeta** ni fondos de interfaz.
7. Cambiar el fondo a una fotografía real; exportar un segundo MP4 y comprobar mismo fondo que la vista previa.
8. En Video, importar un clip y música, cortar, ordenar y exportar MP4.
9. Abrir proyecto JSON guardado, revisar CTA y los logotipos originales en PNG, y escanear QR de arte final.

## 5. Dictamen de salida

**V1 entregable como base integrada y utilizable bajo validación local.** El dashboard, GIF y servidor MP4 cuentan con pruebas automatizadas; los motores heredados mantienen su funcionalidad previa, pero el puente y proyectos reales de usuario requieren el ciclo de aceptación Windows detallado arriba.
