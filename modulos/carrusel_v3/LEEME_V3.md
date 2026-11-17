# MSCCS Carrusel Inmersivo V3

## Elementos recuperados del HTML original

- Cursor de patita kawaii ORIGINAL en reposo y otro al presionar, con destellos al clic.
- 5 estilos: Glass, Relieve 3D, Nitidez Studio, Distorsión y Neón Motion.
- Parallax 3D a medida que mueves el mouse.
- Hover sobre la tarjeta, zoom, desplazamiento lateral y táctil, flechas, puntos, reproducción y pausa automática al pasar el cursor.
- Contenido en tarjetas UI, solo fotos e híbrido, este último solo en el editor.
- Atajo H para vista limpia.

## Mejoras V2 preservadas

- Formatos cuadrados, verticales, horizontales y automáticos por cada imagen sin deformar.
- Ajustes contain/cover y duraciones editables, orden, eliminación y carga de imágenes.
- Exportación MP4 H.264 directa mediante Canvas + WebCodecs. No solicita capturar pantalla. Estilos renderizados en video; el movimiento libre del mouse no se graba porque el video tiene una cámara predefinida. Requiere Chrome/Edge con WebCodecs H.264 disponible. Sin audio.
- Generación ZIP de sitio público desde el editor. Se conservan los estilos elegidos, el zoom y el cursor interactivo; la vista pública oculta editor y textos añadidos (no los impresos en la imagen).

## Cómo abrir

1. Abrir `MSCCS_EDITOR_AUTONOMO_V3.html` para comprobarlo directamente. Ya contiene las 18 imágenes.
2. Para publicar, subir `publicacion/index.html` y la carpeta `publicacion/assets/` al mismo directorio.
3. Alternativamente subir `MSCCS_PUBLICACION_AUTONOMA_V3.html`, un solo archivo.

## Importante

Los archivos que abres directamente desde `file://` pueden tener restricciones del navegador. Para usar HTML + carpeta externa en edición es preferible un servidor local o publicarlo en hosting.
