import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
    LayoutDashboard, Users, Settings, PieChart, LogOut, ArrowLeft, Save,
    Store, Key, Lock, MessageSquare, Bell, Keyboard, HelpCircle, ChevronRight
} from 'lucide-react';
import axios from 'axios';

export default function CompanySettings() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentView, setCurrentView] = useState('main'); // 'main', 'general', 'team', etc.
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [team, setTeam] = useState([]);

    useEffect(() => {
        if (!router.isReady) return;

        const userData = localStorage.getItem('userData');
        if (!userData) {
            router.push('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        const { company_id } = router.query;
        if (!company_id) {
            router.push('/minhas-empresas');
            return;
        }

        fetchCompanyDetails(company_id, parsedUser.id);
    }, [router.isReady, router.query]);

    const fetchCompanyDetails = async (companyId, userId) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

            // Check access
            const linkRes = await axios.get(`${apiUrl}/user-companies?user_id=${userId}&company_id=${companyId}`);
            if (linkRes.data.length === 0) {
                alert("Você não tem acesso a esta empresa.");
                router.push('/minhas-empresas');
                return;
            }

            // Get company data
            const companyRes = await axios.get(`${apiUrl}/companies/${companyId}`);
            setCompany(companyRes.data);
            setFormData({
                name: companyRes.data.name,
                description: companyRes.data.description || ''
            });

            // Get team
            const teamRes = await axios.get(`${apiUrl}/user-companies?company_id=${companyId}`);
            setTeam(teamRes.data);

        } catch (error) {
            console.error("Erro ao carregar configurações:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateCompany = async (e) => {
        e.preventDefault();
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            await axios.put(`${apiUrl}/companies/${company.id}`, formData);
            alert("Configurações salvas com sucesso!");
            setCompany({ ...company, ...formData });
        } catch (error) {
            console.error("Erro ao atualizar:", error);
            alert("Erro ao salvar alterações.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        router.push('/login');
    };

    const menuItems = [
        { id: 'general', icon: Store, label: 'Empresa', description: 'Respostas rápidas, etiquetas, catálogo' },
        { id: 'account', icon: Key, label: 'Conta', description: 'Notificações de segurança, dados da conta' },
        { id: 'privacy', icon: Lock, label: 'Privacidade', description: 'Contatos bloqueados, mensagens temporárias' },
        { id: 'chats', icon: MessageSquare, label: 'Conversas', description: 'Tema, papel de parede, configurações de conversas' },
        { id: 'notifications', icon: Bell, label: 'Notificações', description: 'Mensagens, grupos, sons' },
        { id: 'keyboard', icon: Keyboard, label: 'Atalhos do teclado', description: 'Ações rápidas' },
        { id: 'help', icon: HelpCircle, label: 'Ajuda e feedback', description: 'Central de Ajuda, fale conosco, Política de Privacidade' },
    ];

    // Adicionando Equipe manualmente no render ou na lista se quiser manter padrão
    // Vamos adicionar como um item extra especial ou dentro da lista
    const extendedMenuItems = [
        ...menuItems,
        // Inserting 'Team' as a special item relevant to this app
        { id: 'team', icon: Users, label: 'Equipe', description: 'Gerenciar membros da empresa' }
    ];

    if (loading || !user || !company) return <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Carregando...</div>;

    return (
        <div style={{ background: '#0f172a', minHeight: '100vh', color: '#fff', display: 'flex' }}>
            <Head>
                <title>Configurações | {company.name}</title>
            </Head>

            {/* Sidebar */}
            <aside style={{ width: '260px', borderRight: '1px solid rgba(255,255,255,0.1)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: '#6366f1' }}>AURA 8</div>
                <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    {company.name}
                </div>

                <button onClick={() => router.push(`/admin/dashboard?company_id=${company.id}`)} style={{ background: 'transparent', color: '#94a3b8', border: 'none', padding: '12px', borderRadius: '8px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <LayoutDashboard size={20} /> Dashboard
                </button>
                <button style={{ background: 'transparent', color: '#94a3b8', border: 'none', padding: '12px', borderRadius: '8px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Users size={20} /> Projetos
                </button>
                <button style={{ background: 'transparent', color: '#94a3b8', border: 'none', padding: '12px', borderRadius: '8px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <PieChart size={20} /> Analytics
                </button>
                <button style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: 'none', padding: '12px', borderRadius: '8px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Settings size={20} /> Configurações
                </button>

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button onClick={() => router.push('/minhas-empresas')} style={{ background: 'transparent', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                        <ArrowLeft size={20} /> Trocar Empresa
                    </button>
                    <button onClick={handleLogout} style={{ background: 'transparent', color: '#ef4444', border: 'none', padding: '12px', borderRadius: '8px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                        <LogOut size={20} /> Sair
                    </button>
                </div>

                <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {user.full_name[0]}
                    </div>
                    <div>
                        <div style={{ fontSize: '14px', fontWeight: '600' }}>{user.full_name}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>Usuário</div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>

                {currentView === 'main' && (
                    <div style={{ maxWidth: '1000px' }}>
                        <header style={{ marginBottom: '40px' }}>
                            <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Configurações</h1>
                        </header>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                            {extendedMenuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setCurrentView(item.id)}
                                    style={{
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        padding: '24px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                        gap: '16px',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        borderRadius: '16px',
                                        transition: 'all 0.2s',
                                        height: '100%'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.borderColor = '#6366f1';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                    }}
                                >
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '12px',
                                        background: 'rgba(99, 102, 241, 0.1)',
                                        color: '#818cf8',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <item.icon size={24} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '18px', fontWeight: '600', color: '#fff', marginBottom: '8px' }}>{item.label}</div>
                                        <div style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.5' }}>{item.description}</div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '32px 0' }}></div>

                        <button
                            onClick={handleLogout}
                            style={{
                                background: 'transparent',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                padding: '16px 24px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                cursor: 'pointer',
                                borderRadius: '12px',
                                color: '#ef4444',
                                width: 'fit-content'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <LogOut size={20} />
                            <div style={{ fontSize: '16px', fontWeight: '600' }}>Desconectar</div>
                        </button>
                    </div>
                )}

                {currentView !== 'main' && (
                    <div style={{ maxWidth: '600px' }}>
                        <button
                            onClick={() => setCurrentView('main')}
                            style={{ background: 'transparent', border: 'none', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', cursor: 'pointer', fontSize: '14px' }}
                        >
                            <ArrowLeft size={18} /> Voltar
                        </button>

                        {currentView === 'general' && (
                            <>
                                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Ferramentas comerciais</h2>
                                <form onSubmit={handleUpdateCompany} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Nome da Empresa</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Descrição</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows={4}
                                            style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                        />
                                    </div>
                                    <button type="submit" style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', width: 'fit-content' }}>
                                        <Save size={18} /> Salvar Alterações
                                    </button>
                                </form>
                            </>
                        )}

                        {currentView === 'team' && (
                            <>
                                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>Equipe</h2>
                                <div style={{ display: 'grid', gap: '16px' }}>
                                    {team.map((member) => (
                                        <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                {member.user_name ? member.user_name[0] : 'U'}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600' }}>{member.user_name}</div>
                                                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Membro da Equipe</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {['account', 'privacy', 'chats', 'notifications', 'keyboard', 'help'].includes(currentView) && (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px' }}>
                                Funcionalidade em desenvolvimento.
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
