import React, { useState } from 'react'

const IconMail = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
)
const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

type FormState = 'idle' | 'sending' | 'success' | 'error'

const Contato: React.FC = () => {
  const [formState, setFormState] = useState<FormState>('idle')
  const [values, setValues] = useState({ name: '', email: '', subject: '', message: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState('sending')
    // Simula envio — conectar ao backend quando disponível
    await new Promise((r) => setTimeout(r, 1200))
    setFormState('success')
  }

  return (
    <div className="pt-24 pb-20">
      <div className="mx-auto max-w-5xl px-5">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-600">Fale conosco</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Entre em contato</h1>
          <p className="mt-3 text-base text-slate-500">Tem alguma dúvida, sugestão ou precisa de suporte? Estamos aqui para ajudar.</p>
        </div>

        <div className="grid gap-10 lg:grid-cols-5">
          {/* Info lateral */}
          <div className="space-y-6 lg:col-span-2">
            {/* Card e-mail */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <IconMail />
              </div>
              <h3 className="mb-1 text-[15px] font-semibold text-slate-900">E-mail</h3>
              <p className="mb-3 text-[13px] text-slate-500">Respondemos em até 48 horas úteis.</p>
              <a
                href="mailto:contato@virazul.com"
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                contato@virazul.com
              </a>
            </div>

            {/* Assuntos comuns */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-3 text-[15px] font-semibold text-slate-900">Assuntos comuns</h3>
              <ul className="space-y-2">
                {[
                  'Dúvidas sobre assinatura',
                  'Suporte técnico',
                  'Cancelamento',
                  'Sugestão de funcionalidade',
                  'Parceria ou imprensa',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[13px] text-slate-500">
                    <span className="h-1 w-1 flex-shrink-0 rounded-full bg-blue-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Plagard */}
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <p className="text-[13px] text-blue-800/70 leading-relaxed">
                O ViraAzul é desenvolvido e mantido pela <strong className="text-blue-900">Plagard Systems</strong>. Estamos comprometidos em oferecer o melhor suporte aos profissionais de segurança pública.
              </p>
            </div>
          </div>

          {/* Formulário */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              {formState === 'success' ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 text-blue-500">
                    <IconCheck />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">Mensagem enviada!</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Recebemos sua mensagem e retornaremos em breve pelo e-mail informado.
                  </p>
                  <button
                    type="button"
                    onClick={() => { setFormState('idle'); setValues({ name: '', email: '', subject: '', message: '' }) }}
                    className="mt-6 rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                  >
                    Enviar outra mensagem
                  </button>
                </div>
              ) : (
                <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Nome</label>
                      <input
                        name="name"
                        required
                        value={values.name}
                        onChange={handleChange}
                        placeholder="Seu nome completo"
                        className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">E-mail</label>
                      <input
                        name="email"
                        type="email"
                        required
                        value={values.email}
                        onChange={handleChange}
                        placeholder="seu@email.com"
                        className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Assunto</label>
                    <select
                      name="subject"
                      required
                      value={values.subject}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">Selecione um assunto...</option>
                      <option value="assinatura">Dúvidas sobre assinatura</option>
                      <option value="suporte">Suporte técnico</option>
                      <option value="cancelamento">Cancelamento</option>
                      <option value="sugestao">Sugestão de funcionalidade</option>
                      <option value="parceria">Parceria ou imprensa</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Mensagem</label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      value={values.message}
                      onChange={handleChange}
                      placeholder="Descreva sua dúvida ou mensagem com detalhes..."
                      className="w-full resize-none rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {formState === 'error' && (
                    <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                      Ocorreu um erro ao enviar sua mensagem. Tente novamente ou envie diretamente para contato@virazul.com.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={formState === 'sending'}
                    className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60"
                  >
                    {formState === 'sending' ? 'Enviando...' : 'Enviar mensagem'}
                  </button>

                  <p className="text-center text-[12px] text-slate-400">
                    Ou envie diretamente para{' '}
                    <a href="mailto:contato@virazul.com" className="text-blue-500 hover:underline">
                      contato@virazul.com
                    </a>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contato
