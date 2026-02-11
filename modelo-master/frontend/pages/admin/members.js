import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { LayoutDashboard, Users, Settings, PieChart, Bell, Search, LogOut, ArrowLeft, Trash, Pencil, Plus, FolderKanban, Mail, Lock, User, MessageSquare, Send, X } from 'lucide-react';
import axios from 'axios';

export default function MembersPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [company, setCompany] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [newMember, setNewMember] = useState({ full_name: '', email: '', password: '', role: 'membro' });
    const [selectedMember, setSelectedMember] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [showChat, setShowChat] = useState(false);

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

            // Set user role for current company
            setUserRole(linkRes.data[0].role);

            fetchMembers(companyId);
            setLoading(false);
        } catch (error) {
            console.error("Erro ao carregar membros:", error);
            router.push('/minhas-empresas');
        }
    };

    const isAdminOrDono = ['dono', 'administrador'].includes(userRole?.toLowerCase());

    const fetchMembers = async (companyId) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${apiUrl}/user-companies?company_id=${companyId}`);
            setMembers(res.data);
        } catch (error) {
            console.error("Erro ao buscar membros:", error);
        }
    };

    const handleCreateMember = async (e) => {
        e.preventDefault();
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

            // 1. Register User
            const regRes = await axios.post(`${apiUrl}/auth/register`, {
                email: newMember.email,
                password: newMember.password,
                full_name: newMember.full_name,
                role: 'visitante' // Default app role
            });

            const newUserId = regRes.data.userId;

            // 2. Link User to Company
            await axios.post(`${apiUrl}/user-companies`, {
                user_id: newUserId,
                company_id: company.id,
                role: newMember.role
            });

            setShowModal(false);
            setNewMember({ full_name: '', email: '', password: '', role: 'membro' });
            fetchMembers(company.id);
            alert("Membro adicionado com sucesso!");
        } catch (error) {
            console.error("Erro ao adicionar membro:", error);
            alert(error.response?.data?.error || "Erro ao adicionar membro.");
        }
    };

    const handleDeleteMember = async (linkId) => {
        if (!confirm("Tem certeza que deseja remover este membro da empresa?")) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            await axios.delete(`${apiUrl}/user-companies/${linkId}`);
            fetchMembers(company.id);
        } catch (error) {
            console.error("Erro ao remover membro:", error);
            alert("Erro ao remover membro.");
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

    const openChat = async (member) => {
        setSelectedMember(member);
        setShowChat(true);
        fetchMessages(member.user_id);
    };

    const fetchMessages = async (otherUserId) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${apiUrl}/messages?user1_id=${user.id}&user2_id=${otherUserId}&company_id=${company.id}`);
            setChatMessages(res.data);

            // Mark as read
            await axios.put(`${apiUrl}/messages/read`, {
                sender_id: otherUserId,
                receiver_id: user.id,
                company_id: company.id
            });
        } catch (error) {
            console.error("Erro ao buscar mensagens:", error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await axios.post(`${apiUrl}/messages`, {
                sender_id: user.id,
                receiver_id: selectedMember.user_id,
                company_id: company.id,
                content: newMessage
            });

            setChatMessages([...chatMessages, res.data]);
            setNewMessage('');
        } catch (error) {
            console.error("Erro ao enviar mensagem:", error);
        }
    };

    if (loading || !user || !company) return <div style={{ background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Carregando...</div>;

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: `/admin/dashboard?company_id=${company.id}` },
        { icon: FolderKanban, label: 'Projetos', path: `/admin/projects?company_id=${company.id}` },
        { icon: Users, label: 'Membros', path: `/admin/members?company_id=${company.id}`, active: true },
        { icon: PieChart, label: 'Anotações', path: `/admin/notes?company_id=${company.id}` },
        { icon: Settings, label: 'Configurações', path: `/admin/settings?company_id=${company.id}` },
    ];

    return (
        <div style={{ background: '#0f172a', minHeight: '100vh', color: '#fff', display: 'flex', fontFamily: 'Inter, sans-serif' }}>
            <Head>
                <title>Membros | {company.name}</title>
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
                        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>Equipe da Empresa</h1>
                        <p style={{ color: '#64748b' }}>Gerencie os membros que têm acesso a {company.name}.</p>
                    </div>
                    {isAdminOrDono && (
                        <button
                            onClick={() => setShowModal(true)}
                            style={{ background: '#6366f1', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Plus size={20} />
                            Novo Membro
                        </button>
                    )}
                </header>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#64748b' }}>
                                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600' }}>MEMBRO</th>
                                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600' }}>FUNÇÃO</th>
                                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600' }}>AÇÕES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((member) => (
                                <tr key={member.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                                                {member.user_name ? member.user_name[0] : 'U'}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', fontSize: '14px' }}>{member.user_name}</div>
                                                <div style={{ fontSize: '12px', color: '#64748b' }}>ID do Usuário: {member.user_id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{ fontSize: '10px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                            {member.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {member.user_id !== user.id && (
                                                <button onClick={() => openChat(member)} title="Enviar Mensagem" style={{ background: 'rgba(99, 102, 241, 0.1)', border: 'none', color: '#6366f1', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <MessageSquare size={18} />
                                                </button>
                                            )}
                                            {isAdminOrDono && member.user_id !== user.id && (
                                                <button onClick={() => handleDeleteMember(member.id)} title="Remover Membro" style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Trash size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Modal */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div style={{ background: '#1e293b', padding: '32px', borderRadius: '16px', width: '450px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' }}>Novo Membro</h2>
                        <form onSubmit={handleCreateMember}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>Nome Completo</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                    <input
                                        type="text"
                                        style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white' }}
                                        value={newMember.full_name}
                                        onChange={e => setNewMember({ ...newMember, full_name: e.target.value })}
                                        required
                                        placeholder="Ex: João Silva"
                                    />
                                </div>
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>E-mail</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                    <input
                                        type="email"
                                        style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white' }}
                                        value={newMember.email}
                                        onChange={e => setNewMember({ ...newMember, email: e.target.value })}
                                        required
                                        placeholder="email@empresa.com"
                                    />
                                </div>
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>Senha Temporária</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                    <input
                                        type="password"
                                        style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white' }}
                                        value={newMember.password}
                                        onChange={e => setNewMember({ ...newMember, password: e.target.value })}
                                        required
                                        placeholder="******"
                                    />
                                </div>
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>Função na Empresa</label>
                                <select
                                    style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white' }}
                                    value={newMember.role}
                                    onChange={e => setNewMember({ ...newMember, role: e.target.value })}
                                >
                                    <option value="membro">Membro</option>
                                    <option value="moderador">Moderador</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{ background: 'transparent', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 24px', borderRadius: '10px', cursor: 'pointer' }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    style={{ background: '#6366f1', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    Adicionar Membro
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Chat Modal */}
            {showChat && selectedMember && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
                    <div style={{ background: '#1e293b', borderRadius: '24px', width: '500px', height: '600px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        {/* Chat Header */}
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                    {selectedMember.user_name[0]}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{selectedMember.user_name}</div>
                                    <div style={{ fontSize: '12px', color: '#10b981' }}>Online</div>
                                </div>
                            </div>
                            <button onClick={() => { setShowChat(false); setSelectedMember(null); }} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', background: '#0f172a' }}>
                            {chatMessages.length > 0 ? chatMessages.map((msg) => (
                                <div key={msg.id} style={{
                                    alignSelf: msg.sender_id === user.id ? 'flex-end' : 'flex-start',
                                    maxWidth: '80%',
                                    background: msg.sender_id === user.id ? '#6366f1' : 'rgba(255,255,255,0.05)',
                                    padding: '12px 16px',
                                    borderRadius: msg.sender_id === user.id ? '16px 16px 0 16px' : '16px 16px 16px 0',
                                    color: '#fff'
                                }}>
                                    <div style={{ fontSize: '14px', lineHeight: '1.5' }}>{msg.content}</div>
                                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '4px', textAlign: 'right' }}>
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            )) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '14px' }}>
                                    Nenhuma mensagem ainda. Comece a conversa!
                                </div>
                            )}
                        </div>

                        {/* Chat Input */}
                        <form onSubmit={handleSendMessage} style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.02)' }}>
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Digite sua mensagem..."
                                style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 16px', borderRadius: '12px', color: '#fff', outline: 'none' }}
                            />
                            <button type="submit" style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Send size={20} />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
