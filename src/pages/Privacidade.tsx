import React from 'react'

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-8">
    <h2 className="mb-3 text-lg font-semibold text-slate-900">{title}</h2>
    <div className="space-y-3 text-[15px] leading-relaxed text-slate-600">{children}</div>
  </div>
)

const Privacidade: React.FC = () => (
  <div className="pt-24 pb-20">
    <div className="mx-auto max-w-3xl px-5">
      {/* Header */}
      <div className="mb-10 border-b border-slate-200 pb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-600">Legal</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Política de Privacidade</h1>
        <p className="mt-3 text-sm text-slate-500">Última atualização: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
      </div>

      <Section title="1. Quem somos">
        <p>O ViraAzul é uma plataforma de gestão operacional e financeira desenvolvida pela <strong>Plagard Systems</strong>, destinada a profissionais de segurança pública. Nossa missão é ajudar policiais militares, civis, bombeiros, guardas municipais e agentes penitenciários a organizar sua rotina de serviços.</p>
        <p>Em caso de dúvidas sobre esta política, entre em contato pelo e-mail <a href="mailto:contato@virazul.com" className="text-blue-600 hover:underline">contato@virazul.com</a>.</p>
      </Section>

      <Section title="2. Dados que coletamos">
        <p>Coletamos apenas os dados necessários para o funcionamento da plataforma:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li><strong>Dados de cadastro:</strong> nome completo, e-mail, posto/graduação.</li>
          <li><strong>Dados operacionais:</strong> registros de serviços, escalas, lançamentos financeiros e metas inseridos pelo próprio usuário.</li>
          <li><strong>Dados de acesso:</strong> endereço IP, tipo de navegador, data e hora de acesso (logs de sistema).</li>
          <li><strong>Dados de pagamento:</strong> processados exclusivamente pelos nossos parceiros de pagamento (PIX e cartão). Não armazenamos dados bancários ou de cartão em nossos servidores.</li>
        </ul>
      </Section>

      <Section title="3. Como usamos seus dados">
        <p>Utilizamos suas informações exclusivamente para:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>Fornecer, manter e melhorar os serviços da plataforma.</li>
          <li>Autenticar o acesso à sua conta.</li>
          <li>Enviar comunicações relacionadas à sua assinatura (confirmações, avisos de vencimento).</li>
          <li>Cumprir obrigações legais e regulatórias.</li>
        </ul>
        <p>Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para fins comerciais.</p>
      </Section>

      <Section title="4. Compartilhamento de dados">
        <p>Seus dados podem ser compartilhados apenas nas seguintes situações:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li><strong>Provedores de serviço:</strong> parceiros que nos auxiliam na operação da plataforma (hospedagem, processamento de pagamentos), sob contratos de confidencialidade.</li>
          <li><strong>Obrigação legal:</strong> quando exigido por autoridades competentes mediante ordem judicial.</li>
        </ul>
      </Section>

      <Section title="5. Retenção de dados">
        <p>Mantemos seus dados enquanto sua conta estiver ativa. Após o encerramento, os dados são retidos por até 90 dias para fins de backup e, em seguida, excluídos permanentemente de nossos servidores.</p>
      </Section>

      <Section title="6. Seus direitos">
        <p>Nos termos da Lei Geral de Proteção de Dados (LGPD — Lei n.º 13.709/2018), você tem direito a:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>Confirmar a existência de tratamento dos seus dados.</li>
          <li>Acessar, corrigir ou atualizar suas informações.</li>
          <li>Solicitar a exclusão dos seus dados pessoais.</li>
          <li>Revogar o consentimento a qualquer momento.</li>
          <li>Solicitar portabilidade dos seus dados.</li>
        </ul>
        <p>Para exercer qualquer um desses direitos, entre em contato por <a href="mailto:contato@virazul.com" className="text-blue-600 hover:underline">contato@virazul.com</a>.</p>
      </Section>

      <Section title="7. Segurança">
        <p>Adotamos medidas técnicas e organizacionais para proteger seus dados contra acesso não autorizado, perda ou divulgação indevida. Isso inclui criptografia em trânsito (HTTPS/TLS) e em repouso, controle de acesso por função e monitoramento contínuo.</p>
      </Section>

      <Section title="8. Cookies">
        <p>Utilizamos cookies estritamente necessários para autenticação e funcionamento da plataforma. Não utilizamos cookies de rastreamento ou publicidade.</p>
      </Section>

      <Section title="9. Alterações nesta política">
        <p>Podemos atualizar esta Política de Privacidade periodicamente. Quando isso ocorrer, notificaremos você por e-mail e/ou por aviso na plataforma. O uso continuado após as alterações implica aceitação da nova política.</p>
      </Section>

      <Section title="10. Contato">
        <p>Dúvidas, solicitações ou reclamações relacionadas à privacidade devem ser enviadas para:</p>
        <p><strong>ViraAzul — Plagard Systems</strong><br />E-mail: <a href="mailto:contato@virazul.com" className="text-blue-600 hover:underline">contato@virazul.com</a></p>
      </Section>
    </div>
  </div>
)

export default Privacidade
