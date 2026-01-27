import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { LayoutDashboard, Users, Settings, PieChart, Bell, Search, LogOut } from 'lucide-react';

export default function AdminDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('userData');
        if (!userData) {
            router.push('/login');
            return;
        }
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== 'admin') {
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

    if (!user) return <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Carregando painel admin...</div>;

    return (
        <div style={{ background: '#0f172a', minHeight: '100vh', color: '#fff', display: 'flex' }}>
            <Head>
                <title>Painel Admin | AURA 8</title>
            </Head>

            {/* Sidebar */}
            <aside style={{ width: '260px', borderRight: '1px solid rgba(255,255,255,0.1)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px', color: '#6366f1' }}>AURA 8 Admin</div>
                <button style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: 'none', padding: '12px', borderRadius: '8px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <LayoutDashboard size={20} /> Dashboard
                </button>
                <button style={{ background: 'transparent', color: '#94a3b8', border: 'none', padding: '12px', borderRadius: '8px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Users size={20} /> Leads
                </button>
                <button style={{ background: 'transparent', color: '#94a3b8', border: 'none', padding: '12px', borderRadius: '8px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <PieChart size={20} /> Analytics
                </button>
                <button style={{ background: 'transparent', color: '#94a3b8', border: 'none', padding: '12px', borderRadius: '8px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Settings size={20} /> Configurações
                </button>
                <button
                    onClick={handleLogout}
                    style={{ background: 'transparent', color: '#ef4444', border: 'none', padding: '12px', borderRadius: '8px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px', cursor: 'pointer' }}
                >
                    <LogOut size={20} /> Sair
                </button>
                <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {user.full_name[0]}
                    </div>
                    <div>
                        <div style={{ fontSize: '14px', fontWeight: '600' }}>{user.full_name}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>Administrador</div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '40px' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Dashboard de Leads</h1>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                            <input type="text" placeholder="Buscar..." style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 10px 10px 40px', borderRadius: '8px', color: '#fff', width: '240px' }} />
                        </div>
                        <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bell size={20} /></button>
                    </div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
                    {[
                        { label: 'Leads Hoje', value: '12', color: '#6366f1' },
                        { label: 'Conversões', value: '8', color: '#10b981' },
                        { label: 'Receita Est.', value: 'R$ 4.200', color: '#f59e0b' },
                        { label: 'Tempo Médio', value: '4m 12s', color: '#ec4899' }
                    ].map((stat, i) => (
                        <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '24px', borderRadius: '16px' }}>
                            <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>{stat.label}</div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: stat.color }}>{stat.value}</div>
                        </div>
                    ))}
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', fontWeight: 'bold' }}>Últimos Leads Cadastrados</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', background: 'rgba(255,255,255,0.02)' }}>
                                <th style={{ padding: '16px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Nome</th>
                                <th style={{ padding: '16px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>E-mail</th>
                                <th style={{ padding: '16px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                                <th style={{ padding: '16px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { name: 'João Silva', email: 'joao@empresa.com', status: 'Novo' },
                                { name: 'Maria Santos', email: 'maria@contato.br', status: 'Em contato' },
                                { name: 'Pedro Oliver', email: 'pedro@tecnologia.com', status: 'Qualificado' }
                            ].map((lead, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '16px' }}>{lead.name}</td>
                                    <td style={{ padding: '16px', color: '#94a3b8' }}>{lead.email}</td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>{lead.status}</span>
                                    </td>
                                    <td style={{ padding: '16px' }}><button style={{ color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer' }}>Ver Detalhes</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
