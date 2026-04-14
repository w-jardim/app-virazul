import React from 'react'
import { useBaseValues, useFinancialRules } from '../hooks/usePricingData'
import type { RankGroup } from '../types/pricing.types'
import { RANK_GROUPS } from '../types/pricing.types'

const RANK_GROUP_LABELS: Record<RankGroup, string> = {
  OFICIAIS_SUPERIORES: 'Oficiais Superiores',
  CAPITAO_TENENTE: 'Capitão / Tenente',
  SUBTENENTE_SARGENTO: 'Subtenente / Sargento',
  CABO_SOLDADO: 'Cabo / Soldado',
}

const PricingTableView: React.FC = () => {
  const baseValuesQuery = useBaseValues()
  const financialRulesQuery = useFinancialRules()

  if (baseValuesQuery.isLoading || financialRulesQuery.isLoading) {
    return <p className="text-sm text-slate-500">Carregando tabela de valores...</p>
  }

  if (baseValuesQuery.isError || financialRulesQuery.isError) {
    return <p className="text-sm text-rose-600">Erro ao carregar tabela de valores.</p>
  }

  const baseValues = baseValuesQuery.data || []
  const financialRules = financialRulesQuery.data || []

  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">Valores Base por Posto/Graduação</h3>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-600">
              <tr>
                <th className="px-3 py-2">Posto/Graduação</th>
                <th className="px-3 py-2 text-right">6h</th>
                <th className="px-3 py-2 text-right">8h</th>
                <th className="px-3 py-2 text-right">12h</th>
                <th className="px-3 py-2 text-right">24h</th>
              </tr>
            </thead>
            <tbody>
              {RANK_GROUPS.map((rg) => (
                <tr key={rg} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-medium">{RANK_GROUP_LABELS[rg]}</td>
                  {[6, 8, 12, 24].map((dh) => {
                    const row = baseValues.find((v) => v.rank_group === rg && v.duration_hours === dh)
                    return (
                      <td key={dh} className="px-3 py-2 text-right tabular-nums">
                        {row ? `R$ ${Number(row.base_amount).toFixed(2)}` : '—'}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">Regras Financeiras por Escopo</h3>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-600">
              <tr>
                <th className="px-3 py-2">Escopo</th>
                <th className="px-3 py-2 text-right">Transporte</th>
                <th className="px-3 py-2 text-right">Alimentação</th>
              </tr>
            </thead>
            <tbody>
              {financialRules.map((rule) => (
                <tr key={rule.id} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-medium">{rule.service_scope}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {rule.allow_transport ? `R$ ${Number(rule.transport_amount).toFixed(2)}` : '—'}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {rule.allow_meal ? `R$ ${Number(rule.meal_amount).toFixed(2)}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default PricingTableView
