# MSCCS Creative Studio V10 · Auditoría técnica

## Integridad confirmada
| Prueba | Resultado |
|---|---|
| Catálogo de campaña | 17 conceptos: 9 SHOPMAX, 8 YARDMAX |
| Prompts de imagen | 34 variantes, máximo 2,217 caracteres |
| Prompts de video | 170 fotogramas completos, máximo 1,167 caracteres |
| Efectos Canvas2D | 27 variantes + Sin efecto |
| JS (`node --check`) | Sin errores de sintaxis |
| IDs HTML referidos por JS | 103 / 103 existentes |
| JSON | Estructuras cargadas correctamente |
| Códigos QR | `https://wa.me/526563119913`, validado con decodificador QR |
| ZIP de proyecto generado en JavaScript | Abierto/validado con Python `zipfile` |
| MP4: clip original + logo temporal | Render FFmpeg exitoso, H.264/AAC, 1080×1350, 2.1 s |
| MP4: video + imagen + audio independiente | Render FFmpeg exitoso, 1080×1350, 2.4 s |
| MP4: opción `--remaster` | Render FFmpeg exitoso |
| Referencias YARDMAX | 15 RGBA QA horneados, pendiente aprobación geométrica |

## Pendiente de validación real en el equipo del usuario
1. Navegación completa del HTML y prueba de arrastre de cada capa: el navegador automatizado del entorno bloqueó navegación a `file://` y `127.0.0.1`.
2. Exportación WebM/MP4 con MediaRecorder en Chrome/Edge del usuario; códecs, audio y sincronización varían por navegador.
3. Exportación 4K de videos largos, sujeta a memoria/CPU/GPU.
4. Gestión de fuentes externas importadas en proyectos complejos.
5. Inspección visual individual de los 15 candidatos YARDMAX contra las fotos del fabricante.
6. Comprobación de registro de MSCCS en el programa Buen Fin antes de usar el distintivo comercial.

## Hallazgos del HTML de usuario que se corrigieron
- Catálogo ficticio con herramientas hidráulicas y maquinaria ajena a los modelos registrados.
- Logo MSCCS y sello Buen Fin dibujados como sustitutos ficticios.
- QR simulado sin destino verificable.
- Dependencia de Tailwind, Google Fonts y Lucide por CDN.
- Sin gestor de medios, proyecto exportable, edición de audio o timeline real.

## Qué NO hace V10
- No es un clon 1:1 de los efectos del video ajeno: las variantes son implementaciones propias 2D.
- No monta modelos de maquinaria dentro de tiendas de forma automática mediante IA.
- No convierte imágenes de baja calidad en originales 4K con detalle nuevo.
- No sincroniza múltiples pistas de audio con precisión de edición profesional en el exportador de navegador.
- El exportador FFmpeg local no replica todos los efectos Canvas2D (solo renders, cortes, audio, overlays y ajuste técnico).
