# SPEC — Automatización horaria para Líder Supremo

**Versión del documento:** 1.0 · **Base inspeccionada:** Supremo Líder Offline 1.2.4 · **Plataforma prevista:** Windows 10/11, PowerShell 7, Git, Codex CLI, Chrome/Edge.

## 1. Propósito

Desarrollar Líder Supremo en ciclos pequeños y trazables, con mejora continua de interfaz, editor de imagen, video, prompts, biblioteca, integración de fuentes y QA. Una ejecución horaria propone como máximo una mejora verificable dentro de una rama Git temporal.

La aplicación distribuida hoy es una solución local/offline HTML con módulos preexistentes, IndexedDB y un actualizador de ZIP con manifiesto SHA-256. El ZIP no contiene un repositorio Git de desarrollo; por eso el ciclo necesita una copia de fuentes controlada por Git. El actualizador offline sigue siendo el mecanismo de instalación de parches una vez que una candidata sea revisada y preparada.

## 2. Usuarios y trabajos

- **Operador MSCCS:** mantiene el control de los productos, fotos maestras, textos comerciales, marca y prompts enviados.
- **Mantenedor:** configura el repositorio, el backlog y los comandos de QA.
- **Agente de desarrollo:** revisa el código existente, implementa una tarea de alcance acotado, documenta su cambio y ejecuta los controles declarados.

## 3. Alcance

### Incluye

1. Temporizador horario local en Programador de tareas de Windows.
2. Exclusión mutua para evitar dos ejecuciones simultáneas.
3. Verificación de estado limpio y rama estable antes de abrir un ciclo.
4. Rama/worktree independiente por cambio candidato.
5. Contexto de diseño, protección de producto/marca y backlog estructurado.
6. Validaciones estáticas configurables y registro de salida.
7. Incremento de versión candidata y actualización del manifiesto como requisito para un cambio de aplicación.
8. Revisión humana antes de fusionar, empaquetar e instalar.

### No incluye en esta entrega

- Auto-merge, publicación, despliegue o reemplazo de instalación estable.
- Generar o subir artefactos publicitarios sin aprobación.
- Automatizar el botón de generar/publicar en Higgsfield, ni manejar sesión/contraseñas/cookies.
- Descargar e instalar skills, paquetes npm/Python o binarios sin fijar una versión y revisar su licencia y procedencia.
- Prometer que hay mejoras útiles cada hora; si no existe una tarea segura, la ejecución registra que no hubo cambio.

## 4. Requisitos funcionales

| ID | Requisito | Criterio de aceptación |
|---|---|---|
| F-01 | Correr cada hora | La tarea de Windows inicia una única ejecución, si el PC está despierto y el usuario autenticado. |
| F-02 | Aislar | Cada ciclo crea `supremo/evolution/AAAA-MM-DD-HHmm` en un Git worktree propio. |
| F-03 | Un cambio | Codex atiende una sola ficha `ready` de mayor prioridad y modifica el mínimo de archivos. |
| F-04 | Evitar colisiones | Lock exclusivo y detección de candidatas previas pendientes. |
| F-05 | Conservar el master | No hacer checkout ni escribir sobre la rama estable; no fusionar ni publicar. |
| F-06 | Verificar | Ejecutar todos los comandos declarados y retener logs aun si fallan. |
| F-07 | Control de versión | Para una mejora funcional, actualizar `VERSION_SUPREMO.json`, changelog y hashes del manifiesto. |
| F-08 | Trazabilidad | Guardar ID del backlog, hash base, rama, diffstat, versión y resultado en la carpeta hermana oculta `.supremo-evolution-<nombre-del-repo>/reports/`. |
| F-09 | Parar ante riesgo | Si árbol sucio, versión inválida, prueba fallida o rama candidata pendiente, salir sin modificar la base. |
| F-10 | Prompt manual seguro | Preparar/copy-paste revisable en Chrome; nunca activar generación ni publicación automáticamente. |
| F-11 | Modo simulación | `-DryRun` muestra los pasos y no inicia Codex ni escribe en Git salvo directorio de simulación temporal. |
| F-12 | Límite de recursos | Un ciclo termina a los 35 minutos o se registra para revisión; el programador no lanza un segundo ciclo mientras el primero corre. |

## 5. Requisitos no funcionales

- **Local-first:** medios originales y proyectos no deben enviarse a fuentes externas por defecto.
- **Compatibilidad:** abrir el entregable final con `ABRIR_SIN_SERVIDOR.html` en Chrome/Edge; no retirar los módulos de compatibilidad.
- **Fidelidad:** producto oficial, SKU, logotipos, QR, número de piezas, medidas y claims son datos protegidos.
- **Accesibilidad:** teclado, foco visible, contraste legible, controles con etiquetas, estados de error visibles.
- **Rendimiento:** paginación/virtualización de biblioteca; previews proxy si el original supera memoria; render con progreso/cancelación.
- **Licencias:** conservar avisos y licencias de fuentes, tipografías y librerías; registrar procedencia y versión.
- **Reversibilidad:** cambios candidatos se descartan con `git worktree remove` y `git branch -D`; no se borran assets de producción.

## 6. Ciclo horario

1. Windows inicia `Start-SupremoEvolution.ps1`.
2. Adquiere lock y valida Git/Codex, rama estable limpia y ausencia de candidata pendiente.
3. Selecciona la ficha `ready` con prioridad más alta.
4. Crea worktree temporal y entrega a Codex el SPEC, `AGENTS.md` si existe, backlog y protección de activos.
5. Codex implementa un corte vertical. El prompt impide cambios a assets comerciales sin tarea explícita.
6. Se ejecutan validaciones configuradas: manifiesto/versión/JSON, sintaxis JS si Node está disponible y verificaciones propias del módulo.
7. Si no hay diferencia, limpia el worktree y registra “sin cambio”. Si hay error, conserva rama e informe como candidata bloqueada. Si pasa, conserva la rama candidata para revisión humana.
8. El operador revisa diff, abre la aplicación y compara artefactos. Después fusiona o descarta la candidata.
9. Sólo tras merge revisado se genera el ZIP/patch con manifiesto verificado y se instala mediante el actualizador Supremo.

## 7. Diseño de seguridad y permisos

- Codex CLI ejecuta con sandbox `workspace-write`, `ask-for-approval never` dentro del worktree aislado. El prompt restringe el cambio al repositorio.
- Las validaciones se especifican localmente; no se ejecutan scripts que vengan de una fuente web en ese ciclo.
- No guardar tokens ni credenciales en la carpeta Git. Usar la sesión gestionada por CLI.
- Rechazar limpieza destructiva, cambios al branch estable, push/PR/publicación o acciones de Chrome.
- Las dependencias nuevas deben proponerse en la rama con análisis de licencia, pin de versión y fallback offline.
- Las skills visuales actúan como guías, no como autoridad para sustituir marca, fotografías oficiales o criterios de aceptación.

## 8. Puntos de integración de Líder Supremo

- **Base UI:** `index.html`, `css/`, `js/app.js`; navegación de 11 secciones y paneles editables.
- **Imagen:** `modulos/creative_v10/` y `modulos/estudio_v5/`; capas, producto protegido, máscaras, perspectiva, igualación de luz y exportación.
- **Video:** Creative V10, `js/browser_render.js`, `js/camera.js`; timeline, audio no destructivo, render determinista y cola reanudable.
- **Carruseles:** `js/carousel.js`, Carrusel V3; C4–C8, misma rutina de dibujo para preview y exportación.
- **Prompts:** `data/campana_2026.json`, estados y metadatos; copiar prompt completo, referencias por SKU, escenas y variaciones con semilla reproducible.
- **Biblioteca:** `js/library_catalog.js`, IndexedDB y activos; carpetas, paginación, búsqueda y recuperación sin bloquear el editor.
- **Higgsfield:** integrar después como panel/cola local, con revisión de prompt y copia. El usuario controla el envío en Chrome.

## 9. Criterios de éxito (primeros 30 días)

- 100% de los ciclos se guardan con logs e ID de backlog.
- Ningún cambio toca rama estable automáticamente.
- 100% de candidatas fusionadas pasan checks configurados y revisión visual en Chrome.
- Cero pérdida/modificación no autorizada de SKU, assets oficiales, QR o proyectos.
- Tasa de ciclo útil, porcentaje de propuestas aceptadas, regresiones detectadas y tiempo medio de render medidos semanalmente.
- Los ciclos sin una tarea aceptable concluyen sin cambio y sin gasto de generación innecesario.
