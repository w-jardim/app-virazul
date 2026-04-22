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
        <p className="mt-3 text-sm text-slate-500">Última atualização: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
      </div>

      <Section title="1. Aceitação dos termos">
        <p>Ao criar uma conta ou utilizar o ViraAzul, você concorda com estes Termos de Uso. Se não concordar com qualquer parte, não utilize a plataforma.</p>
        <p>O ViraAzul é operado pela <strong>Plagard Systems</strong>. Dúvidas podem ser enviadas para <a href="mailto:contato@virazul.com" className="text-blue-600 hover:underline">contato@virazul.com</a>.</p>
      </Section>

      <Section title="2. Descrição do serviço">
        <p>O ViraAzul é uma plataforma SaaS de gestão operacional e financeira destinada a profissionais de segurança pública (policiais militares, civis, bombeiros militares, guardas municipais e agentes penitenciários). A plataforma oferece recursos de:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>Registro e acompanhamento de operações e serviços extras.</li>
          <li>Gestão de escala ordinária.</li>
          <li>Controle financeiro de receitas e metas.</li>
          <li>Emissão de relatórios e alertas operacionais.</li>
        </ul>
      </Section>

      <Section title="3. Elegibilidade">
        <p>Para usar o ViraAzul você deve:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>Ter 18 anos ou mais.</li>
          <li>Fornecer informações verdadeiras e precisas no cadastro.</li>
          <li>Manter as credenciais de acesso em sigilo.</li>
        </ul>
        <p>O ViraAzul se reserva o direito de suspender ou encerrar contas que violem estes termos.</p>
      </Section>

      <Section title="4. Planos e pagamento">
        <p><strong>Plano Free:</strong> ao criar sua conta, voce inicia no plano Free com acesso essencial sem custo.</p>
        <p><strong>Planos pagos:</strong> voce pode evoluir para Starter (R$ 0,99/mes) ou Pro (R$ 2,99/mes), com cobranca via PIX ou cartao de credito/debito.</p>
        <p><strong>Cancelamento:</strong> você pode cancelar sua assinatura a qualquer momento. O acesso permanece ativo até o fim do período já pago. Não realizamos reembolsos proporcionais de períodos não utilizados.</p>
      </Section>

      <Section title="5. Uso aceitável">
        <p>Você concorda em usar a plataforma apenas para fins legais e de acordo com estes termos. É proibido:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>Inserir dados falsos ou fraudulentos.</li>
          <li>Tentar acessar contas de outros usuários.</li>
          <li>Realizar engenharia reversa, decompilar ou modificar qualquer parte da plataforma.</li>
          <li>Usar scripts automatizados para acessar ou raspar dados da plataforma.</li>
          <li>Revender ou sublicenciar o acesso à plataforma.</li>
        </ul>
      </Section>

      <Section title="6. Propriedade intelectual">
        <p>Todo o conteúdo da plataforma — código-fonte, design, logotipos, textos e funcionalidades — é propriedade da Plagard Systems e protegido pelas leis de propriedade intelectual aplicáveis.</p>
        <p>Os dados inseridos pelo usuário permanecem de sua propriedade. Concedemos a você uma licença limitada, não exclusiva e intransferível para usar a plataforma enquanto sua conta estiver ativa.</p>
      </Section>

      <Section title="7. Responsabilidades e limitações">
        <p>O ViraAzul é uma ferramenta de suporte à gestão pessoal. Não nos responsabilizamos por:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>Decisões financeiras ou operacionais tomadas com base nos dados da plataforma.</li>
          <li>Perda de dados causada por falhas de conectividade ou dispositivo do usuário.</li>
          <li>Interrupções temporárias do serviço por manutenção programada ou eventos fora do nosso controle.</li>
        </ul>
        <p>Nossa responsabilidade total perante você não excederá o valor pago nos últimos 3 meses de assinatura.</p>
      </Section>

      <Section title="8. Alterações no serviço">
        <p>Podemos modificar, suspender ou encerrar funcionalidades da plataforma a qualquer momento. Em caso de encerramento definitivo do serviço, notificaremos com pelo menos 30 dias de antecedência para que você possa exportar seus dados.</p>
      </Section>

      <Section title="9. Legislação aplicável">
        <p>Estes Termos são regidos pelas leis da República Federativa do Brasil. Eventuais disputas serão resolvidas no foro da comarca de domicílio do usuário, conforme o Código de Defesa do Consumidor.</p>
      </Section>

      <Section title="10. Contato">
        <p>Para dúvidas sobre estes Termos de Uso:</p>
        <p><strong>ViraAzul — Plagard Systems</strong><br />E-mail: <a href="mailto:contato@virazul.com" className="text-blue-600 hover:underline">contato@virazul.com</a></p>
      </Section>
    </div>
  </div>
)

export default Termos


