import React from 'react'

type PlaceholderPageProps = {
  title: string
  description: string
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, description }) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </section>
  )
}

export default PlaceholderPage

