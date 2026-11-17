# Fundamento de diseño y marketing — Thanksgiving / MSCCS

## 1. Diagnóstico del arte de ejemplo

La fotografía aportada es una escena cotidiana en un cuarto de servicio: dos personas con uniforme de la marca, un gabinete SHOPMAX visible, herramientas, contenedores y objetos domésticos. La composición cuenta una historia de convivencia y cuidado sin necesidad de inventar un taller automotriz. Su área superior izquierda puede reservarse para una tesis visible en tamaño grande, pero precisa control de contraste sobre la pared clara.

## 2. Dos modos visuales

### HERO FOTOGRÁFICO
- Fotografía real como ancla; no desplazar el gabinete por estética.
- Una tesis debatible como titular; pregunta concreta en el texto conversacional.
- Logo y QR fuera de las caras, manos, controles y cajones.
- Degradado de contraste para lograr legibilidad sin tapar la escena.
- CTA discreto, útil y directamente relacionado con una necesidad.

### VOID / REVEAL
- Fondo casi negro cálido, no azul industrial intenso.
- Producto aislado desde una fotografía oficial con transparencia auténtica.
- Sombras de contacto, peso y escala correctos.
- Texto crema grande con distancia suficiente respecto al producto.
- Acentos naranjas únicamente en créditos y enlaces de estudio; el CTA permanece neutro.

## 3. Política tipográfica

Titular: mayúscula, peso 500 de partida, seguimiento compacto, espacio generoso alrededor. Texto de apoyo: 29px/400; es la única voz conversacional. CTA: mayúscula, distinguible por ubicación y tamaño, no por color naranja. Priorizar Saira Semi Condensed e IBM Plex Sans, pero son importadas por el usuario si no están instaladas; no redistribuir archivos de fuentes.

## 4. Fundamento de contenido

Una campaña no mejora por añadir frases bonitas. Las tesis deben introducir una diferencia interpretable: gratitud y trabajo invisible, generaciones que enseñan, consumo frente a convivencia, respeto por las herramientas compartidas, reconocimiento del cuidado cotidiano. Las preguntas deben incentivar respuestas con experiencias concretas. SHOPMAX y YARDMAX entran por su función, no por atribuir valor moral a la compra.

Para redes sociales: imagen principal legible por sí sola, pregunta en copy de acompañamiento, CTA único, revisión de mensajes recibidos y oportunidades reales de venta. Publicar solo activos que superen QA de modelo, logo y claridad.

## 5. Investigación externa utilizada

- Adobe Illustrator Learn (2026), [What makes a great layout?](https://www.adobe.com/learn/illustrator/web/layout-basics): espacio negativo y agrupación lógica de elementos.
- Adobe Express, [Font Pairing](https://www.adobe.com/learn/express/web/pairing-fonts): jerarquía por peso, tamaño, contraste y equilibrio.
- Adobe Express, [13 rules to stop making bad font choices](https://www.adobe.com/express/learn/blog/13-rules-to-help-you-stop-making-bad-font-choices): legibilidad y reducción de distracciones.
- MDN, [CanvasRenderingContext2D](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D) y [FontFaceSet](https://developer.mozilla.org/en-US/docs/Web/API/FontFaceSet/load): base técnica de render de capas y fuentes locales.
- Shopify ES, [37 ideas de marketing creativas para pequeñas empresas](https://www.shopify.com/es/blog/14851089-11-ideas-de-marketing-de-contenido-que-puedes-poner-en-accion-hoy-mismo): contenido basado en proyectos de clientes, experiencias, aprendizaje y presencia local.
- Magnific, [Vectores de marketing/arte digital](https://www.magnific.com/es/vectores/marketing-arte-digital): catálogo de recursos visuales y funciones de mejora/edición; no es una especificación de render offline ni se integró como dependencia.
- Instagram `https://www.instagram.com/p/DfKelr_oKU1/`: el enlace no pudo abrirse en el navegador de investigación; **no se afirma reproducir su composición exacta**.

**Selección de ingeniería:** HTML+CSS+Canvas 2D, FontFace local, archivos JSON editables y exportación por `canvas.toBlob`. Sin CDN, librerías de terceros ni conexión requerida.
