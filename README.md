# StudioART · Supremo Líder 1.3.2

Editor local de imagen, composiciones y salidas PNG/GIF/video. Desarrollo continuado desde Supremo Líder 1.2.8 y 1.2.9.

## Abrir

Descarga el código y abre **STUDIOART_PORTATIL.html** en Chrome o Edge. Los módulos, scripts y tipografías se incluyen en esta base. El acceso a disco, almacenamiento y algunos formatos de video dependen del navegador.

En **Estudio de imagen**, carga tus archivos locales. Elige una categoría y una semilla para generar cuatro propuestas. El mismo contenido, formato y semilla producen la misma composición. Usa Color, Composición y Decoración para variar un canal, o Variar todo para pasar a otra serie.

En Pro puedes editar capas, tamaño y posición del logo, fondos de texto, cuadros y formas, o elegir Formato libre entre 320 y 4096 px por lado. Referencia visual analiza un archivo local y aporta colores y actividad a la composición. Primitivas aproxima el fondo con rectángulos, elipses y triángulos y exporta SVG.

## Desarrollo

- `modulos/estudio_v5/ESTUDIO_V5.html` contiene el flujo de Estudio y la persistencia de propuestas.
- `modulos/estudio_v5/design_engine.js` contiene las 30 familias, el análisis de paleta, la colocación y la búsqueda por primitivas.
- `js/` contiene Biblioteca, almacenamiento, Cámara, Carrusel y los puentes de composición.
- `qa/` contiene regresiones para composición, Biblioteca, Cámara y Carrusel.
- `docs/APENDICE_DISENO_1_3.md` describe algoritmos, referencias verificadas, límites y pendientes.

Con Python 3 y Node disponibles, ejecuta desde la raíz.

```sh
python3 scripts/qa_static.py --root .
python3 qa/qa_source_release.py --root .
node qa/library_persistence.cjs
node qa/camera_revision.cjs
node qa/carousel_revision.cjs
```

Las dos pruebas de Canvas usan `@napi-rs/canvas` como dependencia de desarrollo. El runtime de la aplicación se abre sin esa dependencia. Ejecuta `node qa/studio_composition.cjs` y `node qa/camera_effects.cjs` con la dependencia disponible en la resolución de Node.

El manifiesto se actualiza mediante `python3 scripts/refresh_manifest.py --write`. Los archivos nuevos de distribución se registran con `--include RUTA`.

## Recursos locales

Esta base comienza con una biblioteca vacía. Las fotografías, productos, logos, QR, renders y proyectos con datos binarios se incorporan desde archivos locales. El historial Git de esta base parte del repositorio StudioART.

Al preparar una exportación de código desde otra copia de desarrollo, usa `scripts/prepare_code_release.py` hacia una carpeta separada. El script prepara fuentes y limpia datos multimedia embebidos. `qa/qa_source_release.py` revisa extensiones y cadenas base64. La variante `--tracked` revisa la selección versionada antes de subirla. Las exclusiones de `.gitignore` añaden otra capa de prevención.

## Estado de validación

Las regresiones de lógica y Canvas están verificadas. La apertura y exportación integral en Chrome o Edge con archivos reales siguen pendientes. El acceso a varios videos y al contenido de Instagram/Wireflow fue limitado. El apéndice registra esas referencias por separado.

Geometric y Geometrize se documentan como fuentes de técnicas. El motor JavaScript de aproximación por primitivas es una implementación propia de búsqueda aleatoria con mejora local, ejecutada sobre un proxy. Conservamos los avisos de los componentes tipográficos y de PhotoCraft incluidos en el código.

## Desarrollo 1.3.2

Consulta `docs/AUDITORIA_1_3_1.md` para los cambios, instrucciones y pendientes del plan completo. Incluye capas con historial por propuesta, 30 categorías, mapa de espacios libres, refinado progresivo de primitivas y nueve efectos compartidos con Video. La edición conserva recursos locales y proyectos anteriores.

Ejecuta `python3 scripts/qa_all.py` para comprobar fuentes y regresiones. Los tests Canvas requieren `@napi-rs/canvas` disponible; no se usa en la aplicación offline. La comparación histórica seed-3 requiere el commit Git de la base y se omite en el ZIP sin historial.

## Planos, efectos y auditoría 1.3.2

Los doce efectos restantes se incorporan al compositor de planos de Video. Estudio exporta planos de fondo/producto/textos/logo/QR/capas y conserva máscaras. Video admite claves por plano y movimiento por semilla. Consulta `docs/AUDITORIA_1_3_2.md` para condiciones, límites y comprobaciones. El archivo `AUDITORIA_AUTOMATICA.html` permite ejecutar pruebas con figuras sintéticas en Chrome/Edge y descargar un informe. La aceptación integral de navegador continúa pendiente en este entorno.
