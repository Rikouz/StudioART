# StudioART 1.3.2 · Interfaz portátil, planos, máscaras y efectos

Base acumulada: StudioART 1.3.1. Fecha: 17 de noviembre de 2026. Candidata de desarrollo.

## Interfaz reportada

La captura adjunta muestra HTML sin los estilos externos. La barra de dirección apunta a una carpeta temporal de Windows; es compatible con abrir un HTML desde el ZIP sin extraer sus carpetas, aunque la captura no demuestra por sí sola la causa exacta. Las cuatro hojas CSS sí estaban presentes y versionadas en la fuente 1.3.1.

La entrega añade **STUDIOART_PORTATIL.html**, un único archivo con estilos, tipografías, scripts y módulos de Estudio/Video embebidos. No depende de que Windows extraiga carpetas CSS o JS. El lanzador tradicional conserva su estructura y suma estilos críticos y un diagnóstico visible cuando faltan recursos. Las referencias de versión del encabezado pasan a 1.3.2.

## Planos y continuidad editable

Estudio exporta fondo, producto, título, logo, QR y cada capa adicional como planos PNG transparentes independientes, en orden. El render conserva la revisión editable en Biblioteca; los planos acompañan al mismo ID al actualizar y al reabrir Video. No se integran imágenes propias en el código distribuido: los PNG de los planos se generan desde los archivos que importa el operador y se guardan en sus proyectos locales.

Los proyectos antiguos sin planos siguen abriendo como antes. Para utilizar un efecto multicapa en una pieza antigua, vuelve a guardarla desde Estudio y enviarla a Video. Los efectos heredados de Creative V10 conservan sus identificadores. Los nuevos se identifican con el sufijo **multicapa**; los nueve anteriores conservan **integrado**.

## Doce efectos implementados

| Efecto | Implementación actual | Recurso necesario |
| --- | --- | --- |
| Clone Row | Dos copias animadas del plano recortado detrás del principal | Producto/sujeto recortado |
| Orbit Ring | Caracteres en una órbita elíptica, pasada posterior y anterior con oclusión alfa | Recorte y texto |
| Code Body | Muestreo de luminancia y alfa para formar una cuadrícula animada de caracteres | Recorte |
| Post Wall | Mosaico animado con imágenes reales de Medios, hasta 48 candidatas, nueve celdas | Imágenes importadas |
| Letter Dive | El siguiente clip aparece mediante una máscara real de glifo y su expansión | Clip siguiente de imagen |
| Layer Explode | Separación temporal de los planos reales; reconstrucción exacta en extremos | Composición multicapa |
| Blade Slice | Revelado diagonal del siguiente clip mediante máscara complementaria | Clip siguiente de imagen |
| Rack Focus | Desenfoque independiente de fondo y sujeto con intercambio de foco | Fondo y recorte |
| Voice Note | Onda de picos extraída del archivo de audio local y marcador temporal | Pista de audio analizada |
| Dolly Zoom | Simulación 2D de dos planos: cambia la escala del fondo y conserva la del recorte | Fondo y recorte |
| Paper Tear | Borde irregular reproducible por semilla entre dos imágenes | Clip siguiente de imagen |
| Blow Away | Partículas de color y alfa muestreadas del recorte; dispersión y reconstrucción | Recorte |

Son implementaciones propias verificadas sobre Canvas, no una copia exacta del reel. Las transiciones actuales reciben como destino una imagen del clip siguiente; no anticipan un fotograma de un video fuente. El muro es un mosaico de imágenes importadas, sin análisis semántico de fechas. El efecto de código y las partículas usan proxies limitados. El Dolly no reconstruye profundidad ni simula una óptica 3D.

Si falta un recurso, la vista indica cuál y conserva la composición. La exportación se detiene con ese diagnóstico, en lugar de producir una aproximación vacía.

## Máscaras y animación

En Estudio → Pro → Capas adicionales, selecciona una capa y pulsa **Pintar máscara de la capa**. Dibuja el contorno en el lienzo auxiliar o pulsa varios puntos; aplica el polígono. La máscara se expresa respecto a la capa y se conserva al moverla, rotarla, guardar y reabrir. **Quitar máscara** restaura la capa. También se admiten máscaras rectangulares/elípticas mediante el contrato del compositor; el editor visible de esta versión pinta polígonos.

En Video, el inspector incluye **Animación multicapa**. Permite elegir plano, tiempo, posición X/Y, escala uniforme, rotación y opacidad, guardar o quitar claves. El motor interpola con suavizado por defecto. **Generar movimiento por semilla** crea claves para fondo/título/capas adicionales y conserva producto, logo y QR. Las claves pertenecen al clip y quedan guardadas en el proyecto.

Las máscaras pintadas se hornean en los planos enviados a Video; el proyecto original de Estudio conserva la edición de la máscara. Video anima los planos resultantes. No incorpora aún pincel suave, segmentación automática, grupos anidados ni reconstrucción del fondo oculto de una foto plana.

## Pruebas ejecutadas

- Motor de doce efectos en 9:16, 4:5 y 16:9 con recortes, imágenes y onda sintéticos.
- Semillas reproducibles, intensidad cero, cambio temporal y endpoints de transición.
- Conservación de tamaño/píxeles del producto en el Dolly de dos planos.
- Máscaras, interpolación, serialización y decodificación de escenas.
- Exportación de planos desde el código real de Estudio y recomposición del PNG, tolerancia máxima de dos niveles por canal por redondeo alfa.
- Máscaras conservadas al reabrir el proyecto de Estudio.
- Puente de Biblioteca: creación, revisión con el mismo ID y restauración de planos hacia Video.
- Rama real de render de Video para los doce efectos, diagnóstico de recursos faltantes y los nueve efectos previos.
- Regresiones de Biblioteca, Cámara, Carrusel, semillas previas, primitivas y preparación de Video.
- Análisis de las páginas portátiles anidadas: sin dependencias externas de scripts, estilos o módulos; compilación de todos sus scripts y JSON; fuentes embebidas.
- Auditoría de distribución sin fotografías, videos, audio ni imágenes base64 propias.

Las pruebas de Canvas usan @napi-rs/canvas. Las pruebas de puente/DOM simulan eventos y almacenamiento. Esto no sustituye el comportamiento integral de un navegador real.

## Auditoría automática en Chrome o Edge

La entrega incluye **AUDITORIA_AUTOMATICA.html**. Abre el archivo y pulsa **Ejecutar auditoría**. El botón ejecuta pruebas con medios sintéticos en una base separada: arranque/estilos, importación de fondo y recorte, generación, JSON, PNG decodificado, 21 efectos, puente Biblioteca → Video, claves/máscaras, GIF y grabación/decodificación de video. **Descargar informe JSON** guarda los resultados y el navegador usado.

Este arnés fue comprobado en sintaxis y empaquetado, pero no pudo ejecutarse en Chrome aquí. No se atribuyen a este documento resultados de una ejecución que no ocurrió. Tampoco verifica toda la aceptación de proyectos reales, fidelidad de SKU/QR, audio codificado, rendimiento de 4K o persistencia después de reiniciar el navegador.

## Bloqueo observado

El navegador disponible por herramientas rechaza el protocolo file:. La vista HTTP local no fue accesible desde ese navegador. Chromium del entorno de ejecución vuelve a terminar antes de abrir la página con `socket() failed: Operation not permitted` en `process_singleton_posix`. No se cambiaron las protecciones del navegador ni se ejecutó en Windows. La aceptación integral sigue pendiente; el arnés permite obtener evidencia en el Chrome/Edge del operador con una sola acción.

## Uso recomendado

1. Abre STUDIOART_PORTATIL.html.
2. Importa fondo y producto recortado en Estudio, genera y guarda la propuesta con **Guardar y usar en Video**.
3. Elige un efecto **multicapa** en el clip. Para transiciones, añade un segundo clip de imagen. Para Voice Note, añade audio, coloca el cabezal sobre esa pista y pulsa **Analizar audio de la pista**.
4. Ajusta inicio/duración/texto/intensidad o genera claves con semilla. Guarda el proyecto con sus medios.
5. Para comprobar el navegador sin tus archivos, abre AUDITORIA_AUTOMATICA.html.

## Fuentes técnicas consultadas

- https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement/srcdoc
- https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
- https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/decodeAudioData

La revisión humana final permanece al cierre del plan. Continúan pendientes las referencias inaccesibles, las mejoras de Geometric/Geometrize registradas y la aceptación visual con los productos reales.
