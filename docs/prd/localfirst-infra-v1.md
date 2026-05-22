# PRD — Local-first Infra v1 (Effect-first)

Este PRD define el foundation slice para que la app tenga persistencia local,
realtime local y una base de sincronización futura sin acoplar el dominio a
SQLite, Cloudflare ni detalles de infraestructura.

## Estado

| Campo | Valor |
| --- | --- |
| Estado | Draft v1 |
| Rama | `docs/prd-localfirst-infra-v1` |
| Target inicial | Chrome / Chromium |
| Delivery esperado | PR de documentación primero; implementación en PR(s) posterior(es) |

## Decisiones tomadas

| Área | Decisión |
| --- | --- |
| Filosofía | **Privacy-first**, **local-first**, **Effect-first** |
| Persistencia | SQLite en browser con OPFS, ejecutado desde Web Worker |
| API de infra | Servicio `LocalDb` expuesto por `Context.Tag` + `Layer` de Effect |
| Realtime v1 | Live queries por `invalidate + refetch` |
| Cross-tab | `BroadcastChannel` para propagar invalidaciones entre tabs |
| Testing | Adapter in-memory para tests unitarios y application/domain |
| Sync remoto | Fuera de V1; diseñar puntos de extensión sin implementarlo |
| Compatibilidad | Chrome/Chromium first; Safari/iOS no bloquea V1 |
| UI Notes | Vive en `packages/notes/presentation`; `apps/web` solo monta/composition root |
| Migraciones | Sí: documentar convención antes de implementar código |
| `LocalDb` API | SQL interno para infra; subdominios consumen repositories |
| `effect-qb` | Spike reversible con beta 4; no asumir adopción hasta validar SQLite |
| `core`/`shared` | No crear packages vacíos; introducirlos cuando haya uso concreto |
| Migration DX | V1 incluye generator Nx para crear migraciones |
| App state | Effect Atom + SolidJS integration as presentation-state bridge |

## Problema

La app necesita una base de estado que sea usable offline por defecto y que no
obligue a rediseñar cada subdominio cuando agreguemos sync remoto. Si cada
feature decide su propia persistencia, terminamos con:

- modelos inconsistentes;
- lógica de migraciones duplicada;
- tests atados a browser/OPFS;
- realtime local difícil de componer;
- dominio acoplado a infraestructura.

## Objetivo

Entregar una infraestructura local-first mínima pero real que permita a futuros
subdominios —notes, workout, fitness, nutrition, auth, etc.— montarse con el
mismo patrón:

1. dominio/application expresado con Effect y puertos;
2. persistencia local inyectada por `Layer`;
3. migraciones determinísticas;
4. realtime local verificable;
5. tests unitarios sin dependencia de OPFS.

V1 usa **Notes CRUD** como placeholder. Notes no es el producto final: es el
slice de validación arquitectónica.

## Alcance V1

### Packages objetivo

| Package | Responsabilidad |
| --- | --- |
| `packages/core` | Dominio core no compartible/reusable fuera del producto: políticas, conceptos e invariantes centrales |
| `packages/shared` | Elementos compartibles y genéricos: schemas/codecs, helpers, tipos y utilidades sin ownership de negocio |
| `packages/localfirst-db` | SQLite OPFS Worker, `LocalDb`, migraciones, live query infra y cross-tab |
| `packages/notes` | Placeholder subdominio con CRUD mínimo para validar ports/adapters, presentation y wiring |

### Topología core/shared

`core` y `shared` no significan lo mismo:

- `core`: conocimiento central del producto. Puede ser usado por subdominios,
  pero no se diseña como librería genérica compartible hacia afuera.
- `shared`: piezas reutilizables sin ownership de dominio. Si algo empieza a
  contener reglas de negocio, no pertenece a `shared`.

Cada uno puede organizarse internamente con las capas:

```text
<package>
  ├─ domain
  ├─ application
  ├─ infra
  └─ presentation
```

La pregunta de diseño es si cada capa debe ser un package separado o carpetas
dentro de un solo package por bounded context.

| Alternativa | Pros | Cons | Cuándo usarla |
| --- | --- | --- | --- |
| Un package por bounded context con carpetas internas | Menos overhead Nx/pnpm, imports más simples, refactors más baratos, mejor para arrancar | Menos enforcement físico entre capas; requiere disciplina de boundaries | Recomendado para V1 |
| Package por capa (`core-domain`, `core-application`, etc.) | Boundaries fuertes, dependencias explícitas, escalabilidad en equipos grandes | Mucho boilerplate, grafo más ruidoso, riesgo de diseño prematuro | Cuando el dominio y el equipo crezcan |
| Híbrido: un package inicial y extraer capas cuando duela | Optimiza por aprendizaje, conserva opción de endurecer boundaries | Requiere criterio para saber cuándo extraer | Recomendado como política evolutiva |

Decisión V1: empezar con **un package por bounded context** y carpetas internas
`domain/application/infra/presentation`. Extraer packages por capa solo cuando
haya presión real: ownership separado, ciclos difíciles, builds lentos o APIs
que necesiten versionado independiente.

`core` y `shared` no se crean vacíos. Entran al repo cuando exista el primer uso
concreto que justifique ownership compartido o core de producto.

### `packages/localfirst-db`

Debe proveer:

- `LocalDb` como `Context.Tag` de Effect;
- `LocalDbLive` como `Layer` para SQLite OPFS en Worker;
- `LocalDbInMemory` o equivalente para tests;
- runner de migraciones con tabla `migrations`;
- mecanismo de change notifications;
- live queries MVP por invalidación y refetch;
- puente cross-tab basado en `BroadcastChannel`.

### Notes placeholder

Debe validar el flujo completo:

- crear nota;
- listar notas;
- editar nota;
- eliminar nota;
- observar cambios vía live query;
- ver invalidación entre tabs sin refresh manual.

## No objetivos V1

- Sync remoto o multi-dispositivo.
- CRDT completo end-to-end.
- Resolver dominio real de negocio más allá de Notes placeholder.
- Soporte estricto Safari/iOS.
- Live queries incrementales con patches/diffs.
- Framework de eventos de dominio definitivo.
- Autogenerar migraciones desde Effect Schema en esta primera iteración.

## Principios de diseño

- **Pragmatismo sobre pureza DDD**: capas claras, sin ceremonia innecesaria.
- **Dominio independiente de infra**: domain/application no importan SQLite,
  OPFS, Worker ni Cloudflare.
- **Infra por Layer**: cambiar Live/InMemory no cambia el código consumidor.
- **Schema explícito**: Effect Schema forma parte del lenguaje del proyecto, pero
  el persisted schema/migrations siguen siendo una decisión explícita.
- **Realtime simple primero**: invalidar y refetchear antes de optimizar.
- **Determinismo en tests**: lo testeable no debe depender de APIs de browser.

## Arquitectura propuesta

```text
apps/web
  └─ composition root: providers, routes, global runtime/layers

packages/notes
  ├─ domain
  ├─ application
  ├─ infra adapter using LocalDb
  └─ presentation UI + Effect Atom bindings

packages/localfirst-db
  ├─ LocalDb service
  ├─ SQLite OPFS Worker adapter
  ├─ migration runner
  ├─ live query invalidation
  └─ BroadcastChannel bridge
```

### Ports/adapters mínimos

V1 define solo lo necesario:

- `LocalDb`: servicio interno de infraestructura para ejecutar
  queries/transactions desde adapters concretos.
- `NotesRepository`: puerto de ejemplo para validar composición desde un
  subdominio.
- `ChangeBus`: mecanismo interno de infra para invalidaciones. No se considera
  todavía el sistema final de domain events.

Regla de acceso: `presentation` y `application` no llaman SQL ni `LocalDb`
directamente. Los subdominios consumen repositories/servicios de application;
`LocalDb` queda detrás de `infra`.

### Estado de presentación

Como la app es client-first/local-first, la comunicación entre `presentation` y
el resto del subdominio se modela con **Effect Atom** y la integración SolidJS.

Decisión V1:

- usar `@effect/atom-solid` alineado con la beta de Effect del workspace;
- los atoms viven en `packages/<subdomain>/presentation` o en un submódulo
  cercano de presentation state;
- los atoms llaman servicios de `application`, no `LocalDb` directo;
- async/loading/error se representan con los tipos/resultados de Atom/Effect;
- live query invalidations refrescan atoms/read models, no componentes sueltos;
- `apps/web` monta providers/registry/runtime, pero no contiene lógica de Notes.

Instalación propuesta:

```yaml
catalog:
  "@effect/atom-solid": 4.0.0-beta.66
```

Y en el package de presentation que lo use:

```json
{
  "dependencies": {
    "@effect/atom-solid": "catalog:",
    "effect": "catalog:",
    "solid-js": "catalog:"
  }
}
```

Alternativa descartada para V1: usar señales Solid ad-hoc como estado principal.
Solid signals siguen siendo válidas para estado puramente local de componente,
pero el estado que cruza hacia application/infra debe pasar por Effect Atom.

## Persistencia local

### Motor

- SQLite en browser con OPFS + Web Worker.
- Candidato inicial: `@effect/sql-sqlite-wasm` si cubre bien el caso OPFS Worker.
- Si el candidato no encaja, documentar trade-off antes de elegir alternativa.

### Candidato: `@effect/sql-sqlite-wasm`

Pros:

- Encaja naturalmente con la arquitectura Effect-first: `Layer`, `Scope`, errores
  tipados y composición con servicios.
- Ya provee piezas orientadas a OPFS Worker (`OpfsWorker`) y migración SQL dentro
  del ecosistema Effect.
- Reduce wrappers propios alrededor de SQLite si sus abstracciones alcanzan.
- Mantiene una API coherente con futuros servicios Effect.

Cons / riesgos:

- Menos battle-tested que usar directamente el paquete oficial de SQLite WASM.
- Puede imponer decisiones internas de `@effect/wa-sqlite`/VFS que limiten
  control fino.
- La integración con bundler, Worker y assets WASM debe validarse en este repo.
- Si la API no cubre live query/change notifications como necesitamos, habrá que
  envolver o bajar un nivel.

Alternativas:

| Alternativa | Pros | Cons | Lectura |
| --- | --- | --- | --- |
| `@effect/sql-sqlite-wasm` | Mejor fit con Effect; menos glue; Layer-friendly | Riesgo de madurez/integración; menos control bajo nivel | **Primer spike recomendado** |
| `@sqlite.org/sqlite-wasm` directo | Oficial SQLite; documentación amplia; patrón Worker/OPFS claro | API más baja; hay que crear wrapper Effect, migrator y lifecycle | Fallback si Effect wrapper limita |
| `wa-sqlite` / `@effect/wa-sqlite` directo | Mucho control de VFS OPFS/IndexedDB; base usada por Effect | Más bajo nivel; más superficie propia que mantener | Útil si necesitamos VFS específico |
| IndexedDB/Dexie | Muy estable en browser; simple para CRUD | No es relacional SQLite; migraciones/query model distinto; peor fit para SQL local-first | Alternativa si OPFS/WASM bloquea |
| ElectricSQL/RxDB/PowerSync | Soluciones local-first/sync más completas | Más framework/opinión externa; puede chocar con Effect-first y sync propio | Revisar recién para sync remoto |

Decisión V1: usar `@effect/sql-sqlite-wasm` como **primer spike**, no como
compromiso irreversible. El spike debe probar: bundling, Worker, OPFS,
migraciones, queries básicas y cierre de recursos.

### `effect-qb` beta 4

`effect-qb` se instala como spike reversible, no como dependencia arquitectónica
cerrada. La razón: su documentación pública prioriza Postgres/MySQL; necesitamos
validar que el rendering y los tipos sirven para SQLite local antes de basar el
modelo en esa librería.

Instalación propuesta en este monorepo:

1. Agregar al `catalog` de `pnpm-workspace.yaml`:

   ```yaml
   effect-qb: 4.0.0-beta.66
   ```

2. Usarlo desde el package del spike con:

   ```json
   {
     "dependencies": {
       "effect": "catalog:",
       "effect-qb": "catalog:"
     }
   }
   ```

Criterio de aceptación del spike:

- renderiza SQL compatible con SQLite para queries básicas;
- no fuerza tipos/dialecto Postgres/MySQL en el dominio;
- puede convivir con `LocalDb` sin filtrar SQL hacia presentation/application;
- si no encaja, V1 sigue con SQL explícito en infra.

### Migraciones

La DB mantiene una tabla `migrations` como fuente de verdad:

| Campo | Descripción |
| --- | --- |
| `id` | Identificador ordenable de la migración |
| `name` | Nombre humano/reviewable |
| `checksum` | Checksum del contenido aplicado |
| `applied_at` | Timestamp de aplicación |

Reglas:

- las migraciones corren al boot del `LocalDbLive`;
- una migración aplicada no puede cambiar silenciosamente;
- cambios de Effect Schema que alteren persistencia requieren migración manual en
  V1;
- fallar migraciones debe impedir usar una DB en estado ambiguo.

Convención inicial:

- ubicación propuesta: `packages/localfirst-db/src/migrations`;
- naming: `<ordered-id>_<short-name>.sql`, por ejemplo
  `0001_create_notes.sql`;
- cada migración debe ser reviewable como SQL explícito;
- no editar una migración ya aplicada: crear una nueva;
- guardar checksum al aplicar para detectar drift;
- documentar downgrade/rollback como fuera de V1 salvo decisión explícita.

DX V1: incluir un generator Nx para crear migraciones con nombre e id ordenado.
El generator no aplica migraciones ni infiere cambios desde schemas; solo crea el
archivo siguiendo la convención.

### Source of truth del schema

V1 separa dos conceptos:

- **Effect Schema**: contrato tipado del modelo usado por application/domain.
- **Persisted schema**: SQL/migraciones que definen lo guardado en SQLite.

No intentamos autogenerar SQL desde Effect Schema todavía. Primero validamos el
flujo manual y los límites reales.

## Realtime local

### Live queries MVP

Semántica: `invalidate + refetch`.

1. una escritura declara o detecta `tablesTouched`;
2. `LocalDb` publica un change event;
3. las suscripciones interesadas invalidan;
4. la query se re-ejecuta;
5. el consumidor recibe el nuevo snapshot.

El objetivo no es minimizar CPU en V1. El objetivo es tener una semántica clara,
verificable y fácil de reemplazar después.

### Cross-tab

- Cada tab publica invalidaciones por `BroadcastChannel`.
- Cada tab recibe invalidaciones externas y las re-emite dentro de su proceso.
- Se acepta consistencia eventual local entre tabs.
- El evento debe incluir metadata suficiente para evitar loops obvios, por
  ejemplo `originTabId`.

## Testing y verificación

| Nivel | Qué valida | Adapter |
| --- | --- | --- |
| Unit | application/domain y repositorios contra puerto | InMemory |
| Integration | migraciones + SQL real + adapter SQLite | SQLite/OPFS cuando aporte valor |
| Browser/manual | live query + cross-tab | Web app real |

Criterios mínimos:

- los tests unitarios no necesitan OPFS;
- migraciones son testeables sin UI;
- Notes CRUD prueba el wiring real;
- cross-tab se puede validar con una prueba manual documentada si automatizarlo
  queda fuera de V1.

## Criterios de aceptación V1

- [ ] Se puede levantar la app y ejecutar Notes CRUD offline.
- [ ] Notes CRUD usa `packages/notes` y no escribe directo a SQLite desde la app.
- [ ] `LocalDbLive` ejecuta migraciones al boot.
- [ ] La tabla `migrations` registra migraciones aplicadas.
- [ ] Cambios en Notes invalidan/refetchean live queries en el mismo tab.
- [ ] Cambios en una tab invalidan/refetchean otra tab vía `BroadcastChannel`.
- [ ] Tests unitarios corren contra adapter in-memory.
- [ ] Domain/application no importan SQLite, OPFS, Worker ni Cloudflare.
- [ ] Presentation usa Effect Atom para consultar/mutar estado del subdominio.
- [ ] `apps/web` solo monta providers/routes/runtime; no contiene lógica de Notes.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| OPFS/Worker introduce fricción de bundling | Spike técnico antes de implementar todo el package |
| `@effect/sql-sqlite-wasm` no cubre el caso browser esperado | Evaluar alternativa y registrar decisión antes de acoplar APIs |
| Live queries crecen demasiado para V1 | Mantener `invalidate + refetch`; no implementar diffs |
| Migraciones + Effect Schema se mezclan prematuramente | Mantener persisted schema explícito en V1 |
| Scope creep hacia sync remoto | Mantener outbox/oplog como evolución, no entregable V1 |

## Preguntas abiertas

1. ¿Qué forma exacta tendrá el API de `NotesRepository`?
2. ¿Qué runner de browser/manual test usamos para validar cross-tab?
3. ¿Dónde vive el generator Nx de migraciones: plugin interno del workspace o
   script/generator dentro de `localfirst-db`?

## Preguntas cerradas

| Pregunta | Respuesta |
| --- | --- |
| ¿Primer candidato SQLite? | `@effect/sql-sqlite-wasm` como spike reversible |
| ¿`effect-qb` beta 4? | Instalar vía catalog para spike reversible; fallback SQL explícito |
| ¿UI Notes? | Vive dentro de `packages/notes/presentation` |
| ¿Migraciones? | Sí, documentar convención antes de implementar código |
| ¿Migration DX? | V1 incluye generator Nx para crear archivos de migración |
| ¿Core/shared por capa o por contexto? | V1 arranca con package por bounded context y carpetas internas |
| ¿Crear `core`/`shared` de entrada? | No; crearlos cuando haya primer uso concreto |
| ¿`LocalDb` público? | No; SQL interno en infra detrás de repositories |
| ¿Gestor de estado cliente? | Effect Atom con integración SolidJS |

## Plan sugerido de implementación posterior

1. PRD final y decisiones abiertas cerradas.
2. Spike OPFS Worker + Effect Layer mínimo.
3. Spike Effect Atom + SolidJS para Notes presentation state.
4. Package `localfirst-db` con migraciones e in-memory adapter.
5. Package `notes` con puerto + adapter + presentation atoms/tests.
6. Wiring en `apps/web` + prueba manual cross-tab.
7. Revisión de scope para sync remoto / outbox futuro.

## Evolución futura

- Sync remoto con Cloudflare Durable Objects o arquitectura equivalente.
- Outbox/oplog para preparar sync.
- CRDT por entidad/documento si el subdominio lo justifica.
- Live queries incrementales con patches/diffs.
- Generación o validación asistida de migraciones desde Effect Schema.
