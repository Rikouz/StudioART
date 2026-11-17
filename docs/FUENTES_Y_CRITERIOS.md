# Fuentes y criterio de adopción

La automatización debe tratar fuentes como entradas verificables que se evalúan antes de integrar; no como plugins que se descargan y ejecutan a ciegas en cada hora.

| Fuente | Aplicación posible | Límite de adopción |
|---|---|---|
| [Impeccable](https://github.com/pbakaus/impeccable) | Auditoría de tipografía, espaciado, contraste, jerarquía y componentes. | Adaptar al sistema existente, tokens y navegación; no aplicar un rediseño masivo automático. |
| [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | Patrones y recomendaciones para interfaces y decisiones multi-plataforma. | Usarlo como checklist/contexto, con revisión humana y necesidades reales del editor. |
| [Taste Skill](https://github.com/Leonxlnx/taste-skill) | Crítica para evitar resultados frontend genéricos y decidir referencias visuales. | Usar referencias con procedencia; no copiar assets, pantallas ni identidad de terceros. |
| [Emil Kowalski skills](https://github.com/emilkowalski/skills) | Motion con propósito, easing, timing y detalle de interacción. | Movimiento debe mejorar feedback y no distraer; preferencia reduce movimiento. |
| [HyperFrames](https://github.com/heygen-com/hyperframes) y [docs](https://hyperframes.app/docs/1-startup/2-quickstart) | HTML/CSS/GSAP para escenas editables, captura frame a frame y salida de video. | Añadir sólo si la reproducción/export es determinista y se verifica consumo de memoria/FFmpeg. |
| [FFmpeg skill](https://github.com/kajisho5/ffmpeg-skill) | Encapsular flujos locales de edición, loudness, cortes, captions y revisión FFmpeg. | Confirmar versión/licencia y usar comandos explícitos, locales, reproducibles; jamás editar originales in-place. |

## Orden de precedencia visual/comercial

1. Exactitud de producto y referencias oficiales del SKU.
2. Identidad MSCCS, claim, QR y CTA aprobados.
3. Usabilidad, legibilidad y accesibilidad.
4. Principios de composición y motion de las fuentes.
5. Efectos decorativos.

## Práctica de fuentes

- Registrar release/commit exacto y licencia en el lockfile antes de agregar código.
- Leer el archivo completo de licencia y avisos de copyright.
- Evitar dependencias CDN; incluir código auditado local si la licencia y tamaño lo permiten.
- No permitir que una skill cambie directamente assets de producto, HTML publicado o credenciales.
- Las URLs del registro son repositorios de referencia; el ciclo horario no hace `git clone`, `npm install` ni actualizaciones automáticas de terceros.
