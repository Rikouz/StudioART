# Auditoría ART — StudioART 1.3.4

Registro histórico de la auditoría y del plan recibidos el **17 de noviembre de 2026**. Son análisis y propuestas; **no se implementaron sus tareas ni se modificó el código fuente para aplicar sus recomendaciones**.

## Procedencia e integridad

- Paquete completo de auditoría en [Google Drive](https://drive.google.com/file/d/1JcvxCn5C8NTYpo1ORSmlGAt0BbtfgHeF/view?usp=drive_link), 561,019 bytes, SHA-256 `07edc4f7c3cc54056bead4cb25d6fab8aa3575d6a1b6937a8dd22b8ea7f11f4a`.
- Versión base examinada: `STUDIOART_1_3_4_DISENO_UNICO_Y_CONTOUR.zip`, SHA-256 `c002fd1e02e4a5efaf9d1432bd55a7ca42369e851b49d5468f86500405dedfb3`.
- Del paquete se archivaron los documentos, el PDF, las matrices y los registros técnicos. El original completo sigue disponible en Drive.

## Contenido

- [Auditoría técnica completa](AUDITORIA_TECNICA_STUDIOART_1_3_4.md)
- [Auditoría en PDF](AUDITORIA_STUDIOART_1_3_4_ART.pdf)
- [Plan de ejecución](PLAN_EJECUCION_ART_134.md)
- [Backlog de 31 tareas — CSV](BACKLOG_ART_134_A_140.csv) y [JSON](BACKLOG_ART_134_A_140.json)
- [Contrato propuesto de motores ART V5](CONTRATO_DE_MOTORES_ART_V5.md)
- [Matriz QA visual de 48 casos](MATRIZ_QA_VISUAL_48_CASOS.csv)
- [Evidencia de código](EVIDENCIA_CODIGO_134.json), [nota de entrega](LEEME_ENTREGA_ART_134.txt) y los registros `qa_run.log`, `qa_independent.log`, `chromium_attempt.log`.

## Nota de revisión

Se verificó que el backlog contiene 31 IDs únicos y la matriz 48 casos. También se contrastó con `modulos/estudio_v5/ESTUDIO_V5.html` la afirmación sobre `generateStructuralDesign`: `seed-6` asigna `fxNodes:false`, `fxGrid:false`, `fxContour:false`, `fxDither:'off'` y `fxFinish:'none'`. El informe deja registradas como pendientes las pruebas que requieren Canvas nativo y la comprobación visual integral de Chrome/Edge; los logs se conservan tal cual para que no se confundan sus resultados con otras ejecuciones.

El `video_contact_sheet.jpg` (537,735 bytes; SHA-256 `a1dfd8d7a521162b42522db9cdb36b6b733104a34ca56a21e77d8d8012d5e8c8`) se dejó fuera del repositorio porque la política de publicación de código excluye imágenes y medios. Sigue dentro del ZIP original enlazado arriba.
