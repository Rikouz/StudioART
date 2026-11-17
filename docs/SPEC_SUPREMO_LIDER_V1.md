# SUPREMO LÍDER V1 — SPEC MAESTRO

**Proyecto:** MSCCS / MaxSupport Marketing · Ciudad Juárez  
**Edición:** 1.0 · 10 de noviembre de 2026  
**Modalidad:** estación de trabajo local, offline respecto a servicios externos  
**Fuentes internas:** `unificar.zip`, tres editores suministrados, `campana_2026.json`, assets oficiales adjuntos.  
**Alcance de este documento:** contrato funcional + arquitectura implementada + límites y plan de crecimiento.

## 1. Principios del sistema

Supremo Líder V1 centraliza el flujo creativo de MSCCS sin destruir los proyectos ya existentes. Unifica **operación de prompts**, **biblioteca comercial**, **composición de imagen**, **cámara/GIF**, **editor de video** y **carruseles C4–C8** mediante un dashboard. Preserva los motores V10 y V3 dentro de `modulos/`.

Jerarquía inalterable:
1. Fotografía oficial del SKU y de sus piezas físicas (cajones, ruedas, puerta, cubierta, controles, logotipos originales).
2. Fotografía real del lugar, cuando exista y haya sido aportada.
3. Avatar masculino o femenino oficial, cuando corresponda.
4. Firma MSCCS, distintivo Buen Fin y QR del archivo original, como **capas de postproducción**, no IA generativa.
5. Tipografía, efectos y otros elementos de diseño subordinados al producto.

No inventar ofertas, precios, ventajas técnicas ni productos que el inventario no respalda. La promesa de entrega menor de 24 horas requiere confirmación operativa por zona/stock antes de publicarse. Los recortes YARDMAX permanecen en **QA geométrica pendiente** respecto al fabricante.

## 2. Hallazgos de `unificar.zip`

| Módulo de origen | Funciones recuperadas | Debilidad detectada | Decisión V1 |
|---|---|---|---|
| `MSCCS_CREATIVE_STUDIO_V10` | 17 conceptos, 170 frames, 27 efectos, importación, imagen, video, overlays, exportación PNG y MP4 auxiliar | Estado separado; no migración común; sin biblioteca persistente compartida | Conservar y conectar por mensajes locales |
| `MSCCS_EDITORIAL_STUDIO_V10` | Maquetación exacta, formatos vertical y horizontal, tipografía, capas, Hero/Void, JSON | Proyecto autónomo sin puente común de medios | Conservar como módulo editorial vinculado desde dashboard; integración profunda diferida |
| `MSCCS_CARRUSEL_V3_COMPLETO` | Cursor de patita, 5 estilos, parallax, controles, HTML publicación y encoder H.264 WebCodecs | Fondo de exportación fijado como degradado violeta; no presets narrativos C4–C8 | Conservar V3 y corregir fondo; construir carrusel C4–C8 sobre render determinista |
| `sistema de carrusel/versiones viejas` | Historia de versiones | Código duplicado | Mantener como fuente histórica en el ZIP aportado; no cargar versiones obsoletas en ejecución |

## 3. Módulos entregados en la V1

### 3.1 Dashboard
- Navegación entre 11 secciones; conteos de conceptos, frames, medios y artes aprobados.
- Seguimiento por pieza: pendiente, prompt copiado, generado, QA, aprobado, publicado.
- Búsqueda por marca, SKU, escena y titular.
- Persistencia de estados y notas mediante almacenamiento local del navegador.
- Pantalla de QA con control de fidelidad del SKU, identidad, QR y escena.

### 3.2 Prompts / Higgsfield
- Catálogo migrado **sin inventar productos** desde `data/campana_2026.json`.
- 17 conceptos con `FOTO_LIMPIA` y `CON_LETRAS` (prueba IA); 170 prompts F01–F10.
- Copiar prompt y Element names; contador de caracteres con advertencia >3000.
- Checklist máximo 4 referencias: producto, avatar, local, frame anterior/maestro (según momento).
- Notas, estado por frame y vinculación al archivo generado importado.
- **Fuera de alcance V1:** generar desde Higgsfield automáticamente o subir medios sin autorización; el usuario continúa pegando prompts en su interfaz.

### 3.3 Biblioteca de medios
- Importación local `file input` múltiple y carpeta (Chrome/Edge `webkitdirectory`).
- IndexedDB para conservar blobs de imágenes, audio y clips en **este navegador/perfil y origen**.
- Referencias oficiales precargadas por SKU; carpeta `modulos/creative_v10/assets/productos/`.
- Clasificación de archivo como producto, ángulo, generación Higgsfield, escena, avatar, arte aprobado u otro.
- Reconocimiento de SKU por nombre de archivo cuando es posible; asignación manual disponible al importar.
- Envío de medios/ángulos al motor Creative V10 por `postMessage` de mismo origen.
- **Límite V1:** el sistema no es DAM de empresa ni NAS; IndexedDB está sujeto a cuota y se pierde si borras datos del sitio. El JSON no incrusta binarios.

### 3.4 Imagen / Editorial
- Creative V10 se conserva: Canvas, arrastre, capas, texto, CTA, logo PNG oficial, QR, neon/marcos y PNG alta resolución.
- Editorial V10 se conserva como módulo independiente enmarcado: Hero/VOID, tipografía editorial, formatos y capas.
- El dashboard envía fotos aprobadas a Creative V10; el editor editorial se abre manualmente y conserva su sistema propio de JSON.
- Nada en esta V1 corrige por IA un gabinete generado incorrectamente. El objetivo es **evitar alterarlo**.

### 3.5 Cámara / GIF
- Transformaciones de cámara **2D no generativas**: Push, Pull, Pan L/R, microorbit, custom.
- Ajustes inicial/final de escala, desplazamiento, rotación, FPS y duración.
- Lienzo previo y scrub por tiempo.
- Exportar PNG de frame, GIF auténtico mediante Pillow local y MP4 mediante FFmpeg.
- El GIF se codifica con paleta adaptativa; para evitar saturar máquinas modestas se limita a 110 frames.
- No se presenta la interpolación como movimiento 3D real de un producto físico.

### 3.6 Video
- Conserva el editor de Creative V10 con timeline de video, fotografías como clips, audio externo, overlaid logo/QR, velocidad, trimming, dividir, ordenar, duplicar, recortar y volumen.
- Se preserva su exportación mediante MediaRecorder y su herramienta FFmpeg `tools/render_mp4.py` dentro del módulo original.
- El enlace desde Biblioteca manda archivos de video/audio y activa el modo de video.
- La migración integral de timelines al JSON maestro sigue pendiente: cada motor V10 mantiene su propio proyecto ZIP/JSON para montaje avanzado.

### 3.7 Carruseles C4–C8
Cinco presets **originales y diferenciados** según descripciones históricas; no reconstruyen la animación exacta de videos finales sin sus masters.
- **C4 Film Strip**: fila editorial con movimiento horizontal.
- **C5 Paper Stack**: tarjetas superpuestas con giros y profundidad.
- **C6 Perspective Stage**: héroe central con paneles secundarios.
- **C7 Gallery Wall**: galería mural de marcos y desplazamiento lateral.
- **C8 Orbit Gallery**: tarjetas distribuidas sobre una órbita 2D.

Cada carrusel permite: ordenar tarjetas, editar duraciones, cambiar proporción 9:16 / 16:9 / 4:5 / 1:1, elegir fondo sólido / imagen / foto desenfocada / transparente en PNG, regular opacidad, añadir audio para MP4 y exportar HTML público autocontenido. El mismo motor Canvas `drawAt` produce preview y frames de exportación.

**Fondo: decisión clave.** El lienzo exportado usa el fondo configurado; **nunca** captura el fondo decorativo del dashboard. Para modo transparente la exportación PNG conserva alfa; MP4 aplana por códec a fondo sólido configurable (el botón advierte al usuario). El Carrusel V3 antiguo fue parcheado para reemplazar el fondo violeta del render MP4 por fondo configurable, sin suprimir cursor/parallax.

## 4. Esquema de datos unificado

`data/campana_2026.json` conserva `concepts[]` y metadatos de referencias. El proyecto JSON exportado contiene:

```json
{
  "type": "supremo-lider-project",
  "schemaVersion": "1.0",
  "savedAt": "ISO-8601",
  "state": {
    "status": {"BF-I01": "qa"},
    "frames": {"BF-I01:0": true},
    "frameAssets": {"BF-I01:0": "media_id"},
    "notes": {"BF-I01": "Revisar tapa y ruedas"},
    "qa": {},
    "camera": {},
    "carousel": {"slides": []}
  },
  "mediaManifest": [],
  "campaign": {"concepts": []}
}
```

**Regla de migración:** el ID de un medio vinculado por `media_id` se conserva si el medio todavía existe en el mismo navegador. Para trasladar equipo/carpeta, exportar los medios originales y reimportarlos; el enlace se debe reasignar manualmente cuando cambien los identificadores.

## 5. Arquitectura técnica

```
Servidor local Python (127.0.0.1:8766)
  ├── index.html / css / js (dashboard)
  │    ├── Campaña JSON -> prompts / QA / estados
  │    ├── IndexedDB -> fotografías / audio / modelos con ángulos
  │    ├── Cámara Canvas2D -> frames -> GIF / MP4 local
  │    ├── Carruseles Canvas2D -> frames -> MP4 local
  │    └── postMessage same-origin -> Creative V10
  ├── modulos/creative_v10 (motor original imagen + video)
  ├── modulos/editorial_v10 (motor editorial original)
  ├── modulos/carrusel_v3 (motor clásico corregido)
  ├── data/campana_2026.json
  ├── modulos/creative_v10/assets/{productos,miniaturas,identidad,personajes,escenarios}
  └── /api/render (POST) -> Pillow GIF o FFmpeg H.264 + AAC
```

Servidor HTTP solo enlazado a `127.0.0.1`. No incorpora CDN ni envía imágenes a plataformas externas. `localhost` facilita importar carpetas/recursos mediante APIs de archivo; las APIs de acceso a carpetas pueden variar según navegador y requieren gesto explícito del usuario.

### Requisitos
- Chrome/Edge moderno; Python 3.10+.
- PNG e HTML: solo navegador (con servidor local recomendado).
- GIF: Pillow (`python -m pip install Pillow`).
- MP4: FFmpeg disponible en PATH. Para la exportación del carrusel o cámara se usa el backend local, no grabación de pantalla.
- Audio opcional de MP4: mp3, wav, m4a, ogg, aac, flac; mezclado mediante FFmpeg; puede no cubrir todas las combinaciones sin transcodificación adicional.

### API
- `GET /api/health` → capabilities (`pillow`, `ffmpeg`).
- `POST /api/render` → `{mode:'gif'|'mp4', frames:[base64], fps, width, height, audio?:{name,data}}`; devuelve binario GIF o MP4. Límites: 160 MB body, 110 frames GIF, 360 frames MP4, 1920 px por lado.

## 6. Seguridad, derechos y calidad
- No usar archivos de fuentes con copyright salvo que el usuario tenga licencia; el editor admite importación local.
- Los logos originales se colocan como PNG sin redibujarlos; QR conservar lectura y zona de silencio.
- No publicar un YARDMAX sin cotejo visual de manillar, motor, guardas, base, ruedas y calcomanías respecto al fabricante.
- No se publican precios ni descuentos específicos sin autorización. El Buen Fin oficial 2026 es 13–17 noviembre; la campaña editorial interna 11–15 noviembre.
- En medios generados, el lugar real sirve como referencia visual, no como evidencia de que una escena específica ocurrió.

## 7. Criterios de aceptación V1

| Prueba | Aceptación |
|---|---|
| Catálogo | 17 conceptos distintos; 9 SHOPMAX + 8 YARDMAX; 170 frames; SKUs vigentes |
| Prompts | Copiar texto sin truncamiento; contador; estados guardados en JSON |
| Biblioteca | Subir imágenes y carpetas, clasificar y abrir después en el mismo perfil |
| Editor imagen | Transferir foto a Creative V10 y editar sin reconstruir SKU |
| Cámara/GIF | Preview con zoom/pan, export GIF válido, PNG nítido |
| Carrusel | 5 estilos seleccionables; cambios de fondo visibles en PNG y MP4 |
| Video | Abrir V10 con clip enviado, cortes/audio disponibles en motor original |
| Entrega | JSON de proyecto, backup del arte, ZIP estructurado, documentación |

## 8. Lo que **no** significa «unificado» en V1

- No hay un timeline universal que edite indistintamente los proyectos internos de Creative V10, Editorial V10 y el carrusel V3.
- No existe IA de remasterización 4K; FFmpeg aplica escalado y tratamiento técnico cuando se configura, no recuperación real de detalles.
- La exportación WebCodecs de V3 depende del soporte del navegador; el MP4 local de los carruseles nuevos depende de FFmpeg.
- El editor editorial conserva su propio formato de proyecto; integración profunda con el dashboard queda para V2.
- El código y recursos de C4–C8 del proyecto anterior no estaban incluidos como fuentes maestras en `unificar.zip`; se han creado nuevas variantes originales basadas en sus descripciones.

## 9. Siguientes versiones

Consultar `ROADMAP_IMPLEMENTACION.md`: motor de composición 3D real, timeline multicanal con keyframes y mezcla avanzada, exportación determinista con alpha, renderización GPU y superresolución opcional, QA automática SKU/QR, DAM portable en carpeta y publicación programada bajo aprobación.
