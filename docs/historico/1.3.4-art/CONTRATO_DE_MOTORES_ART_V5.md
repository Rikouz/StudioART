# Contratos de motor propuestos para StudioART 1.4 — Especificación técnica

**No corresponde a código instalado.** Estos contratos son el objetivo de desarrollo. Se expresan como pseudotipos JavaScript/TypeScript para reducir acoplamiento y permitir que el generador, el editor y los exportadores compartan una escena. Conservar adaptadores para seed-1 a seed-6.

## A. Jerarquía de datos

```ts
type SourceAsset = {
  id: string; sha256: string; type: 'image'|'video'|'audio'|'font';
  width?: number; height?: number; duration?: number;
  role?: 'background'|'product'|'logo'|'qr'|'reference'|'music'|'font';
};
type Transform2D = {x:number; y:number; scaleX:number; scaleY:number; rotation:number;
  originX:number; originY:number; matrix?:number[]};
type SceneNode = {
  id:string; type:'sourceWindow'|'product'|'image'|'shape'|'text'|'geometry'|'group'|'adjustment';
  name:string; visible:boolean; locked:boolean; zIndex:number; opacity:number;
  transform:Transform2D; clipId?:string; maskId?:string; blendMode?:string;
  sourceAssetId?:string; children?:string[]; effectIds?:string[];
};
type EffectNode = {
  id:string; operator:string; enabled:boolean; seed:number; amount:number;
  maskId?:string; blendMode?:string; order:number; params:Record<string,unknown>;
};
type SeedV7 = {
  version:'msccs-seed-7'; master:number;
  structure:number; typography:number; geometry:number; surface:number;
  palette:number; lighting:number; motion:number; decoration:number; integration:number;
};
type Recipe = {
  schema:'studioart.recipe/7'; sourceHashes:string[]; fontHashes:string[];
  canvas:{width:number;height:number;colorSpace:string};
  seed:SeedV7; nodes:SceneNode[]; effects:EffectNode[];
  textSources:Record<string,string>; engineVersions:Record<string,string>;
};
```

## B. Render determinista

```ts
function analyzeSource(asset:SourceAsset, profile:AnalysisProfile): Promise<AnalysisMaps>;
function buildCandidates(recipe:Recipe, requested:number): Candidate[];
function scoreCandidate(candidate:Candidate, guides:CommercialGuides): ScoreBreakdown;
function renderAt(recipe:Recipe, tSeconds:number, width:number, height:number): ImageFrame;
function exportFrames(recipe:Recipe, opts:{fps:number;seconds:number;format:string}): AsyncIterable<VideoFrame>;
```

El render debe **hacer clipping en el espacio local de cada `SourceWindow` antes del efecto**. El mapa de bordes debe generarse desde coordenadas de la fuente original o transformarse con la **misma matriz** que la fotografía. No basta con dibujar un overlay 2D a pantalla completa.

## C. Grafo de efectos

Orden recomendado: (1) source/color → (2) análisis multi-resolución → (3) nodos base y contornos → (4) mallas/enlaces/motivos → (5) impresión/pixel/memoria → (6) tipografía geométrica → (7) máscaras, occlusion y blend → (8) producto/logotipo/QR protegidos → (9) camera/motion → (10) salida. Cada efecto debe aceptar la máscara y `sourceTransform` del nodo.

**Adaptadores existentes:** `fxNodes`, `fxGrid`, `fxContour`, `fxDither`, `StudioContourDesign.paint()`, `StudioDesign.approximate()`, `window.SLLayerMotion.render()`. Mantener todos con semántica legacy, pero exponerlos mediante operadores nuevos que puedan coexistir. Los looks seed-6 no deben mutarse retroactivamente.

## D. Algoritmos a profundizar

- **Edge Pyramid:** Sobel/Scharr y NMS en 3-5 escalas; umbral de fuerza, curvatura y coherencia tangente; opcional flow/temporal delta.
- **Contour Atlas:** marching squares con desambiguación de celdas, cache de polilíneas, simplificación RDP controlada por resolución; hit-test local.
- **Signal Nodes:** muestreo Poisson-disc adaptado a fuerza de contorno, tamaño jerárquico y orientación tangente; puntos héroe + secundarios + micro.
- **Connection Graph:** Delaunay/híbrido/chain/radial/orthogonal con score de soporte de borde y anti-colisión; no dibujar aristas arbitrarias sobre el producto protegido.
- **Recursive Grid:** división de planos guiada por actividad, espacios libres, rostros/productos y bloqueos; ventanas exportables, recortes coherentes.
- **Print / Memory:** dithering Bayer/Floyd/Atkinson/blue-noise, umbral, preserve edges, ecos horizontales, ventanas fuente y glyph cloud; celdas calibradas a lado corto 1080.
- **Typography Field:** conversión local de glifos a paths (respetando licencia y shaping), contorno de tinta, texto a lo largo de curvas, knockout, collage modular, animación por carácter; copy exacto intacto.
- **Depth/Integration:** máscaras como datos editables, oclusión por planos, color matching, sombras de contacto y check oficial de SKU; profundidad estimada opcional, nunca inventar geometría del objeto.
- **Motion:** trayectoria temporal por nodo, seed temporal estable, compensación entre frames, audio con BPM/bandas precalculados, freeze de imagen sin detener audio si se configura.

## E. Selector de variantes

Generar candidatos internos (8-16 por solicitud) con streams separados; filtrar errores críticos primero (producto cortado, QR ilegible, texto desbordado, contraste insuficiente). Escoger una alternativa de máxima calidad y **diversa respecto a las últimas cuatro aceptadas**. La vista principal presenta **un único diseño por pulsación**; “Comparar” abre opcionalmente 4 alternativas almacenadas. `Repetir semilla` recupera el mismo `Recipe` y medios; bloquear una capa impide cambios de caja, máscara y transform al generar otro diseño.

Propuesta de score interpretable: `0.30*legibilidad + 0.20*integridad_producto + 0.15*contraste + 0.15*espacio_negativo + 0.10*equilibrio + 0.10*novedad` sujeto a **veto** por distorsión/logo/QR. Estos pesos son hipótesis a calibrar, no métricas verificadas de 1.3.4.

## F. Criterios de compatibilidad

1. No editar recetas existentes de seed-1 a seed-6; dispatch explícito por `engineVersion`.
2. `STUDIOART_PORTATIL.html` se compila desde módulos, no se edita manualmente como fuente primaria.
3. La interfaz Fácil/Pro y controles de capa conservan nombres, colores y estados, agregando una sección “ART · Geometría y Tipografía”.
4. Los archivos de proyecto siguen siendo legibles offline en Windows; los assets se validan por SHA-256 y nunca se remiten a un servicio externo automáticamente.
5. Registrar benchmark visual con fotografías finales; nunca sustituir una foto oficial por contenido especulativo de la máquina.
