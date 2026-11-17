# Apéndice de diseño · Supremo Líder 1.3

## Base y continuidad

La base acumulada conserva Biblioteca 1.2.8, las correcciones de composición 1.2.9, cinco efectos de Cámara y el flujo de composiciones vinculadas. La nueva versión es 1.3.0. Cada propuesta guarda ajustes, capas y canales de semilla. Los proyectos y looks anteriores conservan sus motores msccs-seed-1 y msccs-seed-2. Generar una nueva serie usa msccs-seed-3.

## Generación automática

El usuario aporta fondo, producto recortado, logo, QR, titular y CTA. Categoría Automática selecciona cuatro familias diferentes. El botón Generar usa el número de Semilla de la composición. Repetir semilla regenera la misma serie a partir de la misma fuente, formato, texto y controles. Variar todo avanza la semilla. Los canales Composición, Color y Decoración se pueden variar por separado.

El generador conserva las capas manuales y los bloqueos. Genera un acento de composición editable, cambia la jerarquía del titular, el ancho, el relleno y las posiciones. El campo protegido y los recortes guían las zonas reservadas. Se evalúan quince posiciones candidatas con penalización por solapamiento, actividad local de la imagen y distribución de la referencia. El resultado requiere revisión visual con el recurso final, especialmente en fotos planas donde el sistema solo conoce la zona central reservada.

## Familias

| Grupo | Categorías |
| --- | --- |
| Comercial | Catálogo de producto, Industrial, Taller, Exterior |
| Editorial | Editorial, Minimalista, Papel e impresión, Retro industrial |
| Color | Cinematográfica, Monocromo, Duotono, Degradado de color |
| Gráfica | Plano técnico, Gráfica de señales, Alto contraste, Collage tipográfico |
| Primitivas | Geometría abstracta, Mosaico suave |

Cada familia define ancho, escala tipográfica, margen interior, opacidad, paleta de partida, acabado y forma de acento. Los parámetros proceden del catálogo en design_engine.js y los canales de semilla. Las categorías son programas de composición de Supremo. Las referencias verificadas aportan técnicas y criterios específicos.

## Referencia visual

La referencia es opcional y se carga como archivo local. Se analiza con un proxy de tamaño limitado que obtiene luminancia, diferencias espaciales y colores de mayor presencia. El mapa de actividad ayuda a evitar texto en zonas densas. El mapa de luminancia facilita la inspección. El mapa de colocación muestra el cuadro y los resguardos. Los tres son diagnósticos de vista previa.

Los colores se extraen con una cuantización de 3 bits por canal y ponderación por frecuencia. Se mezclan con la familia elegida. Se verifica un contraste calculado de al menos 4.5 para tinta y acento respecto al cuadro generado. La opacidad entra en la selección considerando fondos blancos y negros. Los colores del logo y del producto recortado se conservan.

El programa analiza las propiedades de la imagen. La lectura automática de tipografías, contenidos textuales o jerarquía semántica de una referencia queda pendiente.

## Aproximación por primitivas

Fuentes revisadas

- https://github.com/Tw1ddle/geometrize
- https://github.com/Tw1ddle/geometrize-lib
- https://www.geometrize.co.uk/

La documentación del proyecto describe búsqueda aleatoria y hill-climbing. Supremo usa una implementación propia de JavaScript sobre un proxy local de hasta 98 px por lado. Por iteración compara catorce candidatos y seis mutaciones, calcula el color medio óptimo de cada forma opaca y acepta el candidato que reduce el error RGB cuadrático frente al objetivo. El modelo contiene rectángulos, elipses y triángulos, además del fondo medio. La semilla fija la búsqueda.

La caché conserva hasta diez modelos por imagen y las capas derivadas usan un WeakMap por fuente. La cantidad se limita a 12–96 formas por operación. El resguardo central se aplica al efecto del fondo. La exportación SVG contiene primitivas vectoriales del fondo, con sus colores calculados. El SVG de fondo corresponde al modelo completo de aproximación. El PNG de composición aplica los resguardos y las capas comerciales.

Quedan pendientes una implementación progresiva por worker, primitivas rotadas, mejor ajuste alfa, mayor resolución y coherencia temporal de primitivas en video. El motor de video actual anima la composición preparada. La comparación Sobel/Delaunay y la medición frame delta se mantienen.

## Capas y formato libre

Se puede ampliar o reducir la composición en Formato libre, entre 320 y 4096 px por lado. El lienzo cambia en el mismo formato que el PNG y los módulos de salida reciben la nueva composición.

Las formas rectángulo, elipse y línea admiten color, ancho, alto, posición, opacidad y bloqueo. Las capas de texto conservan sus fondos transparente, vinculado al título o de color propio. En Pro, Mostrar guías habilita el tirador inferior derecho del cuadro de título. Los controles de ancho y altura mínima continúan disponibles.

## Referencias recibidas y estado de acceso

| Referencia | Estado de revisión |
| --- | --- |
| youtube.com/watch?v=aVqwH6_IIvM | Curso completo de Photopea · Ebm Informatica. Título y autor verificados con oEmbed de YouTube. El contenido completo y los subtítulos siguen pendientes. |
| youtube.com/watch?v=RGeIWP-TGkA | 7 trucos para editar mejor tus fotos · De Viaje con la Cámara. Título y autor verificados con oEmbed de YouTube. El contenido completo y los subtítulos siguen pendientes. |
| youtube.com/watch?v=sCZR7gaWikE | Cómo hacer que tus fotos parezcan de película · De Viaje con la Cámara. Título y autor verificados con oEmbed de YouTube. Se encontró una publicación vinculada sobre fotografía cinematográfica y grano. Video completo pendiente. |
| youtube.com/watch?v=QMwno4bGMY4 | Reglas de edición del color · Photography Makers. Título y autor verificados con oEmbed de YouTube. Se encontró una referencia al enlace. Contenido completo pendiente. |
| youtube.com/watch?v=UtEnQCWd0m4&t=140s | Why Your Designs Still Look Amateur · Satori Graphics. Título y autor verificados con oEmbed de YouTube. Referencias secundarias lo vinculan con diseño profesional. Video completo y tramo 140 s pendientes. |
| youtube.com/watch?v=4uqcF7d0hLM | Product manipulation advertising design · Nour Art. Título y autor verificados con oEmbed de YouTube. El contenido completo y los subtítulos siguen pendientes. |
| youtube.com/watch?v=tSDSSJlHFL4 | Nano Banana Product Photos · Thomas Lundström. Título y autor verificados con oEmbed de YouTube. Se encontró una referencia al enlace. Contenido completo pendiente. |
| youtube.com/watch?v=OcOQQlfDVsI | 2026 Graphic Design Trends You Should Know · Kittl. Título y autor verificados con oEmbed de YouTube. Se localizó un índice de tendencias con señalética, planos técnicos, collage y degradados. Verificación del video original pendiente. |
| youtube.com/watch?v=GukAT_S8WH8 | UX Design Storyboarding Technique · Relab Studios. Título y autor verificados con oEmbed de YouTube. Se encontró una referencia bibliográfica a storyboard. Video completo pendiente. |
| instagram.com/p/DUtFuSaik-r/?img_index=16 | Acceso bloqueado para investigación. Lámina pendiente. |
| wireflow.ai/flow/cmvtqwaax004ela08ot5l3zao?welcome=1 | Flujo inaccesible para investigación. Contenido pendiente. |
| Capturas de Geometric adjuntas | Revisadas visualmente para composición, controles y categorías. |
| geometric-art.com/en/manual | Manual accesible para comparar el comportamiento de campos, semilla, mapas y salida. |

## Auditoría

La regresión de Estudio ejecuta los scripts de la página y dibuja con Canvas nativo. Verifica logo, cuadros, capas, lectura de proyectos anteriores, semilla reproducible, independencia del canal Color, formato libre, SVG geométrico, reducción de error y conservación del mapa fuera del PNG. Las pruebas de Biblioteca, Cámara y Carrusel se ejecutan con sus respectivas simulaciones.

La validación visual de la interfaz y del video decodificado en Chrome o Edge permanece pendiente. Chromium se bloqueó por la restricción de sockets del entorno. Las pruebas descritas no cubren el contenido inaccesible de las referencias.

## Evolución 1.3.1

El estado actualizado y sus límites están en [AUDITORIA_1_3_1.md](AUDITORIA_1_3_1.md). Las series nuevas usan seed-4 con 30 familias y espaciado de referencia; seed-3 conserva las 18 familias originales y su colocación. El refinado ampliado funciona por Worker o pasos incrementales, incluye alfa y rotación, y guarda el modelo en la propuesta. Nueve efectos se comparten con los clips de Video. El texto anterior describe la base 1.3.0 y debe leerse como historial, no como estado final del plan.
