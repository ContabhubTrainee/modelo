import { useRouter } from 'next/router';
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Shield, Lock, CreditCard, ArrowLeft, CheckCircle, Zap } from 'lucide-react';
import styles from '../styles/Checkout.module.css';

export default function Checkout() {
    const router = useRouter();
    const { plan } = router.query;
    const [isModalOpen, setIsModalOpen] = useState(false);

    const plans = {
        'Business': {
            price: 'R$ 497',
            features: [
                'Até 3 assistentes ativos',
                'Atendimento 24/7',
                'Integração WhatsApp',
                'Suporte via e-mail'
            ]
        },
        'Pro': {
            price: 'R$ 997',
            features: [
                'Assistentes ilimitados',
                'IA Generativa Avançada',
                'Dashboards em tempo real',
                'Suporte prioritário 24/7',
                'Treinamento de equipe'
            ]
        }
    };

    const currentPlan = plans[plan] || plans['Business'];

    const handlePayment = (e) => {
        e.preventDefault();
        setIsModalOpen(true);
    };

    return (
        <div className={styles.container}>
            <Head>
                <title>Checkout | Adquira o AURA 8</title>
            </Head>

            <main className={styles.content}>
                <Link href="/vendas" className={styles.backLink}>
                    <ArrowLeft size={18} /> Alterar plano
                </Link>

                {/* Resumo do Pedido */}
                <div className={styles.summary}>
                    <h2 className={styles.summaryTitle}>Resumo do Pedido</h2>
                    <div className={styles.planName}>Plano {plan || 'Business'}</div>
                    <div className={styles.planPrice}>{currentPlan.price}<span style={{ fontSize: '14px', color: '#6b7280' }}>/mês</span></div>

                    <ul className={styles.features}>
                        {currentPlan.features.map((feature, index) => (
                            <li key={index} className={styles.featureItem}>
                                <CheckCircle size={16} className={styles.checkIcon} style={{ color: '#10b981' }} />
                                {feature}
                            </li>
                        ))}
                    </ul>

                    <div style={{ padding: '20px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '12px', fontSize: '14px', color: '#4b5563' }}>
                        <Shield size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                        Garantia de satisfação de 7 dias ou seu dinheiro de volta.
                    </div>
                </div>

                {/* Formulário de Pagamento Mockup */}
                <div className={styles.paymentForm}>
                    <h2 className={styles.formTitle}>Informações de Pagamento</h2>
                    <form onSubmit={handlePayment}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>E-mail para acesso</label>
                            <input type="email" placeholder="seu@email.com" className={styles.input} required />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Número do Cartão</label>
                            <div style={{ position: 'relative' }}>
                                <CreditCard size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                <input type="text" placeholder="0000 0000 0000 0000" className={styles.input} style={{ paddingLeft: '48px' }} required />
                            </div>
                        </div>

                        <div className={styles.row}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Validade</label>
                                <input type="text" placeholder="MM/AA" className={styles.input} required />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>CVV</label>
                                <input type="text" placeholder="000" className={styles.input} required />
                            </div>
                        </div>

                        <button type="submit" className={styles.payButton}>
                            Concluir Assinatura
                        </button>

                        <div className={styles.securityNote}>
                            <Lock size={12} />
                            Pagamento processado com segurança criptografada
                        </div>
                    </form>
                </div>
            </main>

            {/* Success/Demo Modal */}
            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalIcon}>
                            <Zap size={32} />
                        </div>
                        <h2 className={styles.modalTitle}>Ambiente de Demonstração</h2>
                        <p className={styles.modalText}>
                            Este é um ambiente de testes do <strong>AURA 8</strong>. <br />
                            Em produção, você seria redirecionado agora para o checkout seguro e conclusão da assinatura do plano <strong>{plan || 'Business'}</strong>.
                        </p>
                        <button className={styles.modalButton} onClick={() => setIsModalOpen(false)}>
                            Entendido
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
