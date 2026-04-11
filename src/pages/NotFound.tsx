import React from 'react'

const NotFound: React.FC = () => (
  <div className="min-h-screen bg-slate-100 px-4 py-16">
    <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-900">Página não encontrada</h2>
      <p className="mt-2 text-sm text-slate-600">Verifique a URL ou retorne para o dashboard.</p>
    </div>
  </div>
)

export default NotFound
