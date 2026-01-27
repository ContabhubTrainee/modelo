import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ShoppingBag, Star, Zap, Package, Tag, ArrowRight, LogOut } from 'lucide-react';

export default function ContratanteProdutos() {
    const router = useRouter();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('userData');
        if (!userData) {
            router.push('/login');
            return;
        }
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== 'contratante') {
            router.push('/');
            return;
        }
        setUser(parsedUser);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        router.push('/login');
    };

    if (!user) return <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Carregando produtos...</div>;

    const products = [
        { name: 'Assistente Jurídico IA', desc: 'Análise automática de contratos e petições.', price: 'R$ 299/mês', icon: <Package size={24} /> },
        { name: 'Bot de Atendimento', desc: 'Omnichannel com IA generativa para suporte.', price: 'R$ 150/mês', icon: <Zap size={24} /> },
        { name: 'Dashboard Contábil', desc: 'Visualização de dados financeiros em tempo real.', price: 'R$ 450/mês', icon: <Tag size={24} /> }
    ];

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', color: '#1e293b' }}>
            <Head>
                <title>Meus Produtos | AURA 8</title>
            </Head>

            {/* Navbar */}
            <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 40px', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#6366f1' }}>AURA 8 For Contractors</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>Olá, {user.full_name}</div>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{user.full_name[0]}</div>
                    <button
                        onClick={handleLogout}
                        style={{ background: 'none', border: '1px solid #ef4444', color: '#ef4444', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <LogOut size={16} /> Sair
                    </button>
                </div>
            </nav>

            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px' }}>
                <header style={{ marginBottom: '48px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>Produtos Disponíveis</h1>
                    <p style={{ color: '#64748b' }}>Explore as soluções disponíveis para o seu escritório contratado.</p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '32px' }}>
                    {products.map((p, i) => (
                        <div key={i} style={{ background: '#fff', borderRadius: '20px', padding: '32px', border: '1px solid #e2e8f0', transition: 'all 0.3s ease', cursor: 'pointer' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                                {p.icon}
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>{p.name}</h3>
                            <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>{p.desc}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
                                <div style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>{p.price}</div>
                                <button style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    Contratar <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
