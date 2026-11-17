# Plan de implementación — Evolución de Líder Supremo

## Fase 0 — Preparar fuentes y control (bloqueante)

- Extraer `SUPREMO_LIDER_OFFLINE_COMPLETO.zip` como fuente y comparar contenido con la carpeta de instalación.
- Crear repositorio Git y commit base; separar `stable/main` de la carpeta de trabajo y conservar una copia intacta.
- Copiar este plan y scripts, configurar Codex CLI, Windows PowerShell 7 y comandos de validación.
- Registrar todas las licencias, avisos y versiones de motores/assets.
- Resultado: un ciclo manual no destructivo y reproducible.

## Fase 1 — Automatizador horario (entregado en este paquete)

- Exclusión por lock, comprobación de rama limpia, worktree y rama candidata.
- Configurar Programador de tareas de Windows cada 60 min con acción de instalación/desinstalación.
- Limitar ciclo a una ficha de backlog y 35 min.
- Generar log de ejecución, resumen y diffstat.
- Acumular mejoras en la rama de desarrollo existente, con un commit por avance que pase sus comprobaciones. Si un avance falla, resolver el fallo en esa rama antes de avanzar.
- Conservar la rama estable como referencia. Reservar la revisión humana de la entrega integrada para el cierre del plan.

## Fase 2 — Motor de calidad y backlog

- Aumentar QA estático: integridad SHA-256, JSON/schema, rutas locales, referencias de módulos y versiones.
- Crear matriz de aceptación para imagen, vídeo, prompts, biblioteca, carruseles y exportaciones.
- Capturar casos patrón aprobados y medir por regresión perceptual sólo con originales/licencia verificada.
- Incluir revisión con el navegador real para canvas, IndexedDB, File System Access, permisos y exportación.
- Incorporar Quality Gate visual con diff lado a lado, alertas de recorte, halo, deformación, logotipo/QR y sincronía.

## Fase 3 — UI y editor de imagen

- Mapear flujo principal desde importar → separar producto/escena → ajustar integración → revisar → exportar.
- Reducir pasos frecuentes, mantener un lienzo fijo y paneles plegables; priorizar uso con teclado y legibilidad.
- Aplicar reglas de diseño de Impeccable/UI UX Pro Max/Taste después de fijar requisitos y tokens MSCCS.
- Profundizar semilla reproducible por producto, escena, luz, encuadre y decoración; guardar semilla/config junto al proyecto.
- Añadir historial no destructivo, comparación antes/después, protección explícita de SKU y controles de máscara/alpha.
- Cerrar pruebas para guardas, ruedas, tiradores, logotipos, dimensiones y sombra de contacto con fotografías oficiales.

### Estudio de imagen · composición y contornos

- **En 1.2.9.** El logo escala desde su borde visible y se guarda por propuesta. El cuadro de título responde a ancho, altura mínima, margen interior y opacidad. Los fondos de texto añadido admiten transparente, estilo del título o color propio.
- **En 1.2.9.** El diagnóstico de bordes muestrea localmente el fondo. Sobel X/Y y máximos locales generan los candidatos de la malla Delaunay. La confianza de conexión cruza la evidencia de borde con su dirección. La trayectoria de video registra el delta de luminancia entre dos muestras.
- **Siguientes fases.** Campos por máscara en fuentes planas, contornos continuos por niveles, jerarquía de tamaños y capas de señal, y arte animado con coherencia temporal. Usar el material de prueba de la mezcladora YM-0115 y comparar detalle de ruedas, etiquetas, QR y sombras con el original. La documentación de Geometric es referencia de comportamiento y controles. El motor de Supremo se implementa localmente.

## Fase 4 — Video y motion

- Unificar preview y export en una fuente determinista de frames.
- Timeline multipista con keyframes X/Y/escala/rotación/opacidad, easing, máscara, audio con waveform y sincronía.
- Cola de render con progreso real, cancelación, reanudación y límites de memoria; proxy de preview y 4K sólo para render final.
- Evaluar HyperFrames/GSAP para gráficos HTML/CSS y FFmpeg para empaquetado; retener el motor actual como fallback offline.
- Aceptación: ratios 9:16/16:9/4:5, producto completo, audio sin saturación, export reproducible y duración validada.

### Efectos de la referencia de video

[La matriz de efectos](PLAN_EFECTOS_VIDEO.md) conserva el desglose de las 21 acciones observadas. En 1.2.9 se reincorporaron los cinco efectos de Cámara. Sigue pendiente la integración por clip y el desarrollo de los otros efectos de la matriz.

## Fase 5 — Prompts/Higgsfield en Chrome

- Cola local de prompts conectada al catálogo SKU/escenas; estado: borrador → copiado → abierto → generado (confirmación manual) → importado → QA.
- Botón “Copiar prompt” preserva saltos de línea y texto íntegro, y luego el usuario abre la pestaña elegida.
- Futuro complemento de Chrome: permiso sólo para `higgsfield.ai`, botón expreso por pieza, leer/escribir únicamente el campo de prompt si el sitio lo permite, sin leer cookies ni credenciales.
- Siempre detenerse antes del botón “Generate”. Confirmar destino/modelo/refs; permitir cerrar y cancelar.
- Mantener método manual si la página cambia o el complemento no detecta con certeza el campo.

## Fase 6 — Fuentes externas con gobernanza

- Registro `sources.lock.json`: nombre, URL original, release/tag o commit, licencia, fecha revisada, ficheros incorporados, dependencias y checksum.
- Revisión humana antes de instalar/actualizar una skill de terceros.
- Comparar principios y no mezclar estilos incompatibles: marca MSCCS decide; bibliotecas aportan controles y criterios.
- Ejecutar revisión de vulnerabilidades/licencias y actualizar bloqueos en lotes mensuales, no cada hora.

## Orden de prioridad

1. Integridad y preservación de activos/proyectos.
2. UX de biblioteca y estabilidad del editor.
3. Interoperabilidad no destructiva imagen/video.
4. Fiabilidad de exportación y audio.
5. Semilla avanzada / variedad de composición.
6. Copiar/pegar Higgsfield con revisión humana.
7. Nuevas fuentes/efectos opcionales.

## Definición de hecho

Un avance de desarrollo queda listo para el siguiente ciclo cuando la ficha está identificada, el cambio es pequeño, los checks relevantes pasan, hay evidencia reproducible y la versión concuerda con el manifiesto.

Al completar las fases, presentar la versión integrada con la verificación de apertura, guardado, reapertura y exportación offline y el registro de cualquier prueba pendiente. La revisión humana de esa versión precede a cualquier fusión o parche de instalación.

### Estado del desarrollo

- EVO-01 implementada y verificada estáticamente. El verificador informa el módulo y la ruta afectados.
- Carrusel 1.2.6 y Cámara 1.2.7 pasan sus pruebas de revisión de imágenes durante la exportación.
- FASE-02 cuenta con la [matriz de aceptación offline](MATRIZ_QA_OFFLINE_SUPREMO.md) del commit `921725d`.
- EVO-05 reconstruida sobre `921725d`. Conserva carpeta, filtros, página y selección de Biblioteca y abre la misma revisión editable de Estudio. La prueba automatizada usa 5,249 recursos simulados. El avance original está documentado en el informe del commit `10dc07038627bc5b71ef1b9fd6c48f7c2b8f8655`.
- Siguiente avance: reconstruir EVO-04 para conservar la línea de tiempo de Video y sus revisiones vinculadas al reabrirla. Después siguen la integración visual, la semilla, la exportación y el audio, la cola local de prompts y el registro de fuentes.
- Pendiente para el cierre: prueba integral abriendo `ABRIR_SIN_SERVIDOR.html` en Chrome o Edge, y comparación visual con fotos maestras.

El script de Windows instalado en la base estable conserva su comportamiento anterior. La automatización de desarrollo trabaja sobre esta rama y registra un avance verificable por ciclo.

## Corte 1.3.0

Implementado el motor de 18 familias, generación por semilla, paleta local, mapas y aproximación por primitivas, formato libre y formas. El [apéndice interno](APENDICE_DISENO_1_3.md) identifica parámetros, fuentes verificadas, limitaciones y pendientes. Continúan pendientes la inspección integral en navegador, las referencias inaccesibles y los efectos de video restantes de la matriz.

## Estado acumulado StudioART 1.3.1

Consultar `AUDITORIA_1_3_1.md` para criterios cumplidos y pendientes. La versión es candidata de desarrollo y no cierra las fases de Video multicapa, máscaras, transiciones, audio con onda real ni aceptación integral en navegador. La revisión humana permanece al cierre del plan.

## Estado acumulado 1.3.2

Compositor de planos, doce efectos, máscara poligonal y claves implementados. Entrada portátil y arnés local de auditoría añadidos. Alcance y restricciones: `AUDITORIA_1_3_2.md`. No cerrar la aceptación integral en navegador hasta disponer de resultados reales.


## Avance 1.3.4 · 17 de noviembre de 2026

Implementado: flujo de diseño único, seed-6, diez arquitecturas estructurales, seis tratamientos de fondo, contornos conectados, campo tangente, cuatro efectos compartidos por Estudio/Video, Play con reloj y recuperación, alineación de capas, persistencia y compatibilidad de proyectos. Los detalles y la evidencia están en `AUDITORIA_1_3_4.md`.

Pendiente para el cierre: auditoría real Chrome/Edge con PNG/GIF/video/audio y reapertura; segmentación de fotografía plana; análisis temporal del campo desde video fuente; revisión del material externo que continúa inaccesible. La revisión humana permanece al final del plan. No hay una pausa de desarrollo por aprobación entre estas mejoras.
