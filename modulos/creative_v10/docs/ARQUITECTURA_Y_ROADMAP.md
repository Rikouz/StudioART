# Arquitectura y evolución

## V10 entregada
- Editor Canvas2D offline, sin Tailwind ni Google Fonts/CDN externos.
- Biblioteca de productos y de identidad, efectos Canvas originales, arrastre y exportación de imágenes.
- Línea de tiempo de video no destructiva, clips/imágenes y audio, overlays temporizados.
- Importación y exportación JSON/ZIP, estructura de carpetas reproducible.
- Exportador MP4 FFmpeg local opcional.

## Próximas fases recomendadas (NO incluidas en esta versión)
1. Motor de reproducción determinista: separar preview del render usando WebCodecs, audio sincronizado por timestamps y muxer local, sin grabación en tiempo real.
2. Línea de tiempo multicanal con keyframes por propiedad, curvas Bézier y máscaras para efectos de producto.
3. Rotulación SVG y tipografía variable con motor de layouts declarativo, fuentes bajo licencia aportadas por usuario.
4. Superresolución real mediante modelos de imagen/video opcionales, no simple escalado bicúbico.
5. QA visual de SKU contra máscara maestra y detección de cambios geométricos; auditoría de QR y contraste WCAG.
6. Versionado de proyectos y colaboración local (IndexedDB/OPFS o carpeta de proyecto) con historial persistente.
7. Optimización del render: WebGL/WebGPU para desenfoque, grano y composiciones multicapa de 4K.

## Restricciones actuales
- `MediaRecorder` puede emitir WebM o MP4 según navegador, y el render requiere reproducir toda la duración.
- El motor FFmpeg separado implementa recortes, mezcla y superposiciones, pero no todos los efectos Canvas2D.
- Las referencias de locales son fotos reales; insertar una máquina dentro de una foto requiere generación de escena previa o composición manual fuera de este editor.
- No se integra una IA generativa; se prepara material para Higgsfield y se maquetan sus resultados.
