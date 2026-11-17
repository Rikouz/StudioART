# Efectos de video para Supremo Líder

Base inspeccionada: **1.2.7**, commit `921725d`. Referencia: reel adjunto de 26 segundos, 720 × 720, de Justyn Berkovits (@justyn.ai). El panel muestra 21 nombres, incluido Dolly Zoom. El catálogo local de Creative V10 ya tenía esos identificadores y aproximaciones. La comparación con su código distingue un dibujo decorativo de un efecto que emplea datos, pistas, máscaras o fuentes reales.

## Matriz de implementación

Los tiempos indican puntos aproximados de aparición en el adjunto. El primer lote se selecciona en **Cámara y GIF → Efecto**, admite intensidad y guarda texto donde corresponde. La versión actual reproduce cada efecto durante la duración total de Cámara. Las variantes que necesitan información de capas o tiempo propio de la línea de tiempo se incorporarán sobre Video y Estudio.

| Tiempo aprox. | Efecto | Creative V10 en la base | Implementación y aceptación |
| --- | --- | --- | --- |
| 0–1 s | Live Cursor | Flecha e indicador flotante. | **Cámara.** Cursor traza el marco desde una esquina y marca el punto final. En Video, añadir agarre y movimiento de una caja de edición. Prueba: mantiene proporciones y encuadre del recurso protegido. |
| 1–2 s | Clone Row | Ecos de la imagen plana. | **Capas.** Copias de un recorte con escala uniforme, desfase temporal y oclusión detrás del sujeto principal. Probar sobre una persona y mantener el SKU principal único por defecto. |
| 2–3 s | Day Dial | Aro y marcas sin manecilla. | **Cámara.** Dial con manecilla animada y texto editable. **Capas.** Añadir barrido en el fondo de escena usando máscara. El tiempo se introduce manualmente. |
| 3–4 s | Predict Keys | Teclas con letras fijas. | **Gráficos.** Teclado editable y sugerencias escritas por el usuario, marcadas al paso del cursor de tiempo. Probar acentos y saltos de línea. |
| 4–5 s | Orbit Ring | Elipse con un punto móvil. | **Capas.** Distribuir un texto sobre la órbita y dividir la pasada delantera y trasera con la máscara de sujeto. Probar texto corto en los tres formatos. |
| 6 s | Code Body | Texto repetido sobre el fotograma. | **Capas.** Cuadrícula de caracteres muestreada de luminancia dentro del alfa. Calcular en proxy y comprobar que la textura permanece estable. |
| 7 s | Post Wall | Mosaico de una imagen repetida. | **Datos.** Cuadrícula de miniaturas o fechas reales de Biblioteca. Contar registros visibles y verificar búsqueda, límite de memoria y fechas. |
| 8 s | Letter Dive | Letras fijas que descienden. | **Transiciones.** Máscara de glifo y zoom de entrada hacia otro plano. Probar tamaño de letra y punto de paso en relación con el corte. |
| 9–12 s | Comment Drop | Texto comercial fijo en una tarjeta. | **Cámara.** Tarjeta con texto editable y entrada en movimiento. **Video.** Añadir escritura progresiva e instantes de entrada y salida, identificando las recreaciones. |
| 13 s | Layer Explode | Rectángulos superpuestos. | **Capas.** Separar fondo, producto, textos y audio de la composición vinculada. Comparar los píxeles iniciales y finales con la misma revisión del original. |
| 14 s | Sketch Words | Texto fijo con trazo discontinuo. | **Cámara.** Revelado progresivo de contornos con titular editable. La versión de Video se ampliará a recorridos vectoriales por letra. |
| 15 s | Blade Slice | Línea diagonal en movimiento. | **Transiciones.** Dos máscaras temporales con corte, desplazamiento y recomposición. Verificar fotograma de unión y uso explícito para material que pueda cortarse. |
| 16 s | Head Stack | Franjas repetidas de imagen. | **Gráficos.** Etiquetas editables con caída escalonada y anclaje manual, con seguimiento basado en una pista existente cuando corresponda. |
| 17 s | Rack Focus | Desenfoque de toda la imagen. | **Capas.** Cambiar enfoque entre máscaras de planos independientes. Verificar que el plano enfocado conserva detalle en el sello y que el filtro se aplica por capa. |
| 18 s | Banknote | Tarjeta translúcida con elipse. | **Gráficos.** Grabado editorial con medallón y datos introducidos por el usuario. Probar sin replicar denominaciones o sellos oficiales. |
| 19 s | Voice Note | Barras sintéticas. | **Audio.** Extraer picos del archivo local con Web Audio y renderizar una tarjeta con marcador sincronizado. Probar silencio, recorte, desfase y forma de onda estable. |
| 20 s | Impact Frame | Zoom y marco. | **Gráficos.** Pulso breve, líneas de velocidad y tipografía editable. Ofrecer tinta de alto contraste para persona o fondo tras una selección explícita. Verificar intensidad nula y frame exacto. |
| 21–22 s | Dolly Zoom | Zoom uniforme sobre una imagen plana. | **Capas.** Compensar la escala entre recorte y fondo con ancla, conservar las proporciones y verificar que el tamaño aparente del producto es constante. |
| 23 s | Press Front | Frase fija que aumenta de tamaño. | **Cámara.** Cabecera editorial animada y composición como imagen principal. **Video.** Extender a portada multicapa conectada con Paper Tear. |
| 24 s | Paper Tear | Franja ondulada superpuesta. | **Transiciones.** Bordes dentados complementarios con semilla y dos revisiones. Probar conservación de contenido en cada extremo y alfa en la unión. |
| 25 s | Blow Away | Motas decorativas. | **Transiciones.** Partículas que muestrean una capa elegida con semilla fija sobre un fondo limpio. Medir render y validar reconstrucción del sujeto o rótulo. |

## Secuencia de trabajo

1. **EVO-06 · Cámara.** Usar el mismo render para scrub, PNG, GIF y video. Los cinco efectos del primer lote guardan ajustes en el proyecto y dibujan los gráficos fuera de la composición. Probar revisión durante exportación, entrada sin efecto e intensidad cero.
2. **EVO-06 · Línea de tiempo.** Portar los cinco efectos a clips de Video con inicio, duración, intensidad y texto por clip. Mantener las composiciones vinculadas al mismo ID y la compatibilidad de Creative V10. Desarrollar Predict Keys, Head Stack, Banknote, Impact Frame y Post Wall sobre esa base.
3. **EVO-03/EVO-06 · Capas y máscaras.** Reutilizar los recortes de Estudio y sus capas reales. Implementar Clone Row, Orbit Ring, Code Body, Layer Explode, Rack Focus y Dolly Zoom. Para una foto plana, ofrecer selección manual o indicar los recursos que pide el efecto.
4. **EVO-04/EVO-06 · Transiciones y audio.** Completar Letter Dive, Blade Slice, Paper Tear, Blow Away y Voice Note. Hacer las variaciones reproducibles por semilla y precalcular la onda de audio fuera del bucle de render.
5. **Cierre integrado.** Probar 9:16, 4:5 y 16:9 en Chrome/Edge sin servidor. Comparar vista previa con archivos decodificados, medir duración, memoria y tiempo de exportación, y comprobar SKU, silueta, logo y QR al guardar, reabrir y actualizar la composición. Incluir verificación de recursos de proyectos antiguos.

## Fuentes revisadas

- [Referencia visual y desglose de AI Lounge](https://ai.lounge.ai/free/copy). Confirma las acciones que aparecen en el reel y explica que su reconstrucción separa Dolly Zoom del grupo de veinte. El video adjunto es la referencia para el orden y la duración.
- [MonsterDylan/claude-video-effects](https://github.com/MonsterDylan/claude-video-effects), [motor fx.js](https://github.com/MonsterDylan/claude-video-effects/blob/main/fx.js) y [licencia MIT](https://github.com/MonsterDylan/claude-video-effects/blob/main/LICENSE). Implementación pública de terceros en HyperFrames con patrones de recortes sincronizados, capas, órbita tipográfica y picos de audio. El código exacto del reel no se pudo localizar en un repositorio público. El primer lote usa código propio de Canvas y conserva el lanzador local.
- [Contrato de timeline de HyperFrames](https://github.com/heygen-com/hyperframes/blob/main/packages/core/docs/core.md) y [recetas de efectos](https://github.com/heygen-com/hyperframes/blob/main/skills/hyperframes-animation/rules/gsap-effects.md). Referencias para buscar por tiempo y calcular gráficos de audio antes del render. Una futura integración requiere fijar código, licencia y perfil de ejecución offline.
- [Canvas recortes](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/clip), [Canvas composición de imágenes](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage) y [Web Audio](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Basic_concepts_behind_Web_Audio_API). API nativa para máscaras y dibujo en el primer lote, y referencia para audio posterior.

## Avance 1.3.1

Los cinco efectos de Cámara están conectados al renderer de Video con inicio, duración, intensidad y texto por clip. Se implementaron también Predict Keys, Head Stack, Banknote e Impact Frame en ese renderer compartido. Los otros doce efectos continúan pendientes de las implementaciones especificadas en la tabla. Las variantes antiguas de Creative V10 se conservan por compatibilidad.

## Avance 1.3.2

Los doce efectos pendientes tienen ahora implementaciones propias sobre planos, recortes, imágenes o audio. El contrato de planos, las máscaras, las claves y la auditoría están descritos en `AUDITORIA_1_3_2.md`. Las transiciones solo anticipan imágenes; el Dolly es 2D; los efectos de código/partículas usan proxies. Las aproximaciones heredadas se conservan por compatibilidad. La aceptación integral en Chrome/Edge continúa pendiente.
