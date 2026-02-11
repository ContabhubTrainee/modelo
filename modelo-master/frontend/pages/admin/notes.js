import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import axios from 'axios';
import {
    ArrowLeft,
    BookOpen,
    Plus,
    Search,
    Calendar,
    LayoutGrid,
    List,
    Bell,
    Target,
    ChevronDown,
    LayoutDashboard,
    FolderKanban,
    Users,
    PieChart,
    Settings,
    LogOut
} from 'lucide-react';

export default function NotesPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);

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

        // Fetch company details to be consistent with others
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        axios.get(`${apiUrl}/companies/${company_id}`)
            .then(res => {
                setCompany(res.data);
                setLoading(false);
            })
            .catch(() => {
                router.push('/minhas-empresas');
            });

    }, [router.isReady, router.query]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        router.push('/login');
    };

    if (loading || !user || !company) return <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Carregando...</div>;

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: `/admin/dashboard?company_id=${company.id}` },
        { icon: FolderKanban, label: 'Projetos', path: `/admin/projects?company_id=${company.id}` },
        { icon: Users, label: 'Membros', path: `/admin/members?company_id=${company.id}` },
        { icon: PieChart, label: 'Anotações', path: `/admin/notes?company_id=${company.id}`, active: true },
        { icon: Settings, label: 'Configurações', path: `/admin/settings?company_id=${company.id}` },
    ];

    return (
        <div style={{ background: '#0f172a', minHeight: '100vh', color: '#fff', display: 'flex', fontFamily: 'Inter, sans-serif' }}>
            <Head>
                <title>Meu Diário | {company.name}</title>
            </Head>

            {/* Sidebar */}
            <aside style={{ width: '260px', borderRight: '1px solid rgba(255,255,255,0.1)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: '#6366f1' }}>AURA 8</div>
                <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    {company.name}
                </div>

                {navItems.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => router.push(item.path)}
                        style={{
                            background: item.active ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                            color: item.active ? '#818cf8' : '#94a3b8',
                            border: 'none',
                            padding: '12px',
                            borderRadius: '8px',
                            textAlign: 'left',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            cursor: 'pointer'
                        }}
                    >
                        <item.icon size={20} /> {item.label}
                    </button>
                ))}

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                        onClick={() => router.push('/minhas-empresas')}
                        style={{ background: 'transparent', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                    >
                        <ArrowLeft size={20} /> Trocar Empresa
                    </button>
                    <button
                        onClick={handleLogout}
                        style={{ background: 'transparent', color: '#ef4444', border: 'none', padding: '12px', borderRadius: '8px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                    >
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
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>Meu Diário</h1>
                        <p style={{ color: '#64748b' }}>Organize suas anotações, metas e lembretes em um só lugar.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
                            <Plus size={18} /> Anotação
                        </button>
                        <button style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
                            <Plus size={18} /> Meta
                        </button>
                    </div>
                </header>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                        <Calendar size={40} />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>Nenhum item encontrado</h3>
                    <p>Comece criando sua primeira anotação ou meta.</p>
                </div>
            </main>
        </div>
    );
}
