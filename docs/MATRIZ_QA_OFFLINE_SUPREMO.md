# Matriz de aceptación offline de Supremo Líder

La prueba se ejecuta sobre una copia de desarrollo con su estructura completa. Anota versión, commit, navegador y versión, sistema operativo y fecha. Usa un perfil de navegador de pruebas que conserve el almacenamiento local entre aperturas. Desconecta la red y abre `ABRIR_SIN_SERVIDOR.html` mediante `file://`. Conserva los archivos descargados y la evidencia de cada caso.

## Material de prueba

- Foto original y recorte transparente del SHOPMAX 965209S7, fondo autorizado de Ferretería Neptuno y logo y QR de prueba. Usa archivos de trabajo separados de los maestros. Registra sus nombres y SHA-256.
- Un proyecto maestro JSON de una versión anterior con sus medios, y un respaldo de Video con medios. Si falta una muestra histórica, marca la prueba de compatibilidad como pendiente.
- Dos revisiones de una misma propuesta. En R1 usa el texto «Prueba R1» y en R2 cambia el texto a «Prueba R2». Conserva el formato y los medios. Usa una segunda pieza para comprobar el orden de clips y tarjetas.

## Recorrido y criterios

| Caso | Pasos | Evidencia y aceptación |
| --- | --- | --- |
| OFF-01 · Lanzador | Abre el lanzador. Entra a Biblioteca, Estudio, Cámara, Video y Carrusel con la red desconectada. | Cada módulo se abre con sus estilos, fuentes y controles. Guarda URL local y errores de consola. Si una política impide navegar a `file://`, marca el caso como bloqueado. |
| OFF-02 · Biblioteca | Importa una carpeta con subcarpetas y recursos suficientes para superar una página. Busca el SKU, selecciona el recorte, cambia de página y vuelve. Recarga el navegador. | Verifica un máximo de 48 miniaturas por página y el retorno a carpeta, filtros, página y selección. Si se bloquea el selector de carpeta, prueba la importación por archivo y registra el resultado de ambos caminos. |
| OFF-03 · Estudio | Integra fondo y recorte. Marca los apoyos y desplaza la sombra proyectada. Guarda R1. Exporta PNG con las mismas entradas y ajustes de la vista previa. | Compara ruedas, tiradores, 9 cajones, escala, borde, sombra de contacto, logo y QR. Comprueba que el PNG corresponde a la vista previa y que los apoyos conservan su posición. Guarda PNG y captura del editor. |
| OFF-04 · Revisión vinculada | Abre R1 en Cámara y agrégala a Video y Carrusel desde Estudio. Abre la edición desde una salida y guarda R2 sobre la misma propuesta. | Conserva el ID del recurso, de la tarjeta y del clip. La revisión R2 aparece en las tres salidas. Repite la comprobación desde cada enlace de edición y registra IDs y conteos antes y después. |
| OFF-05 · Cámara | Tras guardar R2, exporta enseguida PNG, GIF y video. En una segunda exportación animada guarda otra revisión mientras se procesa. | PNG y primer fotograma contienen la revisión elegida. Inspecciona inicio, mitad y fin. Toda la exportación usa la imagen y los ajustes iniciales. El siguiente archivo refleja la revisión más reciente. Registra contenedor, dimensiones y duración. |
| OFF-04b · Logo y tipografía | En 9:16, importa un logo con márgenes alfa. Aumenta el ancho de 12 a 30%, arrástralo, cambia ancho y altura mínima del título y prueba los tres fondos en una capa añadida. Repite en una segunda propuesta y reabre el JSON. | El logo crece sin deformarse y conserva su ancla al escalar. Solo se mueve la capa seleccionada. Cuadros y opacidad coinciden entre vista previa y PNG. La reapertura conserva los valores y acepta proyectos anteriores. |
| OFF-04c · Contornos | En Estudio Pro alterna Mapa de bordes. En Retícula y geometría aplica malla de contornos. Varía sensibilidad, confianza y semilla con un fondo fijo y un producto separado. | La vista de diagnóstico queda fuera del PNG. La malla sigue los contornos, los nodos se orientan según la tangente y se respeta el resguardo central. La misma fuente y configuración generan el mismo PNG. |
| OFF-05b · Efectos de Cámara | Aplica los cinco efectos en 9:16, 4:5 y 16:9. Cambia intensidad y texto, guarda y reabre el JSON. Exporta en el punto medio y repite el caso OFF-05. | Los gráficos quedan fuera de la composición. La revisión y los parámetros se mantienen durante el render. Intensidad cero y Sin efecto recuperan el encuadre previo. |
| OFF-06 · Video | Pon R2 al inicio de la línea de tiempo e incorpora una pista de audio además del audio del clip. Exporta, cierra y reabre Video. Prueba 9:16, 16:9 y 4:5 en los formatos disponibles. | Primer fotograma visible y correcto. Orden, IDs y revisión se conservan al reabrir. Escucha sincronía y mide pico de la mezcla exportada con una señal de prueba. La referencia de QA para el caso simultáneo es 0.95 de escala completa. Registra duración, tamaño, contenedor, pico y diferencia de sincronía en cada formato. |
| OFF-07 · Carrusel | Agrega R2 y una segunda pieza. Cambia R2 en Estudio y exporta enseguida PNG, video y HTML interactivo. Abre el HTML mediante `file://`. | Las tarjetas aparecen completas y en orden. Comprueba la revisión en PNG y en el primer, medio y último fotograma. El HTML conserva estilo, navegación, arrastre y patita si está activa. |
| OFF-08 · Guardar y reabrir | Exporta el proyecto maestro y, por separado, el respaldo propio de Video. Cierra todas las pestañas, reabre el lanzador e importa el maestro. Prueba también el respaldo de Video en otro perfil de prueba, con sus medios. | El proyecto recupera la propuesta editable, sus capas y referencias locales. El respaldo de Video recupera la línea de tiempo con sus medios. Registra vínculos ausentes y mensajes de recuperación. |
| OFF-09 · Semillas | Guarda las semillas de composición, color y campo y los bloqueos comerciales. Reabre el proyecto y reproduce en 4:5 y 9:16. Cambia un canal cada vez. | Obtén cuatro propuestas distintas por formato. Con las mismas entradas, semillas y formato se recuperan los ajustes. Al variar el campo, conserva posiciones y paleta. Titular y producto respetan sus bloqueos. |
| OFF-10 · Prompts | Guarda un prompt de más de 3,000 caracteres con saltos de línea, SKU, escena y referencias. Cópialo a un editor local. Repite con el portapapeles denegado y reabre el JSON. | Compara el texto íntegro. Los metadatos sobreviven y un fallo de copia conserva el estado previo. Higgsfield queda fuera de esta prueba de portapapeles. |
| OFF-11 · Compatibilidad | Importa el JSON histórico y abre los módulos de compatibilidad que exige ese proyecto. Exporta una copia nueva y verifica que el original conserva su SHA-256. | El contenido histórico se abre con sus ajustes. Registra valores restaurados, valores que requieren migración y herramientas que resultan necesarias para ese archivo. |
| OFF-12 · Revisión visual y accesibilidad | Repite el recorrido principal con teclado. Compara la foto original, la vista previa y los archivos exportados a tamaño efectivo. | Foco visible, controles etiquetados y errores legibles. Revisa halo, recorte, deformación, sombra, logo, QR y sincronía. Adjunta la comparación y señala el fotograma o región de cada hallazgo. |

## Comprobaciones de la copia disponible

El 17 de noviembre de 2026 se comprobó el commit `5902189` de desarrollo, versión 1.2.7. El informe del commit `edfdab0` documenta la versión 1.2.14. Ese código queda pendiente de recuperación y los resultados de esta tabla corresponden a 1.2.7.

| Comprobación | Resultado |
| --- | --- |
| `python3 scripts/qa_static.py --root .` | Pasaron 125 rutas del manifiesto, JSON de campaña y efectos, y sintaxis de 12 JavaScript. |
| `python3 qa/qa_module_links.py --root .` | 49 referencias, cero errores. Un aviso por el visor histórico Thanksgiving V9 en el lanzador editorial. |
| `node qa/camera_revision.cjs` | Pasó el ensayo simulado de revisión y ajustes fijos en PNG, GIF y WebM. |
| `node qa/carousel_revision.cjs` | Pasó el ensayo simulado de carga de la revisión antes de exportar PNG y video. |
| OFF-01 en Chromium del escritorio | Bloqueado al abrir el lanzador mediante `file://`. Chromium mostró «This page is blocked». |
| OFF-02 a OFF-12 | Pendientes en navegador real. |

Para cada ejecución conserva el ID del caso, el resultado (aprobado, fallo, bloqueado o pendiente), evidencia y pasos de reproducción del hallazgo. Repite la matriz sobre la versión integrada que llegue al cierre y adjunta los resultados a la entrega para revisión humana.
