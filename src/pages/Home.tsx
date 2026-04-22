import React from 'react'
import { Link } from 'react-router-dom'

// â”€â”€â”€ Icons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const IconShield = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
)
const IconCalendar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
)
const IconCurrency = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)
const IconChart = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
)
const IconBell = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  </svg>
)
const IconClipboard = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
  </svg>
)
const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
  </svg>
)
const IconArrowRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
)
const IconPix = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.076 2.172a1.66 1.66 0 011.848 0l7.924 5.463a1.66 1.66 0 010 2.73l-7.924 5.463a1.66 1.66 0 01-1.848 0L3.152 10.365a1.66 1.66 0 010-2.73l7.924-5.463z" opacity=".4"/>
    <path d="M3.152 13.635a1.66 1.66 0 000 2.73l7.924 5.463a1.66 1.66 0 001.848 0l7.924-5.463a1.66 1.66 0 000-2.73L12.924 19.1a1.66 1.66 0 01-1.848 0L3.152 13.635z"/>
  </svg>
)
const IconCard = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
)

// â”€â”€â”€ Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const audiences = [
  { label: 'PolÃ­cia Militar',       abbr: 'PM' },
  { label: 'PolÃ­cia Civil',         abbr: 'PC' },
  { label: 'Bombeiros Militar',     abbr: 'BM' },
  { label: 'Guarda Municipal',      abbr: 'GM' },
  { label: 'Agente PenitenciÃ¡rio',  abbr: 'AP' },
]

const features = [
  { icon: <IconClipboard />, title: 'GestÃ£o de OperaÃ§Ãµes',   desc: 'Registre e acompanhe cada serviÃ§o em tempo real. Controle entradas, saÃ­das e ocorrÃªncias com histÃ³rico completo e auditÃ¡vel.' },
  { icon: <IconCalendar />,  title: 'Escala OrdinÃ¡ria',      desc: 'Monte e visualize a escala de serviÃ§o da equipe de forma simples. Reduza conflitos e garanta cobertura em todos os turnos.' },
  { icon: <IconCurrency />,  title: 'Controle Financeiro',   desc: 'Acompanhe receitas de serviÃ§os extras, plantÃµes e bonificaÃ§Ãµes. Tenha visibilidade total dos seus ganhos em um Ãºnico lugar.' },
  { icon: <IconChart />,     title: 'Planejamento e Metas',  desc: 'Projete metas de horas, serviÃ§os e receita. Planeje o mÃªs com antecedÃªncia e tome decisÃµes baseadas em dados.' },
  { icon: <IconBell />,      title: 'Alertas Inteligentes',  desc: 'Receba notificaÃ§Ãµes sobre vencimentos, escalas prÃ³ximas e limites de jornada. Fique sempre um passo Ã  frente.' },
  { icon: <IconChart />,     title: 'RelatÃ³rios Detalhados', desc: 'Exporte relatÃ³rios mensais de produtividade, financeiro e operaÃ§Ãµes. Dados estruturados para qualquer necessidade.' },
]

const plans = [
  {
    name: 'Free',
    price: 'GrÃ¡tis',
    period: '/sempre',
    badge: null,
    description: 'Plano de entrada sem custo para comecar.',
    features: [
      '1.000 chamadas de API por mes',
      'Com anuncios',
      'Dashboard operacional',
      'Escala e controle financeiro',
      'Sem necessidade de cartao',
    ],
    paymentMethods: null,
    cta: 'Comecar gratis',
    highlight: false,
    ctaLink: '/register',
  },
  {
    name: 'Pro',
    price: 'R$ 2,99',
    period: '/mÃªs',
    badge: 'Mais popular',
    description: 'Para quem quer uso profissional sem anuncios.',
    features: [
      '999.999 chamadas de API por mes',
      'Sem anuncios',
      'Trial de 7 dias',
      'PIX ou cartao',
      'Atualizacoes incluidas',
    ],
    paymentMethods: ['PIX', 'CartÃ£o'],
    cta: 'Assinar agora',
    highlight: true,
    ctaLink: '/register',
  },
]

// â”€â”€â”€ Home â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const Home: React.FC = () => {
  return (
    <>
      {/* â”€â”€ HERO â”€â”€ */}
      <section className="relative overflow-hidden bg-blue-950 pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-blue-700/20 blur-3xl" />
          <div className="absolute bottom-0 -left-20 h-[300px] w-[300px] rounded-full bg-blue-800/30 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        </div>

        <div className="relative mx-auto max-w-4xl px-5 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-700/50 bg-blue-900/60 px-4 py-1.5 text-xs font-medium text-blue-300">
            <IconShield />
            Feito para profissionais de seguranÃ§a pÃºblica
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
            Sua operaÃ§Ã£o,{' '}
            <span className="text-blue-400">organizada</span>{' '}
            e no controle
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-blue-200/80">
            O ViraAzul Ã© a plataforma de gestÃ£o operacional e financeira criada para PM, PC, BM, GM e Agentes PenitenciÃ¡rios que acumulam serviÃ§os extras.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link to="/register" className="flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-400">
              Criar conta gratis
              <IconArrowRight />
            </Link>
            <Link to="/login" className="rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              JÃ¡ tenho conta
            </Link>
          </div>

          <p className="mt-6 text-xs text-blue-400/60">
            Sem cartÃ£o de crÃ©dito &nbsp;Â·&nbsp; ConfiguraÃ§Ã£o em minutos &nbsp;Â·&nbsp; Cancele quando quiser
          </p>
        </div>
      </section>

      {/* â”€â”€ PARA QUEM Ã‰ â”€â”€ */}
      <section id="publico" className="border-b border-slate-100 bg-slate-50 py-14">
        <div className="mx-auto max-w-5xl px-5">
          <p className="mb-8 text-center text-sm font-semibold uppercase tracking-widest text-slate-400">
            Desenvolvido para
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {audiences.map((a) => (
              <div key={a.abbr} className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-900 text-sm font-bold text-white">
                  {a.abbr}
                </div>
                <span className="text-[13px] font-medium text-slate-700">{a.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€ FUNCIONALIDADES â”€â”€ */}
      <section id="funcionalidades" className="py-20">
        <div className="mx-auto max-w-5xl px-5">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Tudo que vocÃª precisa em um sÃ³ lugar</h2>
            <p className="mt-3 text-base text-slate-500">Da escala ao financeiro, do plantÃ£o ao relatÃ³rio â€” controle completo da sua rotina operacional.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  {f.icon}
                </div>
                <h3 className="mb-2 text-[15px] font-semibold text-slate-900">{f.title}</h3>
                <p className="text-[13px] leading-relaxed text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€ DESTAQUE â”€â”€ */}
      <section className="bg-blue-950 py-20">
        <div className="mx-auto max-w-5xl px-5">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white">
                Chega de planilha.<br />Sua escala merece mais.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-blue-200/70">
                Policiais e agentes perdem horas toda semana tentando organizar serviÃ§os em planilhas e WhatsApp. O ViraAzul centraliza tudo e te dÃ¡ visÃ£o clara do que importa.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Dashboard com resumo do dia e do mÃªs',
                  'Controle de horas e jornada mÃ¡xima',
                  'HistÃ³rico de todos os serviÃ§os registrados',
                  'ProjeÃ§Ã£o financeira para o prÃ³ximo mÃªs',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-blue-100">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-white">
                      <IconCheck />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-400">
                Experimentar grÃ¡tis <IconArrowRight />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '100%', label: 'Focado em seg. pÃºblica' },
                { value: '0 papel', label: 'Tudo digital e organizado' },
                { value: '24/7', label: 'Acesso de qualquer dispositivo' },
                { value: '< 5min', label: 'Para registrar um serviÃ§o' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-5">
                  <p className="text-2xl font-bold text-blue-400">{s.value}</p>
                  <p className="mt-1 text-xs text-blue-200/60">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* â”€â”€ PLANOS â”€â”€ */}
      <section id="planos" className="bg-slate-50 py-20">
        <div className="mx-auto max-w-4xl px-5">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Planos simples e transparentes</h2>
            <p className="mt-3 text-base text-slate-500">Escolha entre Free, Starter, Pro e Partner.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 max-w-2xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={[
                  'relative flex flex-col rounded-2xl p-7',
                  plan.highlight
                    ? 'bg-blue-950 text-white shadow-xl ring-2 ring-blue-500'
                    : 'border border-slate-200 bg-white shadow-sm',
                ].join(' ')}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white">
                    {plan.badge}
                  </span>
                )}

                <div>
                  <p className={['text-sm font-semibold', plan.highlight ? 'text-blue-300' : 'text-slate-500'].join(' ')}>
                    {plan.name}
                  </p>
                  <div className="mt-2 flex items-end gap-1">
                    <span className={['text-4xl font-bold', plan.highlight ? 'text-white' : 'text-slate-900'].join(' ')}>
                      {plan.price}
                    </span>
                    <span className={['mb-1 text-sm', plan.highlight ? 'text-blue-300' : 'text-slate-400'].join(' ')}>
                      {plan.period}
                    </span>
                  </div>
                  <p className={['mt-1 text-[13px]', plan.highlight ? 'text-blue-200/70' : 'text-slate-500'].join(' ')}>
                    {plan.description}
                  </p>
                </div>

                {/* MÃ©todos de pagamento */}
                {plan.paymentMethods && (
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-blue-300">
                      <IconPix /> PIX
                    </div>
                    <div className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-blue-300">
                      <IconCard /> CartÃ£o
                    </div>
                  </div>
                )}

                <ul className="mt-5 flex-1 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[13px]">
                      <span className={['mt-0.5 flex-shrink-0', plan.highlight ? 'text-blue-400' : 'text-blue-600'].join(' ')}>
                        <IconCheck />
                      </span>
                      <span className={plan.highlight ? 'text-blue-100' : 'text-slate-600'}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={plan.ctaLink}
                  className={[
                    'mt-8 block rounded-lg py-3 text-center text-sm font-semibold transition',
                    plan.highlight
                      ? 'bg-blue-500 text-white hover:bg-blue-400'
                      : 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50',
                  ].join(' ')}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€ CTA FINAL â”€â”€ */}
      <section className="bg-blue-950 py-20">
        <div className="mx-auto max-w-2xl px-5 text-center">
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400">
            <IconShield />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Comece a organizar sua carreira hoje
          </h2>
          <p className="mt-4 text-base text-blue-200/70">
            Comece no Free e evolua para Starter ou Pro quando precisar.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link to="/register" className="flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-400">
              Criar conta gratis <IconArrowRight />
            </Link>
            <Link to="/login" className="rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              JÃ¡ tenho conta
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home

