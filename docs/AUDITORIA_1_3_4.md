# StudioART 1.3.4 · Diseño único, arquitectura y Contour

17 de noviembre de 2026. Entrega acumulada sobre el ZIP verificable 1.3.3. Los cambios de diseño único anunciados en la conversación no estaban en la copia recuperada; esta entrega contiene su implementación y sus pruebas. No incluye fotografías, logos, QR ni videos del usuario.

## Comportamiento implementado

**Generar otro diseño** incrementa la semilla y produce una composición. Desaparece la tira de cuatro propuestas en proyectos nuevos. Un proyecto anterior con cuatro propuestas se abre sin descartar ninguna; generar un diseño nuevo toma la propuesta activa con sus capas. Guardado, looks, transferencia a Biblioteca/Video/Carrusel y reapertura aceptan entre una y cuatro composiciones para esa compatibilidad.

El motor `msccs-seed-6` combina las 30 familias existentes con diez programas estructurales: fotografía a sangre, ventana, división vertical, banda horizontal, tríptico, mosaico, círculo, corte diagonal, hoja de contacto y marco lateral. Con arquitectura Automática, semillas consecutivas recorren estructuras diferentes, cambiando las ventanas de fotografía y la jerarquía del título, no solo su posición. Se puede fijar una estructura. Los candados mantienen las coordenadas de título, producto, logo y capas. La calibración de apoyo del producto conserva prioridad.

Los seis tratamientos son fotografía, contornos continuos, grabado fluido, memoria de píxeles, mapa de dos tintas y cintas de luminancia. Se seleccionan por un canal de semilla independiente o de forma explícita. Los controles de niveles, espaciado, grosor e intensidad modifican la imagen actual y se guardan. Color y campo pueden variar sin reemplazar la arquitectura. Repetir semilla conserva también los canales que se hayan variado individualmente.

**Capas:** se conservan texto/fondo, opacidad, máscaras, rotación, dimensiones, duplicación e historial. Se añaden seis acciones de alineación para la caja completa. El panel de acciones usa una cuadrícula para evitar comprimir todos los botones en una fila.

## Algoritmos y límites

`contour_design.js` es código original de StudioART. No es una extracción del código completo de Geometric o de un producto propietario denominado Contour Studio. El análisis usa luminancia, gradientes Sobel X/Y e isolíneas por marching squares con unión de segmentos en rutas continuas. El grabado integra un campo tangente al gradiente, con dirección de luminancia en regiones planas. La memoria de píxeles y las cintas usan fase reproducible. Las ventanas recortan la fotografía sin deformar su relación de aspecto.

Los tratamientos se calculan con un proxy limitado y cachés por imagen. No son segmentación semántica ni recuperación 3D. Un sujeto que ya está aplanado dentro de una foto puede quedar recortado por una ventana; el usuario puede escoger fotografía a sangre o aportar su recorte independiente. Producto, logo, QR y capas se recomponen sobre el fondo. No se redibujan sus píxeles mediante IA.

## Motion y exportación

Play prepara una única escena, dibuja el primer fotograma, muestra el reloj y reproduce en bucle. El mismo botón pausa; Detener regresa al modo de edición. Una excepción durante RAF libera los controles y muestra el error. Si tanto el efecto como la cámara están apagados —o su intensidad es cero— se informa que la configuración es estática.

Cuatro efectos nuevos —contornos continuos, grabado fluido, memoria de píxeles y cintas— usan el compositor común de planos en Estudio y en Video. El menú de clips los incorpora automáticamente. Los planos transferidos incluyen la receta de contornos y sus colores. La vista previa, GIF y video del Estudio usan el mismo render de esos efectos, con sus parámetros capturados. Video mantiene inicio, duración e intensidad por clip. Se conservan los efectos anteriores.

## Evidencia y comprobaciones

- Veinte generaciones sobre una misma imagen sintética: diez estructuras, seis tratamientos y PNG distintos.
- Repetición exacta de los veinte PNG. Entre diseños consecutivos cambió más del 12% de los píxeles en una miniatura, usando un umbral de diferencia RGB total mayor que 30. Este dato prueba cambio de imagen, no una calificación estética.
- Rutas continuas en una rampa de luminancia; gradientes y campo tangente no vacíos.
- Cambios de controles visibles en Canvas; independencia de color/composición; looks y JSON editables.
- Capas nuevas y sus cajas cambian entre generaciones; candados, máscaras, rotación y alineación se conservan.
- Cuatro efectos nuevos con variación temporal determinista; compositor de Video probado en tres formatos junto a sus efectos anteriores.
- Callback real de Play ejecutado con DOM y RAF simulados: reloj, pausa, aviso de imagen fija y recuperación de excepción.
- GIF real generado por el render y decodificado externamente; fotogramas inicial e intermedio distintos.
- Regresiones acumuladas de Biblioteca, Cámara, Video, Carrusel, primitivas, planos, fuentes y paquete portátil.

La ejecución de lógica usa Node; Canvas usa `@napi-rs/canvas`. No equivale a una auditoría visual del navegador.

## Cierre automatizado de esta entrega

`NODE_PATH=… python3 scripts/qa_all.py`: **17 comprobaciones aprobadas**. El manifiesto verifica 84 archivos, la sintaxis de 29 JavaScript y 68 referencias locales sin errores. Se mantiene un aviso de un visor editorial opcional antiguo que no se distribuye. Los dos HTML portátiles contienen cinco módulos y 74 bloques de script compilados, sin dependencias externas de scripts o estilos.

La comparación adicional contra el HTML real recuperado de 1.3.3 confirmó cuatro PNG seed-5 idénticos al abrir y repetir en 1.3.4. Las pruebas históricas dependientes de commits ausentes no se contabilizaron como aprobadas en esta copia.

## Pendiente verificable

Chromium se volvió a cerrar al arrancar: `process_singleton_posix.cc`, fallo de `socket()` con `Operation not permitted`. No se completó el recorrido real en Chrome/Edge ni la decodificación del video/audio exportado por ese navegador. `AUDITORIA_AUTOMATICA.html` incluye ahora el flujo de un diseño y una prueba de Play con reloj real para registrar esa comprobación en un navegador operativo.

Continúan en desarrollo la segmentación automática de sujetos de fotos planas, el campo temporal calculado desde video fuente y la comprobación de las referencias externas cuyo contenido no se pudo revisar. Esta candidata no declara paridad completa con Geometric ni cierre de todo el plan.
