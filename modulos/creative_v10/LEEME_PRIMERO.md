# MSCCS Creative Studio V10 — Buen Fin 2026

Editor de diseño y montaje audiovisual **offline**, creado sobre el trabajo del usuario (`msccs_v9_advanced_composer.html`) y sobre el paquete maestro V8 de referencias comerciales. **No se generó publicidad ni se modificó ninguna fotografía oficial para fabricar nuevos modelos.**

## Inicio en Windows (XAMPP)
1. Descomprime este ZIP conservando carpetas.
2. Haz doble clic en `INICIAR_OFFLINE_WINDOWS.bat`.
3. Se abrirá `http://127.0.0.1:8765/ABRIR_EDITOR.html` (Python o PHP de XAMPP, solo en tu computadora, sin conexión de red externa).
4. Si la ventana no abre el navegador, copia la dirección manualmente. Cierra la consola al terminar.

También puedes abrir `ABRIR_EDITOR.html` directamente, aunque algunos navegadores bloquean exportaciones desde `file://` por políticas de seguridad.

## Modo diseño
- Catálogo REAL: **17 conceptos**, 9 SKU SHOPMAX + 8 YARDMAX, sin productos ficticios.
- Tipografías: opciones del sistema + importar tus propios archivos OTF/TTF/WOFF. No se distribuyen archivos de fuentes.
- **Importar imágenes:** arrastrar al lienzo; o en pestaña Medios, botón `Fondo`.
- **Identidad:** pestaña `Identidad`, carga logo MSCCS, emblema Buen Fin y QR originales por separado.
- **Capas:** arrastrar logo, titular, SKU, CTA, QR y capas nuevas; opacidad, escala, rotación, colores, marco, sombra/neón, vidrio y difuminado opcional. Marco general configurable.
- **5 formatos:** 4:5, 9:16, 16:9, 1:1 y 3:4. Exportación PNG: resolución base o ×2 (2160×2700, 2160×3840, 3840×2160, etc.).
- **Importante:** exportar al doble de resolución no recupera detalle perdido en una fotografía pequeña; no es superresolución de IA.
- **QR:** es el PNG auténtico, no se redibuja; conserva fondo blanco y sin suavizado en la aplicación.

## Modo video
- Importa archivos locales de video, audio e imágenes desde `Medios`.
- En cada archivo: `+ Clip`, `+ Audio`, `+ Capa` o `Fondo` según corresponda.
- Línea de tiempo con clips en orden: entrada y salida, dividir, duplicar/copiar, pegar, mover, eliminar, velocidad, volumen y silenciar.
- Overlays temporizados: texto o logo/QR, con comienzo y fin editables y arrastre en el lienzo.
- Audio externo: inicio, fin, volumen y silenciar. El audio original del video también se puede silenciar.
- Biblioteca de **27 efectos visuales originales + Sin efecto**. Son aproximaciones 2D implementadas en Canvas, no reproducción idéntica ni código propietario del video adjunto.
- Exportación desde navegador: **WebM con audio cuando el navegador lo soporta**, o MP4 si `MediaRecorder.isTypeSupported` confirma compatibilidad. Se renderiza en tiempo real; por ser navegador, la velocidad y sincronización pueden variar. Revisa el resultado.

### MP4 profesional en local
El exportador opcional `tools/render_mp4.py` usa FFmpeg instalado en Windows y Pillow. Acepta un ZIP portátil del proyecto, conserva recortes y orden de clips, mezcla audio externo y original, aplica overlays temporizados y puede activar un ajuste moderado de reducción de ruido, enfoque y nivel de audio. **No reproduce en FFmpeg los 27 efectos de Canvas**, y no hace upscaling de IA.

Instala Python y FFmpeg, agrega FFmpeg al PATH, e instala Pillow con `python -m pip install Pillow` (se requiere internet una única vez si no está instalado). Después:

```powershell
python tools\render_mp4.py "C:\Ruta\MSCCS_PROYECTO_BF-I01.zip" -o "C:\Ruta\ANUNCIO_FINAL.mp4" --remaster
```

Si tu navegador exporta WebM, también puedes convertirlo con FFmpeg mediante:

```powershell
ffmpeg -i "VIDEO.webm" -c:v libx264 -crf 19 -c:a aac -b:a 192k "VIDEO.mp4"
```

## Proyectos JSON / ZIP
- `JSON`: guarda edición no destructiva, posiciones, timeline, referencias y nombres de medios. Los archivos binarios no están incrustados; al reabrir, carga primero los medios o vuelve a enlazar por su mismo nombre.
- `ZIP portátil`: incluye JSON de proyecto y medios que hayas **importado** desde tu equipo. Incluye definiciones de campaña y efectos; los recursos originales incluidos con este editor se reutilizan desde `assets/`.
- `data/campana_2026.json`: 17 piezas + sus prompts con/sin letras + 170 prompts para frames F01–F10.
- `data/efectos.json`: catálogo editable de efectos.
- `data/schema_proyecto.json`: esquema de importación.
- Para migrar otra campaña, importa su JSON con el formato `concepts[]` o edita una copia de `data/campana_2026.json`, y actualiza `data/campana_2026.js` con la misma estructura prefijada por `window.MSCCS_CAMPAIGN=`.

## Precauciones comerciales y de fidelidad
- **SHOPMAX:** modelo y fotografía oficial tienen prioridad sobre estética, avatar o local comercial. El editor manipula el arte, no genera componentes nuevos.
- **YARDMAX:** 15 recortes RGBA horneados y referencias registradas como candidatos de QA. `completed` en Higgsfield no equivale a aprobación geométrica. Revisar manillares, ruedas, logos, motor y controles antes de publicar.
- **Buen Fin 2026:** evento oficial del 13 al 17 de noviembre; tu calendario editorial del 11 al 15 son publicaciones programadas, no toda la duración del evento.
- El uso del distintivo oficial requiere cumplir las reglas del programa y el registro del comercio. No modificar el emblema. Verifica que tu archivo sea el autorizado para tu registro.
- **Entrega en 24 h:** comunicar únicamente si la operación y cobertura permiten cumplirlo; la promesa de venta debe ser verificable.
- Logo original de MSCCS también se conserva como `assets/identidad/logo_msccs.png` y se incluye versión transparente técnica para fondos diversos.

## Estado de pruebas
- Validación estática JS y Python, estructura de catálogo y archivos, lectura del QR y renders FFmpeg MP4 probados.
- El navegador de pruebas del entorno bloqueó la navegación automatizada a archivos locales/localhost, por lo que la interfaz completa y el exportador MediaRecorder **no pudieron validarse de extremo a extremo**; incluyo instrucciones de uso y limitaciones con transparencia.

## Documentación externa consultada
- MDN WebCodecs y MediaRecorder (`developer.mozilla.org`)
- FFmpeg/FFmpeg.wasm y documentación oficial de El Buen Fin 2026.
