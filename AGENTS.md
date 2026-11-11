<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep suspension isolated in `SuspensionScreen` and controlled only by `SITE_SUSPENDED` in `src/lib/suspension.ts`; the root document shell swaps its children so original pages, widgets, and route-error UI never mount during suspension and return unchanged when disabled.
- Suspension is a presentation gate, not an authorization mechanism; preserve backend access checks and do not treat hidden routes as secured endpoints.
