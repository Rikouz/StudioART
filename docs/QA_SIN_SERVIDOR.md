# QA técnico — Supremo Líder V1.2 sin servidor

## Verificado en navegador de prueba (HTML y scripts inyectados en memoria; el entorno no permite navegar a file://)
- Se inicializan sin solicitudes HTTP 17 conceptos / 170 prompts de fotogramas.
- Navegación al módulo de prompts y copia del contenido.
- Referencias embebidas del SKU 965209S7 visibles para el motor de cámara.
- GIF de diez fotogramas exportado y **validado con Pillow**: estructura GIF89a correcta y todos los fotogramas se leen completos.
- Vídeo de cámara exportado por `MediaRecorder`, archivo `.mp4` válido, **H.264, 720 × 1280** y duración ~0.63 s verificada con `ffprobe`.
- Carrusel C4 exportado a PNG sin errores JS.
- Carrusel C4 exportado a MP4/H.264, **960 × 540**, ~13.0 s, validado con `ffprobe`.
- Lint de JS `node --check` sin errores.

## No verificado
- Apertura real de `file:///` con doble clic en Chrome de tu empresa: el navegador automatizado de este entorno impide abrir tanto `file://` como `localhost`.
- Compatibilidad con políticas empresariales de almacenamiento, archivos, códecs y exportación en tu instalación Windows.
- Cada función avanzada de los editores heredados V10/Carrusel V3 en el modo file://.

## Seguridad
No se eluden restricciones de TI; todos los archivos importados son seleccionados explícitamente por el usuario; no se pone en marcha un servidor ni se ejecutan scripts de terminal.
