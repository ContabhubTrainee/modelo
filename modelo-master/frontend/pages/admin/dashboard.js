
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { LayoutDashboard, Users, Settings, PieChart, Bell, Search, LogOut, ArrowLeft, Trash, Pencil, FolderKanban } from 'lucide-react';
import axios from 'axios';

export default function AdminDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [company, setCompany] = useState(null);
    const [goals, setGoals] = useState([]);
    const [projects, setProjects] = useState([]);
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [showEditGoalModal, setShowEditGoalModal] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [newGoal, setNewGoal] = useState({ title: '', target_value: '', deadline: '', responsible_id: '', current_value: 0, project_id: '' });
    const [loading, setLoading] = useState(true);
    const [companyUsers, setCompanyUsers] = useState([]);


    useEffect(() => {
        if (company) {
            fetchGoals(company.id);
        }
    }, [company]);

    const fetchGoals = async (companyId) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${apiUrl}/goals?company_id=${companyId}`);
            setGoals(res.data);
        } catch (error) {
            console.error("Erro ao buscar metas:", error);
            if (error.response) console.error("Detalhes do erro:", error.response.data);
        }
    };

    const handleDeleteGoal = async (goalId) => {
        if (!confirm("Tem certeza que deseja excluir esta meta?")) return;

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            await axios.delete(`${apiUrl}/goals/${goalId}`);
            fetchGoals(company.id); // Refresh list
        } catch (error) {
            console.error("Erro ao excluir meta:", error);
            alert("Erro ao excluir meta.");
        }
    };

    const handleEditGoal = (goal) => {
        setEditingGoal({
            ...goal,
            deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : ''
        });
        setShowEditGoalModal(true);
    };

    const handleUpdateGoal = async (e) => {
        e.preventDefault();
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            await axios.put(`${apiUrl}/goals/${editingGoal.id}`, {
                ...editingGoal,
                target_value: parseFloat(editingGoal.target_value),
                current_value: parseFloat(editingGoal.current_value || 0)
            });
            setShowEditGoalModal(false);
            setEditingGoal(null);
            fetchGoals(company.id);
            alert("Meta atualizada com sucesso!");
        } catch (error) {
            console.error("Erro ao atualizar meta:", error);
            alert("Erro ao atualizar meta.");
        }
    };

    const handleCreateGoal = async (e) => {
        e.preventDefault();
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

            await axios.post(`${apiUrl}/goals`, {
                company_id: company.id,
                ...newGoal,
                current_value: parseFloat(newGoal.current_value || 0),
                target_value: parseFloat(newGoal.target_value)
            });
            setShowGoalModal(false);
            setNewGoal({ title: '', target_value: '', deadline: '', responsible_id: '', current_value: 0, project_id: '' });
            fetchGoals(company.id);
            alert("Meta criada com sucesso!");

        } catch (error) {
            console.error("Erro ao criar meta:", error);
            alert("Erro ao criar meta.");
        }
    };


    useEffect(() => {
        // Garantir que o router está pronto para ler query params
        if (!router.isReady) return;

        const userData = localStorage.getItem('userData');
        if (!userData) {
            router.push('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        const { company_id } = router.query;

        // Se não tiver company_id, volta para seleção
        if (!company_id) {
            router.push('/minhas-empresas');
            return;
        }

        fetchCompanyDetails(company_id, parsedUser.id);
    }, [router.isReady, router.query]);

    const fetchCompanyDetails = async (companyId, userId) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

            // 1. Verificar se o usuário tem acesso a essa empresa
            const linkRes = await axios.get(`${apiUrl}/user-companies?user_id=${userId}&company_id=${companyId}`);

            if (linkRes.data.length === 0) {
                alert("Você não tem acesso a esta empresa.");
                router.push('/minhas-empresas');
                return;
            }

            // 2. Buscar dados da empresa
            const companyRes = await axios.get(`${apiUrl}/companies/${companyId}`);
            setCompany(companyRes.data);

            fetchGoals(companyId);
            fetchProjects(companyId);
            fetchCompanyUsers(companyId);
            setLoading(false);
        } catch (error) {
            console.error("Erro ao carregar dashboard:", error);
            router.push('/minhas-empresas');
        }
    };

    const fetchProjects = async (companyId) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${apiUrl}/projects?company_id=${companyId}`);
            setProjects(res.data);
        } catch (error) {
            console.error("Erro ao buscar projetos:", error);
        }
    };

    const fetchCompanyUsers = async (companyId) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${apiUrl}/user-companies?company_id=${companyId}`);
            setCompanyUsers(res.data);
        } catch (error) {
            console.error("Erro ao buscar equipe:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        router.push('/login');
    };

    const handleBackToCompanies = () => {
        router.push('/minhas-empresas');
    };

    if (loading || !user || !company) return <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Carregando painel...</div>;

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: `/admin/dashboard?company_id=${company.id}`, active: true },
        { icon: FolderKanban, label: 'Projetos', path: `/admin/projects?company_id=${company.id}` },
        { icon: PieChart, label: 'Anotações', path: `/admin/notes?company_id=${company.id}` },
        { icon: Settings, label: 'Configurações', path: `/admin/settings?company_id=${company.id}` },
    ];

    return (
        <div style={{ background: '#0f172a', minHeight: '100vh', color: '#fff', display: 'flex' }}>
            <Head>
                <title>Dashboard | {company.name}</title>
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
                        onClick={handleBackToCompanies}
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
            <main style={{ flex: 1, padding: '40px' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Dashboard de Projetos</h1>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                            <input type="text" placeholder="Buscar..." style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 10px 10px 40px', borderRadius: '8px', color: '#fff', width: '240px' }} />
                        </div>
                        <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bell size={20} /></button>
                    </div>
                </header>



                {/* ... (rest of the file until main content) */}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
                    {/* Existing cards */}
                    {[
                        { label: 'Projetos Ativos', value: projects.length.toString(), color: '#6366f1' },
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

                {/* Goals Section */}
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Metas da Empresa</h2>
                        <button
                            onClick={() => setShowGoalModal(true)}
                            style={{ background: '#6366f1', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
                        >
                            + Nova Meta
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                        {goals.length > 0 ? goals.map((goal) => {
                            const progress = Math.min((goal.current_value / goal.target_value) * 100, 100);
                            return (
                                <div key={goal.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '24px', borderRadius: '16px', position: 'relative' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                <h3 style={{ fontWeight: 'bold', fontSize: '18px', margin: 0 }}>{goal.title}</h3>
                                                {goal.project_name && (
                                                    <span style={{ fontSize: '10px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                                                        {goal.project_name}
                                                    </span>
                                                )}
                                            </div>
                                            {goal.responsible_name && (
                                                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                                                        {goal.responsible_name[0]}
                                                    </div>
                                                    {goal.responsible_name}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => handleEditGoal(goal)}
                                                    style={{ background: 'transparent', border: 'none', color: '#6366f1', cursor: 'pointer', padding: '4px' }}
                                                    title="Editar meta"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteGoal(goal.id)}
                                                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                                                    title="Excluir meta"
                                                >
                                                    <Trash size={16} />
                                                </button>
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px', height: 'fit-content' }}>
                                                {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'Sem prazo'}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
                                        {goal.current_value} <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 'normal' }}>/ {goal.target_value}</span>
                                    </div>
                                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${progress}%`, background: '#10b981', transition: 'width 0.3s' }}></div>
                                    </div>
                                    <div style={{ marginTop: '12px', textAlign: 'right', fontSize: '12px', color: '#10b981' }}>
                                        {Math.round(progress)}% Concluído
                                    </div>
                                </div>
                            );
                        }) : (
                            <div style={{ gridColumn: '1 / -1', padding: '24px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px', textAlign: 'center', color: '#64748b' }}>
                                Nenhuma meta definida.
                            </div>
                        )}
                    </div >
                </div >

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', overflow: 'hidden' }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Últimos Projetos Cadastrados</span>
                        <button
                            onClick={() => router.push(`/admin/projects?company_id=${company.id}`)}
                            style={{ background: 'transparent', border: 'none', color: '#6366f1', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}
                        >
                            Ver Todos
                        </button>
                    </div>

                    <div style={{ padding: '0' }}>
                        {projects.length > 0 ? (
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#64748b' }}>
                                        <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600' }}>PROJETO</th>
                                        <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600' }}>MEMBROS</th>
                                        <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600' }}>STATUS</th>
                                        <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600' }}>CRIADO EM</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {projects.slice(0, 5).map((project) => (
                                        <tr key={project.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ fontWeight: '600', fontSize: '14px' }}>{project.name}</div>
                                                <div style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                                                    {project.description || 'Sem descrição'}
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                    {project.members && project.members.slice(0, 3).map((member, idx) => (
                                                        <div key={idx} title={member.full_name} style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', border: '1px solid #1e293b' }}>
                                                            {member.full_name[0]}
                                                        </div>
                                                    ))}
                                                    {project.members && project.members.length > 3 && (
                                                        <div style={{ fontSize: '10px', color: '#64748b', display: 'flex', alignItems: 'center', paddingLeft: '4px' }}>
                                                            +{project.members.length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                                    {project.status === 'active' ? 'Ativo' : project.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px 24px', fontSize: '12px', color: '#64748b' }}>
                                                {new Date(project.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div style={{ padding: '40px', color: '#94a3b8', textAlign: 'center' }}>
                                Nenhum projeto encontrado para {company.name} ainda.
                            </div>
                        )}
                    </div>
                </div>
            </main >

            {/* Goal Modal */}
            {
                showGoalModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                        <div style={{ background: '#1e293b', padding: '32px', borderRadius: '16px', width: '400px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '24px' }}>Nova Meta</h2>
                            <form onSubmit={handleCreateGoal}>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>Título</label>
                                    <input
                                        type="text"
                                        style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                                        value={newGoal.title}
                                        onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>Meta (Valor)</label>
                                    <input
                                        type="number"
                                        style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                                        value={newGoal.target_value}
                                        onChange={e => setNewGoal({ ...newGoal, target_value: e.target.value })}
                                        required
                                    />
                                </div>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>Valor atual (Opcional)</label>
                                    <input
                                        type="number"
                                        style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                                        value={newGoal.current_value}
                                        onChange={e => setNewGoal({ ...newGoal, current_value: e.target.value })}
                                    />
                                </div>

                                {newGoal.target_value > 0 && (
                                    <div style={{ marginBottom: '24px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', color: '#94a3b8' }}>
                                            <span>Progresso</span>
                                            <span>{Math.round(Math.min((newGoal.current_value / newGoal.target_value) * 100, 100))}%</span>
                                        </div>
                                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${Math.min((newGoal.current_value / newGoal.target_value) * 100, 100)}%`,
                                                background: '#10b981',
                                                transition: 'width 0.3s'
                                            }}></div>
                                        </div>
                                    </div>
                                )}
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>Prazo</label>
                                    <input
                                        type="date"
                                        style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                                        value={newGoal.deadline}
                                        onChange={e => setNewGoal({ ...newGoal, deadline: e.target.value })}
                                    />
                                </div>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>Responsável</label>
                                    <select
                                        style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                                        value={newGoal.responsible_id}
                                        onChange={e => setNewGoal({ ...newGoal, responsible_id: e.target.value })}
                                    >
                                        <option value="">Selecione um responsável...</option>
                                        {companyUsers.map(u => (
                                            <option key={u.user_id} value={u.user_id}>
                                                {u.user_name || `Usuário ${u.user_id}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>Projeto (Opcional)</label>
                                    <select
                                        style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                                        value={newGoal.project_id}
                                        onChange={e => setNewGoal({ ...newGoal, project_id: e.target.value })}
                                    >
                                        <option value="">Nenhum projeto</option>
                                        {projects.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowGoalModal(false)}
                                        style={{ background: 'transparent', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        style={{ background: '#6366f1', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}
                                    >
                                        Criar Meta
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Edit Goal Modal */}
            {
                showEditGoalModal && editingGoal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                        <div style={{ background: '#1e293b', padding: '32px', borderRadius: '16px', width: '400px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '24px' }}>Editar Meta</h2>
                            <form onSubmit={handleUpdateGoal}>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>Título</label>
                                    <input
                                        type="text"
                                        style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                                        value={editingGoal.title}
                                        onChange={e => setEditingGoal({ ...editingGoal, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>Meta (Valor)</label>
                                    <input
                                        type="number"
                                        style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                                        value={editingGoal.target_value}
                                        onChange={e => setEditingGoal({ ...editingGoal, target_value: e.target.value })}
                                        required
                                    />
                                </div>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>Valor atual</label>
                                    <input
                                        type="number"
                                        style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                                        value={editingGoal.current_value}
                                        onChange={e => setEditingGoal({ ...editingGoal, current_value: e.target.value })}
                                    />
                                </div>

                                {editingGoal.target_value > 0 && (
                                    <div style={{ marginBottom: '24px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', color: '#94a3b8' }}>
                                            <span>Progresso</span>
                                            <span>{Math.round(Math.min((editingGoal.current_value / editingGoal.target_value) * 100, 100))}%</span>
                                        </div>
                                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${Math.min((editingGoal.current_value / editingGoal.target_value) * 100, 100)}%`,
                                                background: '#10b981',
                                                transition: 'width 0.3s'
                                            }}></div>
                                        </div>
                                    </div>
                                )}

                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>Prazo</label>
                                    <input
                                        type="date"
                                        style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                                        value={editingGoal.deadline}
                                        onChange={e => setEditingGoal({ ...editingGoal, deadline: e.target.value })}
                                    />
                                </div>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>Responsável</label>
                                    <select
                                        style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                                        value={editingGoal.responsible_id || ''}
                                        onChange={e => setEditingGoal({ ...editingGoal, responsible_id: e.target.value })}
                                    >
                                        <option value="">Selecione um responsável...</option>
                                        {companyUsers.map(u => (
                                            <option key={u.user_id} value={u.user_id}>
                                                {u.user_name || `Usuário ${u.user_id}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>Projeto (Opcional)</label>
                                    <select
                                        style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                                        value={editingGoal.project_id || ''}
                                        onChange={e => setEditingGoal({ ...editingGoal, project_id: e.target.value })}
                                    >
                                        <option value="">Nenhum projeto</option>
                                        {projects.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEditGoalModal(false);
                                            setEditingGoal(null);
                                        }}
                                        style={{ background: 'transparent', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        style={{ background: '#6366f1', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}
                                    >
                                        Salvar Alterações
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
