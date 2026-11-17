# Familias narrativas de carrusel — cinco diseños

| Código | Diseño | Comportamiento | Uso marketing |
|---|---|---|---|
| C4 | Film Strip | Deslizamiento horizontal de tarjetas sobre retícula de cine | Comparar gabinetes de distintas capacidades sin sobrecarga de texto |
| C5 | Paper Stack | Cartas superpuestas con rotación breve y revelado | Historias de regalo, herramientas y organización |
| C6 | Perspective Stage | Producto central y vistas secundarias en perspectiva 2D | Hero SHOPMAX y detalles por ángulo |
| C7 | Gallery Wall | Pared editorial de marcos, cámara lateral sobre una galería | Mostrar colección como exhibición premium |
| C8 | Orbit Gallery | Fotografías en trayectoria elíptica y transición de protagonismo | Presentación dinámica de la gama |

**Importante:** los videos exactos C4–C8 no estaban aportados como masters ejecutables en `unificar.zip`. Estas son **interpretaciones nuevas** de los conceptos recordados. No se afirma que las animaciones o el audio sean iguales a los originales.

## Fondos
1. `solid`: color único, por defecto un carbón suave #10181c.
2. `image`: archivo real importado a la Biblioteca, con opacidad ajustable.
3. `blur`: imagen actual ampliada/desenfocada por Canvas; no fondo generado por IA.
4. `transparent`: PNG con canal alfa para vista fija; al convertir a MP4 se aplana a un fondo sólido porque H.264 estándar no almacena transparencia.

El fondo de la interfaz del editor no forma parte de los frames. No se permite un degradado decorativo fijo a espaldas del usuario en la salida de video.

## Presets de plantilla por canal
- 4:5: feed Facebook/Instagram, producto grande, safe margins.
- 9:16: Reels/Stories, contacto visual y CTR con CTA en lugar seguro.
- 16:9: YouTube y páginas web.
- 1:1: catálogo / grid de tienda.

## Marca
En postproducción insertar MSCCS oficial / Buen Fin autorizado / QR exacto. El carrusel no debe dibujar logos ficticios ni reescribir etiquetas del SKU.
