# Auditoría de desarrollo · StudioART 1.3.1

Fecha: 17 de noviembre de 2026. Base: StudioART 1.3.0, commit 463834d. Candidata de desarrollo acumulada; no certifica el cierre completo del plan.

## Cambios implementados

| Solicitud | Comportamiento verificable | Prueba |
| --- | --- | --- |
| Componer automáticamente por semilla | 30 familias; cuatro propuestas; canales de composición, color y campo; motor msccs-seed-4 para nuevas series | studio_composition.cjs; design_maps.cjs |
| Conservar proyectos anteriores | Motores seed-1, seed-2 y seed-3; seed-3 reproduce el PNG de la base 463834d | studio_composition.cjs; legacy_seed3.cjs |
| Ampliar capas | Duplicar, ocultar, rotar, escalar formas por dos ejes; historial de 40 estados de capas por propuesta durante la sesión | studio_composition.cjs |
| Tipografía y cuadros | Saira ExtraBold e IBM Plex Sans; peso disponible, interlineado, fondo propio o vinculado, opacidad, tamaño y posición | studio_composition.cjs |
| Mapas y espaciado | Actividad con suma integral, márgenes estimados y bandas de espacio libre; referencia orienta margen y relleno en seed-4; compara también cuatro escalas tipográficas para reducir solapamientos | design_maps.cjs; studio_composition.cjs |
| Aproximación por primitivas | Refinado de 24–256 formas desde la interfaz; proxy de 96–192 px; rotación y alfa optimizados; Worker local o cálculo incremental con cesión al navegador; progreso y cancelación | primitive_engine.cjs |
| Reapertura del refinado | Modelo incluido en el JSON de la propuesta; invalida el modelo al cambiar fondo, semilla, tipo, cantidad, resolución, rotación o alfa; PNG y SVG usan el modelo guardado | studio_composition.cjs |
| Efectos en Cámara y Video | Nueve efectos comparten renderer. Cinco anteriores más Teclas predictivas, Etiquetas escalonadas, Grabado editorial y Marco de impacto | camera_effects.cjs; video_motion.cjs |
| Efectos por clip | Texto, intensidad, inicio relativo al clip y duración; JSON y ZIP del proyecto conservan esos campos | video_motion.cjs |
| Inicio de exportación | Espera imágenes de clips y capas temporizadas; espera el primer fotograma del video fuente; dibuja antes de iniciar MediaRecorder | video_export.cjs |
| Revisión estable durante exportación | Interfaz de Video inerte mientras graba; actualizaciones del puente se encolan hasta finalizar; teclado del editor bloqueado durante la grabación | video_export.cjs para cola; inspección de exportVideo para bloqueo |
| Audio | Ganancias proporcionales con suma teórica máxima 0.95; conserva volúmenes guardados. Falta medir archivo codificado real | video_export.cjs |
| Continuidad | Biblioteca de 5,249 imágenes simuladas; Cámara y Carrusel esperan revisión; se conserva recurso editable y composición | library_persistence.cjs; camera_revision.cjs; carousel_revision.cjs |
| Entrega de código | Sin fotografías, logos propios, videos, audio ni imágenes base64 embebidas | qa_source_release.py |

Las pruebas de Canvas ejecutan el código real de dibujo con @napi-rs/canvas. Las de Video extraen las funciones reales de render, inspector y preparación. La prueba de Worker verifica el protocolo generado en otro contexto JavaScript; no sustituye una prueba de Worker real en Chrome. Los archivos visuales de prueba se generan desde formas sintéticas durante la ejecución y no se distribuyen como recursos propios.

## Cómo usar los avances

1. Abre ABRIR_SIN_SERVIDOR.html y entra al Estudio. Carga los archivos locales.
2. Elige una familia o Automática, escribe una semilla y pulsa Generar. Las series nuevas usan seed-4; los proyectos guardados conservan su motor.
3. En Pro, Capas adicionales ofrece Duplicar, Deshacer capa, Rehacer capa, Visible, Rotación y opciones tipográficas. El historial afecta a las capas adicionales; no es un historial global del proyecto ni se guarda al cerrar.
4. Mapa → Espaciado y bandas libres muestra la estimación de márgenes de la referencia o del fondo. Es análisis visual, sin OCR ni reconocimiento semántico.
5. En Primitivas, pulsa Refinar fondo sin bloquear el editor. Puedes cancelar. Guarda el proyecto para conservar el modelo. Un cambio de entrada requiere refinar otra vez; la vista rápida conserva su motor anterior como alternativa.
6. En Video, selecciona un clip y un efecto con el sufijo integrado. Ajusta texto, intensidad, inicio y duración. Los efectos antiguos mantienen sus implementaciones de compatibilidad.

## Pendientes del plan completo

| Área | Trabajo todavía pendiente |
| --- | --- |
| Doce efectos restantes | Clone Row, Orbit Ring, Code Body, Post Wall, Letter Dive, Layer Explode, Blade Slice, Rack Focus, Voice Note, Dolly Zoom, Paper Tear y Blow Away requieren las versiones con recortes reales, datos o audio. Las aproximaciones heredadas no equivalen a esas implementaciones. |
| Video multicapa | Enviar las capas y máscaras editables al compositor temporal; keyframes por capa; compensación real entre producto y fondo; transiciones entre revisiones. |
| Geometric ampliado | Contornos continuos, máscaras pintables para fuentes planas, capas de señal y coherencia temporal; el mapa de delta existente no resuelve esos requisitos. |
| Geometrize completo | Motor original C++ no integrado ni compilado a WASM; la implementación propia trabaja sobre proxy. Faltan primitivas adicionales, presupuesto de optimización por tiempo y coherencia temporal. |
| Estudio | Agrupación y máscaras de recorte por capa, guías magnéticas y transformación de perspectiva; historial global con restauración de todos los módulos. |
| Referencias | Revisar contenido completo de los videos, la lámina de Instagram y el flujo privado de Wireflow. Tener título/enlace no equivale a haber implementado su contenido. |
| Aceptación real | Abrir por file:// en Chrome/Edge, flujo completo con archivos locales, IndexedDB, permisos, portapapeles, decodificación de video/audio, duración, memoria, QR y fidelidad del producto. |

## Bloqueo de navegador observado

Playwright no encuentra su Chromium empaquetado. El Chromium del sistema está instalado pero termina antes de abrir la página: process_singleton_posix, socket() failed: Operation not permitted. No se pidió acceso a Windows ni se ejecutó allí. Las pruebas de lógica y Canvas no certifican el comportamiento completo del navegador.

## Siguiente tramo de implementación

El siguiente tramo debe añadir un contrato de planos reales de Estudio hacia Video antes de desarrollar los seis efectos de capas; después, las cinco transiciones y Voice Note con datos del audio. Reservar el cierre y la revisión humana para la entrega integrada completa, como solicitó el usuario.
