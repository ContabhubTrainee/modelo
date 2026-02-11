import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Building2, LogOut, Briefcase, Plus, X, Sun, Moon } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import styles from '../styles/MinhasEmpresas.module.css';

export default function MinhasEmpresas() {
    const router = useRouter();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLinking, setIsLinking] = useState(false);
    const [newCompanyName, setNewCompanyName] = useState('');
    const [newCompanyDescription, setNewCompanyDescription] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('userData');

        if (!token || !userData) {
            router.push('/login');
            return;
        }

        try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            fetchUserCompanies(parsedUser.id);
        } catch (error) {
            console.error('Erro ao processar dados do usuário:', error);
            router.push('/login');
        }
        // Carregar preferência de tema
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            setIsDarkMode(true);
        } else if (savedTheme === 'light') {
            setIsDarkMode(false);
        } else {
            // Opcional: checar preferência do sistema
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDarkMode(prefersDark);
        }
    }, []);

    const fetchUserCompanies = async (userId) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

            // 1. Fetch user's current companies
            const response = await axios.get(`${apiUrl}/user-companies?user_id=${userId}`);
            const links = response.data;

            const linkedCompanies = await Promise.all(links.map(async (link) => {
                try {
                    const companyRes = await axios.get(`${apiUrl}/companies/${link.company_id}`);
                    return {
                        ...companyRes.data,
                        role: link.role,
                        link_id: link.id,
                        isLinked: true
                    };
                } catch (err) {
                    console.error(`Erro ao buscar empresa ${link.company_id}:`, err);
                    return null;
                }
            }));

            const filteredLinked = linkedCompanies.filter(c => c !== null);

            // 2. Fetch all companies to identify available ones
            const allRes = await axios.get(`${apiUrl}/companies`);
            const linkedIds = filteredLinked.map(c => c.id);
            const unlinked = allRes.data
                .filter(c => !linkedIds.includes(c.id))
                .map(c => ({ ...c, isLinked: false }));

            // 3. Combine both for the grid
            setCompanies([...filteredLinked, ...unlinked]);
        } catch (error) {
            console.error('Erro ao buscar empresas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setNewCompanyName('');
        setNewCompanyDescription('');
    };

    const handleLinkQuickly = async (e, companyId) => {
        e.stopPropagation();
        setIsLinking(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            await axios.post(`${apiUrl}/user-companies`, {
                user_id: user.id,
                company_id: companyId,
                role: 'membro'
            });

            toast.success("Empresa vinculada com sucesso!");
            fetchUserCompanies(user.id); // Refresh list
        } catch (error) {
            console.error("Erro ao vincular empresa:", error);
            toast.error("Erro ao vincular empresa.");
        } finally {
            setIsLinking(false);
        }
    };

    const handleCreateCompany = async () => {
        if (!newCompanyName.trim()) {
            toast.error("O nome da empresa é obrigatório.");
            return;
        }

        setIsLinking(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

            // 1. Criar a empresa
            const companyRes = await axios.post(`${apiUrl}/companies`, {
                name: newCompanyName,
                description: newCompanyDescription
            });

            const newCompanyId = companyRes.data.id;

            // 2. Vincular o usuário como DONO
            await axios.post(`${apiUrl}/user-companies`, {
                user_id: user.id,
                company_id: newCompanyId,
                role: 'dono'
            });

            toast.success("Empresa criada e vinculada com sucesso!");
            handleCloseModal();
            fetchUserCompanies(user.id); // Refresh list
        } catch (error) {
            console.error("Erro ao criar empresa:", error);
            const msg = error.response?.data?.error || "Erro ao criar empresa.";
            toast.error(msg);
        } finally {
            setIsLinking(false);
        }
    };

    const toggleTheme = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        localStorage.setItem('theme', newMode ? 'dark' : 'light');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        router.push('/login');
    };

    const handleCompanyClick = (companyId) => {
        router.push(`/admin/dashboard?company_id=${companyId}`);
    };

    const handleUnlinkCompany = async (e, linkId, companyName) => {
        e.stopPropagation(); // Prevents card click

        if (!window.confirm(`Tem certeza que deseja sair da empresa "${companyName}"?`)) {
            return;
        }

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            await axios.delete(`${apiUrl}/user-companies/${linkId}`);

            toast.success(`Você saiu da empresa ${companyName}.`);
            fetchUserCompanies(user.id); // Refresh list
        } catch (error) {
            console.error("Erro ao desvincular:", error);
            toast.error("Erro ao sair da empresa.");
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingWrapper}>
                <div className={styles.loadingSpinner}></div>
            </div>
        );
    }

    return (
        <div className={`${styles.container} ${isDarkMode ? styles.darkMode : ''}`}>
            <Head>
                <title>Minhas Empresas | AURA 8</title>
            </Head>

            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Olá, {user?.full_name || 'Usuário'}</h1>
                    <p className={styles.subtitle}>Selecione uma empresa para continuar</p>
                </div>
                <div className={styles.headerActions}>
                    <button
                        onClick={toggleTheme}
                        className={styles.themeButton}
                        title={isDarkMode ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
                    >
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button onClick={handleOpenModal} className={styles.linkButton}>
                        <Plus size={18} />
                        Criar Empresa
                    </button>
                    <button onClick={handleLogout} className={styles.logoutButton}>
                        <LogOut size={18} />
                        Sair
                    </button>
                </div>
            </header>

            <main className={styles.grid}>
                {companies.length > 0 ? (
                    companies.map((company) => (
                        <div
                            key={company.id}
                            className={`${styles.card} ${!company.isLinked ? styles.unlinkedCard : ''}`}
                            onClick={() => company.isLinked ? handleCompanyClick(company.id) : null}
                            style={{ cursor: company.isLinked ? 'pointer' : 'default' }}
                        >
                            <div className={styles.cardHeader}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                    <div className={styles.iconWrapper}>
                                        <Building2 size={24} />
                                    </div>
                                    <h2 className={styles.companyName}>{company.name}</h2>
                                </div>
                                {company.isLinked ? (
                                    <button
                                        onClick={(e) => handleUnlinkCompany(e, company.link_id, company.name)}
                                        className={styles.unlinkButton}
                                        title="Sair desta empresa"
                                    >
                                        <LogOut size={16} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={(e) => handleLinkQuickly(e, company.id)}
                                        className={styles.quickLinkButton}
                                        title="Vincular-se a esta empresa"
                                    >
                                        <Plus size={16} />
                                    </button>
                                )}
                            </div>
                            <p className={styles.companyDescription}>
                                {company.description || 'Sem descrição'}
                            </p>
                            {company.isLinked ? (
                                <div className={styles.roleTag}>
                                    <Briefcase size={14} style={{ display: 'inline', marginRight: '5px' }} />
                                    {company.role ? company.role.toUpperCase() : 'MEMBRO'}
                                </div>
                            ) : (
                                <button
                                    onClick={(e) => handleLinkQuickly(e, company.id)}
                                    className={styles.cardActionButton}
                                >
                                    Vincular agora
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    <div className={styles.emptyState}>
                        <Building2 size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <h3>Nenhuma empresa encontrada</h3>
                        <p>Você ainda não está vinculado a nenhuma empresa.</p>
                    </div>
                )}
            </main>

            {/* Modal de Criação */}
            <div className={`${styles.modalOverlay} ${isModalOpen ? styles.active : ''}`}>
                <div className={styles.modalContent}>
                    <div className={styles.modalHeader}>
                        <h2 className={styles.modalTitle}>Criar Nova Empresa</h2>
                        <button onClick={handleCloseModal} className={styles.closeButton}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className={styles.modalBody}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Nome da Empresa</label>
                            <input
                                type="text"
                                className={styles.select}
                                value={newCompanyName}
                                onChange={(e) => setNewCompanyName(e.target.value)}
                                placeholder="Digite o nome da empresa..."
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Descrição (Opcional)</label>
                            <textarea
                                className={styles.select}
                                style={{ minHeight: '100px', resize: 'vertical' }}
                                value={newCompanyDescription}
                                onChange={(e) => setNewCompanyDescription(e.target.value)}
                                placeholder="Uma breve descrição da empresa..."
                            />
                        </div>
                    </div>

                    <div className={styles.modalFooter}>
                        <button
                            onClick={handleCloseModal}
                            className={styles.cancelButton}
                            disabled={isLinking}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleCreateCompany}
                            className={styles.confirmButton}
                            disabled={isLinking || !newCompanyName.trim()}
                        >
                            {isLinking ? 'Criando...' : 'Criar Empresa'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
