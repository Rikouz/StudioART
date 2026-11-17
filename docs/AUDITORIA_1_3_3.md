# StudioART 1.3.3 · Variación completa y motion dentro del Estudio

Candidata acumulada sobre 1.3.2, 17 de noviembre de 2026. Código sin fotografías ni medios propios.

## Fallos encontrados y corrección

El generador seed-4 tenía una ruta de composición distinta del motor histórico: copiaba las posiciones de las capas existentes sin variarlas y no variaba las coordenadas del logo. La búsqueda de espacio libre podía converger al mismo lugar para los cuatro títulos. El botón Generar repetía la semilla; no distinguía una nueva serie de su reproducción. El Estudio reproducía un PNG aplanado con movimientos de cámara, aunque Video ya tenía efectos por planos.

El motor seed-5 introduce búsqueda con penalización por ocupar los espacios elegidos por propuestas anteriores. Distribuye el logo por el perímetro, penaliza cruces con el producto, mueve todas las capas adicionales desbloqueadas desde la propuesta activa y mide el texto junto con su caja y márgenes. Mantiene tamaños, contenido, máscara, fondo y transparencia de cada capa. El producto puede variar su posición si está desbloqueado; una calibración de apoyo sobre un punto del escenario sigue teniendo prioridad para evitar que flote.

El título, el producto y el logo tienen sus controles de posición bloqueada; las capas adicionales conservan sus propios candados. No se cambia el color del logo ni los píxeles del producto. Los motores guardados seed-1 a seed-4 siguen reconocidos. Una generación nueva usa seed-5; repetir un proyecto anterior conserva su motor hasta generar una serie nueva.

**Generar cuatro propuestas** avanza la semilla. **Repetir semilla** reproduce la serie seleccionada. **Variar todo el lienzo** avanza composición, color y campo, incluso si estaba desmarcada la variación de decoración. La selección deliberada de una familia o un preset comercial limita esa dimensión de la variación.

## Imagen y motion en la misma vista

El selector de efecto y los botones Motion/Detener quedan junto al lienzo. **Motion por semilla** selecciona un efecto reproducible para cada propuesta. **Motion al variar** reproduce automáticamente al generar o variar la serie; respeta la preferencia de movimiento reducido del navegador. Una interacción o un cambio de controles detiene la reproducción para permitir la edición.

Estudio ahora captura planos reales para su vista previa, GIF y video. Dispone de siete efectos multicapa (separación, Dolly, foco, clones, órbita, caracteres y dispersión) y los nueve efectos gráficos de Cámara. También incorpora **Malla de contornos animada**: reutiliza Sobel, máximos locales y Delaunay para crear conexiones con soporte de borde, anima su pulso y partículas sobre el fondo y recompone después los planos de producto, título, logo y capas. La malla usa la imagen real y la semilla; no desplaza aleatoriamente el producto. Los cambios temporales afectan píxeles renderizados, no una animación CSS de la ventana. El efecto, intensidad, texto y modo de cámara quedan capturados antes de reproducir o exportar. Hay un límite de memoria para secuencias con muchas capas.

Los efectos de transición hacia otro clip, el muro de Biblioteca y la onda de voz continúan en Video, donde tienen sus recursos necesarios. No se presentan como efectos autónomos de una sola imagen. La sección Movimiento y secuencia sigue dando duración, FPS, audio, GIF y video. Los parámetros y la preferencia de reproducción automática se guardan en el JSON.

## Verificación

- Regresión desde el código real de Estudio: una capa recién añadida participa en las cuatro propuestas con su fondo; sus posiciones y las del logo varían; un candado conserva sus coordenadas.
- Cuatro PNG diferentes, generación de otra serie, repetición exacta, JSON y reapertura.
- Diecisiete efectos alcanzan el render del Estudio; el fotograma medio de separación difiere del inicial.
- GIF generado con ese mismo drawMotion, decodificado con Pillow: diez fotogramas y diferencias entre el primero y el medio.
- Configuración del efecto capturada: modificar los controles después de preparar los planos no cambia el fotograma ya preparado.
- Reproducción automática comprobada con reloj/RAF simulado.
- Comparación de seed-4 con el generador de 1.3.2: receta y PNG idénticos; se conserva además la comparación seed-3 histórica.
- El arnés AUDITORIA_AUTOMATICA.html ahora comprueba el movimiento del logo, una capa nueva y diferencias de motion dentro del navegador.

El conjunto automatizado incluye las regresiones anteriores de Biblioteca, máscaras, Cámara, Video y Carrusel. Las pruebas de DOM/RAF son simuladas y Canvas usa @napi-rs/canvas.

## Límites de la evidencia

No se completó la prueba integral en Chrome/Edge. El paquete Playwright no contiene su navegador gestionado; el ejecutable Chromium del sistema se cierra durante el arranque. No se ejecutó en Windows ni se atribuye aprobación visual humana al paquete. La codificación real de video y audio sigue pendiente de la auditoría del navegador.

No equivale todavía a la totalidad de Geometric: falta el análisis temporal de contornos sobre video fuente, segmentación de sujetos desde fotografías planas y animación guiada por esos mapas. Esta entrega corrige la variación y conecta motion al Estudio sobre los planos existentes; mantiene los pendientes de desarrollo anteriores.

## Abrir

Abre STUDIOART_PORTATIL.html. Importa tus medios locales y abre Estudio. Para una serie diferente, pulsa Generar cuatro propuestas o Variar todo el lienzo. Usa Repetir semilla para recuperar el mismo resultado. Elige Motion por semilla o un efecto específico junto al lienzo. Para exportar, abre Movimiento y secuencia y elige GIF o video. Para proyectos anteriores, elige un efecto y activa Motion al variar si deseas ese comportamiento.
