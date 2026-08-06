const modules = ["Users", "Projects", "Roles", "Audit Logs"];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <section className="mx-auto max-w-5xl space-y-6">
        <p className="text-sm uppercase tracking-widest text-cyan-300">Phase 1 Foundation</p>
        <h1 className="text-4xl font-bold">Creo AI Engineering Copilot</h1>
        <p className="text-slate-300">
          Enterprise control plane for users, projects, role management, and auditability before
          Creo, PLM, SAP, RAG, and agent modules are connected.
        </p>
        <div className="grid gap-4 md:grid-cols-4">
          {modules.map((module) => (
            <article className="rounded-xl border border-slate-700 bg-slate-900 p-4" key={module}>
              <h2 className="font-semibold">{module}</h2>
              <p className="mt-2 text-sm text-slate-400">Independently testable foundation module.</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
