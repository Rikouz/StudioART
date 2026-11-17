# MSCCS · Editorial Studio V10 · Offline

## Inicio

1. Descomprime el ZIP completo.
2. Abre `ABRIR_PRIMERO.html` con Chrome o Edge. No necesita instalar servidor, iniciar sesión ni conexión a internet.
3. Para maquetar, abre `MSCCS_EDITORIAL_STUDIO_V10_OFFLINE.html` (también disponible por separado).
4. Para recuperar los prompts anteriores, abre `VISOR_THANKSGIVING_V9_CON_ACCESO_V10.html`.
5. Para continuar otro día, pulsa **Guardar proyecto**. El archivo JSON conserva las capas y los recursos cargados. En otro momento, usa **Abrir proyecto**.

## Qué se puede hacer en V10

- Cambiar entre 9:16 (vertical) y 16:9 (horizontal), reacomodando las capas principales.
- Elegir **HERO FOTOGRÁFICO** o **VOID / PRODUCT REVEAL**.
- Trabajar en modos **CON LETRAS** y **SIN LETRAS**. El modo sin letras también afecta a la imagen exportada.
- Importar fotografías, producto aislado PNG, logo, QR e imágenes libres.
- Mover capas por arrastre, redimensionar desde la esquina, ajustar X/Y/W/H/rotación con valores exactos.
- Configurar color, peso, familia, interletraje, interlínea, tamaño, alineación, sombras y opacidad.
- Cargar una fuente personal mediante OTF/TTF/WOFF/WOFF2. **No se distribuyen fuentes externas dentro del ZIP.**
- Aplicar **halo difuminado** o **marco fino** detrás de una capa. Se asignan a su mismo grupo para moverlas juntas.
- Superponer el logotipo oficial MSCCS, un QR editable y CTA en cualquier posición.
- Ajustar zoom, desplazamiento, contraste, brillo, saturación, blur y un enfoque moderado de la fotografía para el horneado.
- Activar márgenes de seguridad; duplicar, ocultar, bloquear o reordenar capas; deshacer y rehacer.
- Usar un banco de 10 tesis de Thanksgiving y modificar todos sus textos.
- Exportar PNG/JPEG a escala completa y guardar JSON editable.

## Resoluciones

| Modo | 4K | Resolución ligera |
|---|---|---|
| 9:16 | 2160 × 3840 píxeles | 1080 × 1920 píxeles |
| 16:9 | 3840 × 2160 píxeles | 1920 × 1080 píxeles |

Las capas tipográficas se dibujan de nuevo a resolución final. La imagen base **no adquiere detalle nativo** por exportarse a 4K. La fotografía de ejemplo tiene **1131 × 2048 px**. Hay nitidez digital moderada opcional para exportación, no ampliación generativa ni reconstrucción 4K por IA.

## Recursos precargados y advertencias

- **Fotografía de ejemplo:** imagen aportada por el usuario en esta conversación.
- **Logo MSCCS:** archivo oficial que venía en el paquete de Buen Fin; no se recrea ni altera.
- **SHOPMAX 954108R7:** imagen de producto de referencia separada para el modo VOID; verificar SKU y dimensiones según catálogo.
- **QR inicial:** se reconstruyó de `https://wa.me/526563119913` para facilitar la maquetación local. El propio archivo está marcado `QR_WHATSAPP_REGENERADO_VERIFICAR.png`. **Importa el QR oficial que ya tienes en Higgsfield antes de aprobación final**, y prueba que abra el contacto deseado.
- **Emblema Buen Fin:** no se incorpora por defecto al arte de Thanksgiving, porque ambos eventos no tienen las mismas fechas. Puedes importarlo como imagen libre cuando tenga sentido comercial y tengas el original autorizado.

## Guía rápida de jerarquía gráfica

- Cream typography / tinta crema: `#F1E8D6`.
- Fondo cálido muy oscuro: `#141C1B`.
- Naranja escaso: `#EE7B51`, reservado a créditos editoriales y enlaces de estudio, **no al CTA**.
- Titulares: mayúsculas, peso inicial **500**, tamaños grandes y espacio negativo.
- Texto conversacional: **29 px / 400**, no repetir el título en pequeño.
- CTA: visible, sereno, sin marcos naranjas o botones de apariencia de interfaz.
- Familia tipográfica preferida: **Saira Semi Condensed** para titulares e **IBM Plex Sans** para información; instálalas localmente o impórtalas si las posees. El editor tiene alternativas de sistema cuando no están disponibles.
- Modo fotográfico: conservar la presencia humana y la integridad del gabinete, evitando tipografía encima del producto.
- Modo VOID: usar exclusivamente un producto con recorte auténtico y sombra de contacto; sin inventar accesorios.

## Limitaciones / QA honesto

Este editor **no genera fotografías** ni realiza edición generativa de producto. No garantiza que los recortes con artefactos puedan arreglarse sin una fuente mejor. Tampoco integra Higgsfield de forma automática: esa parte sigue en el visor V9.

Validado en esta sesión: estructura de recursos, sintaxis JavaScript, pruebas de lógica en entorno JS simulado y decodificación del QR. **La verificación visual completa con clics sobre navegador real no se pudo completar** por un bloqueo del navegador automatizado en este entorno. Antes de usar comercialmente, abre el HTML local, arrastra el logo y el CTA, cambia ambos formatos, exporta un PNG y confirma legibilidad y QR.
