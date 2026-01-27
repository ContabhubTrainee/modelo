import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Check, ArrowLeft, Shield, Zap, Users, Star } from 'lucide-react';
import styles from '../styles/Sales.module.css';

export default function Sales() {
    const router = useRouter();

    const handlePlanSelect = (plan) => {
        router.push(`/checkout?plan=${plan}`);
    };

    const handleConsultantClick = () => {
        // Redireciona para o WhatsApp ou seção de contato
        window.open('https://wa.me/5511999999999', '_blank');
    };

    return (
        <div className={styles.container}>
            <Head>
                <title>Adquira o AURA 8 | Planos e Preços</title>
            </Head>

            <main className={styles.content}>
                <Link href="/" className={styles.backLink}>
                    <ArrowLeft size={20} /> Voltar para o início
                </Link>

                <h1 className={styles.title}>Pronto para mudar o patamar do seu negócio?</h1>
                <p className={styles.subtitle}>
                    Escolha o plano ideal para a sua operação e comece a automatizar processes repetitivos hoje mesmo com a inteligência do AURA 8.
                </p>

                <div className={styles.pricingGrid}>
                    {/* Plano Business */}
                    <div className={styles.planCard}>
                        <h2 className={styles.planName}>Business</h2>
                        <div className={styles.price}>R$ 497<span>/mês</span></div>
                        <p className={styles.planDescription}>Ideal para pequenos escritórios iniciando na automação.</p>

                        <ul className={styles.features}>
                            <li className={styles.featureItem}><Check size={18} className={styles.checkIcon} /> Até 3 assistentes ativos</li>
                            <li className={styles.featureItem}><Check size={18} className={styles.checkIcon} /> Atendimento 24/7</li>
                            <li className={styles.featureItem}><Check size={18} className={styles.checkIcon} /> Integração com WhatsApp</li>
                            <li className={styles.featureItem}><Check size={18} className={styles.checkIcon} /> Suporte via e-mail</li>
                        </ul>

                        <button
                            className={`${styles.buyButton} ${styles.secondary}`}
                            onClick={() => handlePlanSelect('Business')}
                        >
                            Começar agora
                        </button>
                    </div>

                    {/* Plano Enterprise (Destaque) */}
                    <div className={`${styles.planCard} ${styles.featured}`}>
                        <div className={styles.badge}>MAIS POPULAR</div>
                        <h2 className={styles.planName}>Pro</h2>
                        <div className={styles.price}>R$ 997<span>/mês</span></div>
                        <p className={styles.planDescription}>A solução completa para escritórios com alta demanda.</p>

                        <ul className={styles.features}>
                            <li className={styles.featureItem}><Check size={18} className={styles.checkIcon} /> Assistentes ilimitados</li>
                            <li className={styles.featureItem}><Check size={18} className={styles.checkIcon} /> IA Generativa Avançada</li>
                            <li className={styles.featureItem}><Check size={18} className={styles.checkIcon} /> Dashboards em tempo real</li>
                            <li className={styles.featureItem}><Check size={18} className={styles.checkIcon} /> Suporte prioritário 24/7</li>
                            <li className={styles.featureItem}><Check size={18} className={styles.checkIcon} /> Treinamento de equipe</li>
                        </ul>

                        <button
                            className={`${styles.buyButton} ${styles.primary}`}
                            onClick={() => handlePlanSelect('Pro')}
                        >
                            Adquirir Agora
                        </button>
                    </div>

                    {/* Plano Custom */}
                    <div className={styles.planCard}>
                        <h2 className={styles.planName}>Custom</h2>
                        <div className={styles.price}>Sob consulta</div>
                        <p className={styles.planDescription}>Soluções personalizadas para grandes operações corporativas.</p>

                        <ul className={styles.features}>
                            <li className={styles.featureItem}><Check size={18} className={styles.checkIcon} /> Infraestrutura dedicada</li>
                            <li className={styles.featureItem}><Check size={18} className={styles.checkIcon} /> White-label completo</li>
                            <li className={styles.featureItem}><Check size={18} className={styles.checkIcon} /> API de integração sob medida</li>
                            <li className={styles.featureItem}><Check size={18} className={styles.checkIcon} /> Gerente de conta exclusivo</li>
                        </ul>

                        <button
                            className={`${styles.buyButton} ${styles.secondary}`}
                            onClick={handleConsultantClick}
                        >
                            Falar com consultor
                        </button>
                    </div>
                </div>

                <section className={styles.contactSection}>
                    <h2 className={styles.sectionTitle}>Ainda tem dúvidas?</h2>
                    <p className={styles.sectionDescription}>
                        Nossa equipe de especialistas está pronta para ajudar você a escolher a melhor configuração para sua realidade.
                    </p>
                    <div style={{ marginTop: '32px' }}>
                        <Link href="/#contato" className={styles.primaryButton} style={{ padding: '16px 32px', borderRadius: '12px', textDecoration: 'none', background: '#8B5CF6', color: 'white', fontWeight: '600' }}>
                            Falar com Suporte
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
}
