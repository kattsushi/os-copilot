import { Column as C, Query as Q, Renderer, Table } from "effect-qb/sqlite"

const notes = Table.make("notes", {
  id: C.int().pipe(C.primaryKey),
  title: C.text(),
  body: C.text().pipe(C.nullable),
})

const listNotes = Q.select({
  id: notes.id,
  title: notes.title,
  body: notes.body,
}).pipe(Q.from(notes), Q.orderBy(notes.id))

const rendered = Renderer.make().render(listNotes)

console.log(JSON.stringify({ sql: rendered.sql, params: rendered.params }, null, 2))
