import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { LayoutDashboard, Users, Settings, PieChart, Bell, Search, LogOut, ArrowLeft, Trash, Pencil, Plus, FolderKanban } from 'lucide-react';
import axios from 'axios';

export default function ProjectsPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [company, setCompany] = useState(null);
    const [projects, setProjects] = useState([]);
    const [companyUsers, setCompanyUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [newProject, setNewProject] = useState({ name: '', description: '', user_ids: [] });

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

            // Set user role
            setUserRole(linkRes.data[0].role);

            // 2. Buscar dados da empresa
            const companyRes = await axios.get(`${apiUrl}/companies/${companyId}`);
            setCompany(companyRes.data);

            // 3. Buscar usuários da empresa
            const usersRes = await axios.get(`${apiUrl}/user-companies?company_id=${companyId}`);
            setCompanyUsers(usersRes.data);

            fetchProjects(companyId);
            setLoading(false);
        } catch (error) {
            console.error("Erro ao carregar projetos:", error);
            router.push('/minhas-empresas');
        }
    };

    const isAdminOrDono = ['dono', 'administrador'].includes(userRole?.toLowerCase());

    const fetchProjects = async (companyId) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${apiUrl}/projects?company_id=${companyId}`);
            setProjects(res.data);
        } catch (error) {
            console.error("Erro ao buscar projetos:", error);
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            await axios.post(`${apiUrl}/projects`, {
                company_id: company.id,
                ...newProject
            });
            setShowModal(false);
            setNewProject({ name: '', description: '', user_ids: [] });
            fetchProjects(company.id);
            alert("Projeto criado com sucesso!");
        } catch (error) {
            console.error("Erro ao criar projeto:", error);
            alert("Erro ao criar projeto.");
        }
    };

    const handleUpdateProject = async (e) => {
        e.preventDefault();
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            await axios.put(`${apiUrl}/projects/${editingProject.id}`, {
                ...editingProject,
                user_ids: editingProject.user_ids || []
            });
            setEditingProject(null);
            fetchProjects(company.id);
            alert("Projeto atualizado com sucesso!");
        } catch (error) {
            console.error("Erro ao atualizar projeto:", error);
            alert("Erro ao atualizar projeto.");
        }
    };

    const handleDeleteProject = async (id) => {
        if (!confirm("Tem certeza que deseja excluir este projeto? Metas vinculadas continuarão existindo mas sem projeto.")) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            await axios.delete(`${apiUrl}/projects/${id}`);
            fetchProjects(company.id);
        } catch (error) {
            console.error("Erro ao excluir projeto:", error);
            alert("Erro ao excluir projeto.");
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

    if (loading || !user || !company) return <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Carregando...</div>;

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: `/admin/dashboard?company_id=${company.id}` },
        { icon: FolderKanban, label: 'Projetos', path: `/admin/projects?company_id=${company.id}`, active: true },
        { icon: Users, label: 'Membros', path: `/admin/members?company_id=${company.id}` },
        { icon: PieChart, label: 'Anotações', path: `/admin/notes?company_id=${company.id}` },
        { icon: Settings, label: 'Configurações', path: `/admin/settings?company_id=${company.id}` },
    ];

    return (
        <div style={{ background: '#0f172a', minHeight: '100vh', color: '#fff', display: 'flex', fontFamily: 'Inter, sans-serif' }}>
            <Head>
                <title>Projetos | {company.name}</title>
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
            <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>Projetos da Empresa</h1>
                        <p style={{ color: '#64748b' }}>Gerencie os projetos vinculados às suas metas.</p>
                    </div>
                    {isAdminOrDono && (
                        <button
                            onClick={() => setShowModal(true)}
                            style={{ background: '#6366f1', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Plus size={20} />
                            Novo Projeto
                        </button>
                    )}
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                    {projects.length > 0 ? projects.map((project) => (
                        <div key={project.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '24px', transition: 'transform 0.2s', cursor: 'default' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ padding: '10px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', borderRadius: '12px' }}>
                                        <FolderKanban size={24} />
                                    </div>
                                    <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>{project.name}</h3>
                                </div>
                                {isAdminOrDono && (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => setEditingProject(project)} style={{ background: 'transparent', border: 'none', color: '#6366f1', cursor: 'pointer', padding: '4px' }}>
                                            <Pencil size={18} />
                                        </button>
                                        <button onClick={() => handleDeleteProject(project.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                                            <Trash size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px', minHeight: '44px' }}>
                                {project.description || 'Nenhuma descrição fornecida.'}
                            </p>

                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', fontWeight: 'bold', textTransform: 'uppercase' }}>Equipe</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {project.members && project.members.length > 0 ? project.members.map(member => (
                                        <div key={member.id} title={member.full_name} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', border: '2px solid #1e293b' }}>
                                            {member.full_name[0]}
                                        </div>
                                    )) : (
                                        <span style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>Sem membros atribuídos</span>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ fontSize: '12px', color: '#64748b', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '20px' }}>
                                    {project.status === 'active' ? 'Ativo' : project.status}
                                </span>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>
                                    Criado em: {new Date(project.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    )) : (
                        <div style={{ gridColumn: '1 / -1', padding: '60px', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '24px', textAlign: 'center', color: '#64748b' }}>
                            <FolderKanban size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                            <h3>Nenhum projeto cadastrado</h3>
                            <p style={{ marginTop: '8px' }}>Clique em "Novo Projeto" para começar.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Modals */}
            {(showModal || editingProject) && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div style={{ background: '#1e293b', padding: '32px', borderRadius: '16px', width: '450px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' }}>
                            {editingProject ? 'Editar Projeto' : 'Novo Projeto'}
                        </h2>
                        <form onSubmit={editingProject ? handleUpdateProject : handleCreateProject}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>Nome do Projeto</label>
                                <input
                                    type="text"
                                    style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white' }}
                                    value={editingProject ? editingProject.name : newProject.name}
                                    onChange={e => editingProject ? setEditingProject({ ...editingProject, name: e.target.value }) : setNewProject({ ...newProject, name: e.target.value })}
                                    required
                                    placeholder="Ex: Lançamento Produto X"
                                />
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>Descrição</label>
                                <textarea
                                    style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', minHeight: '100px', resize: 'vertical' }}
                                    value={editingProject ? editingProject.description : newProject.description}
                                    onChange={e => editingProject ? setEditingProject({ ...editingProject, description: e.target.value }) : setNewProject({ ...newProject, description: e.target.value })}
                                    placeholder="Breve descrição dos objetivos..."
                                />
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>Membros da Equipe</label>
                                <select
                                    multiple
                                    style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', minHeight: '120px' }}
                                    value={editingProject ? (editingProject.user_ids || editingProject.members?.map(m => m.id) || []) : newProject.user_ids}
                                    onChange={e => {
                                        const values = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                                        editingProject ? setEditingProject({ ...editingProject, user_ids: values }) : setNewProject({ ...newProject, user_ids: values });
                                    }}
                                >
                                    {companyUsers.map(u => (
                                        <option key={u.user_id} value={u.user_id}>
                                            {u.user_name || `Usuário ${u.user_id}`}
                                        </option>
                                    ))}
                                </select>
                                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>Pressione Ctrl (ou Cmd) para selecionar múltiplos membros.</p>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); setEditingProject(null); }}
                                    style={{ background: 'transparent', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 24px', borderRadius: '10px', cursor: 'pointer' }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    style={{ background: '#6366f1', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    {editingProject ? 'Salvar Alterações' : 'Criar Projeto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
