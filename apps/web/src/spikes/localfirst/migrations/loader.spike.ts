export type LoadedMigration = {
  readonly path: string
  readonly sql: string
}

export const loadMigrations = (): ReadonlyArray<LoadedMigration> => {
  const modules = import.meta.glob("./sql/*.sql", {
    as: "raw",
    eager: true,
  }) as Record<string, string>

  return Object.entries(modules)
    .map(([path, sql]) => ({ path, sql }))
    .sort((a, b) => a.path.localeCompare(b.path))
}
