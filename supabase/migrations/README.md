# Migrations

`0001_core_schema` and `0002_availability_and_rls` are already applied to the Supabase project
`ktyomfgowtdjoxysvays`. To materialise the SQL files here:

```bash
npx supabase login
npx supabase link --project-ref ktyomfgowtdjoxysvays
npx supabase db pull
```

From then on, write new migrations locally (`npx supabase migration new <name>`) and push them
with `npx supabase db push`, so schema changes live in git alongside the code.
