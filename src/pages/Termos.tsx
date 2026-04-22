import React from 'react'

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-8">
    <h2 className="mb-3 text-lg font-semibold text-slate-900">{title}</h2>
    <div className="space-y-3 text-[15px] leading-relaxed text-slate-600">{children}</div>
  </div>
)

const Termos: React.FC = () => (
  <div className="pt-24 pb-20">
    <div className="mx-auto max-w-3xl px-5">
      {/* Header */}
      <div className="mb-10 border-b border-slate-200 pb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-600">Legal</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Termos de Uso</h1>
        <p className="mt-3 text-sm text-slate-500">Ãšltima atualizaÃ§Ã£o: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
      </div>

      <Section title="1. AceitaÃ§Ã£o dos termos">
        <p>Ao criar uma conta ou utilizar o ViraAzul, vocÃª concorda com estes Termos de Uso. Se nÃ£o concordar com qualquer parte, nÃ£o utilize a plataforma.</p>
        <p>O ViraAzul Ã© operado pela <strong>Plagard Systems</strong>. DÃºvidas podem ser enviadas para <a href="mailto:contato@virazul.com" className="text-blue-600 hover:underline">contato@virazul.com</a>.</p>
      </Section>

      <Section title="2. DescriÃ§Ã£o do serviÃ§o">
        <p>O ViraAzul Ã© uma plataforma SaaS de gestÃ£o operacional e financeira destinada a profissionais de seguranÃ§a pÃºblica (policiais militares, civis, bombeiros militares, guardas municipais e agentes penitenciÃ¡rios). A plataforma oferece recursos de:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>Registro e acompanhamento de operaÃ§Ãµes e serviÃ§os extras.</li>
          <li>GestÃ£o de escala ordinÃ¡ria.</li>
          <li>Controle financeiro de receitas e metas.</li>
          <li>EmissÃ£o de relatÃ³rios e alertas operacionais.</li>
        </ul>
      </Section>

      <Section title="3. Elegibilidade">
        <p>Para usar o ViraAzul vocÃª deve:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>Ter 18 anos ou mais.</li>
          <li>Fornecer informaÃ§Ãµes verdadeiras e precisas no cadastro.</li>
          <li>Manter as credenciais de acesso em sigilo.</li>
        </ul>
        <p>O ViraAzul se reserva o direito de suspender ou encerrar contas que violem estes termos.</p>
      </Section>

      <Section title="4. Planos e pagamento">
        <p><strong>Plano Free:</strong> ao criar sua conta, voce inicia no plano Free com acesso essencial sem custo.</p>
        <p><strong>Planos pagos:</strong> voce pode evoluir para Starter (R$ 0,99/mes) ou Pro (R$ 2,99/mes), com cobranca via PIX ou cartao de credito/debito.</p>
        <p><strong>Cancelamento:</strong> vocÃª pode cancelar sua assinatura a qualquer momento. O acesso permanece ativo atÃ© o fim do perÃ­odo jÃ¡ pago. NÃ£o realizamos reembolsos proporcionais de perÃ­odos nÃ£o utilizados.</p>
      </Section>

      <Section title="5. Uso aceitÃ¡vel">
        <p>VocÃª concorda em usar a plataforma apenas para fins legais e de acordo com estes termos. Ã‰ proibido:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>Inserir dados falsos ou fraudulentos.</li>
          <li>Tentar acessar contas de outros usuÃ¡rios.</li>
          <li>Realizar engenharia reversa, decompilar ou modificar qualquer parte da plataforma.</li>
          <li>Usar scripts automatizados para acessar ou raspar dados da plataforma.</li>
          <li>Revender ou sublicenciar o acesso Ã  plataforma.</li>
        </ul>
      </Section>

      <Section title="6. Propriedade intelectual">
        <p>Todo o conteÃºdo da plataforma â€” cÃ³digo-fonte, design, logotipos, textos e funcionalidades â€” Ã© propriedade da Plagard Systems e protegido pelas leis de propriedade intelectual aplicÃ¡veis.</p>
        <p>Os dados inseridos pelo usuÃ¡rio permanecem de sua propriedade. Concedemos a vocÃª uma licenÃ§a limitada, nÃ£o exclusiva e intransferÃ­vel para usar a plataforma enquanto sua conta estiver ativa.</p>
      </Section>

      <Section title="7. Responsabilidades e limitaÃ§Ãµes">
        <p>O ViraAzul Ã© uma ferramenta de suporte Ã  gestÃ£o pessoal. NÃ£o nos responsabilizamos por:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>DecisÃµes financeiras ou operacionais tomadas com base nos dados da plataforma.</li>
          <li>Perda de dados causada por falhas de conectividade ou dispositivo do usuÃ¡rio.</li>
          <li>InterrupÃ§Ãµes temporÃ¡rias do serviÃ§o por manutenÃ§Ã£o programada ou eventos fora do nosso controle.</li>
        </ul>
        <p>Nossa responsabilidade total perante vocÃª nÃ£o excederÃ¡ o valor pago nos Ãºltimos 3 meses de assinatura.</p>
      </Section>

      <Section title="8. AlteraÃ§Ãµes no serviÃ§o">
        <p>Podemos modificar, suspender ou encerrar funcionalidades da plataforma a qualquer momento. Em caso de encerramento definitivo do serviÃ§o, notificaremos com pelo menos 30 dias de antecedÃªncia para que vocÃª possa exportar seus dados.</p>
      </Section>

      <Section title="9. LegislaÃ§Ã£o aplicÃ¡vel">
        <p>Estes Termos sÃ£o regidos pelas leis da RepÃºblica Federativa do Brasil. Eventuais disputas serÃ£o resolvidas no foro da comarca de domicÃ­lio do usuÃ¡rio, conforme o CÃ³digo de Defesa do Consumidor.</p>
      </Section>

      <Section title="10. Contato">
        <p>Para dÃºvidas sobre estes Termos de Uso:</p>
        <p><strong>ViraAzul â€” Plagard Systems</strong><br />E-mail: <a href="mailto:contato@virazul.com" className="text-blue-600 hover:underline">contato@virazul.com</a></p>
      </Section>
    </div>
  </div>
)

export default Termos

