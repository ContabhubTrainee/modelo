import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Building2, LogOut, Briefcase, Plus, X } from 'lucide-react';
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
    const [availableCompanies, setAvailableCompanies] = useState([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState('');
    const [isLinking, setIsLinking] = useState(false);

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
    }, []);

    const fetchUserCompanies = async (userId) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

            const response = await axios.get(`${apiUrl}/user-companies?user_id=${userId}`);
            const links = response.data;

            const companiesWithDetails = await Promise.all(links.map(async (link) => {
                try {
                    const companyRes = await axios.get(`${apiUrl}/companies/${link.company_id}`);
                    return {
                        ...companyRes.data,
                        role: link.role,
                        link_id: link.id
                    };
                } catch (err) {
                    console.error(`Erro ao buscar empresa ${link.company_id}:`, err);
                    return null;
                }
            }));

            setCompanies(companiesWithDetails.filter(c => c !== null));
        } catch (error) {
            console.error('Erro ao buscar empresas:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableCompanies = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await axios.get(`${apiUrl}/companies`);
            // Filtra empresas que o usuário JÁ tem vínculo
            const linkedIds = companies.map(c => c.id);
            const available = response.data.filter(c => !linkedIds.includes(c.id));
            setAvailableCompanies(available);
        } catch (error) {
            console.error("Erro ao buscar empresas disponíveis:", error);
            toast.error("Não foi possível carregar as empresas.");
        }
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
        fetchAvailableCompanies();
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCompanyId('');
    };

    const handleLinkCompany = async () => {
        if (!selectedCompanyId) return;

        setIsLinking(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

            await axios.post(`${apiUrl}/user-companies`, {
                user_id: user.id,
                company_id: selectedCompanyId,
                role: 'visitante' // Default role
            });

            toast.success("Empresa vinculada com sucesso!");
            handleCloseModal();
            fetchUserCompanies(user.id); // Refresh list
        } catch (error) {
            console.error("Erro ao vincular empresa:", error);
            const msg = error.response?.data?.error || "Erro ao vincular empresa.";
            toast.error(msg);
        } finally {
            setIsLinking(false);
        }
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
        <div className={styles.container}>
            <Head>
                <title>Minhas Empresas | AURA 8</title>
            </Head>

            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Olá, {user?.full_name || 'Usuário'}</h1>
                    <p className={styles.subtitle}>Selecione uma empresa para continuar</p>
                </div>
                <div className={styles.headerActions}>
                    <button onClick={handleOpenModal} className={styles.linkButton}>
                        <Plus size={18} />
                        Vincular Empresa
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
                            key={company.link_id}
                            className={styles.card}
                            onClick={() => handleCompanyClick(company.id)}
                        >
                            <div className={styles.cardHeader}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                    <div className={styles.iconWrapper}>
                                        <Building2 size={24} />
                                    </div>
                                    <h2 className={styles.companyName}>{company.name}</h2>
                                </div>
                                <button
                                    onClick={(e) => handleUnlinkCompany(e, company.link_id, company.name)}
                                    className={styles.unlinkButton}
                                    title="Sair desta empresa"
                                >
                                    <LogOut size={16} />
                                </button>
                            </div>
                            <p style={{ color: '#64748b', marginBottom: '1rem', fontSize: '0.9rem' }}>
                                {company.description || 'Sem descrição'}
                            </p>
                            <div className={styles.roleTag}>
                                <Briefcase size={14} style={{ display: 'inline', marginRight: '5px' }} />
                                {company.role ? company.role.toUpperCase() : 'MEMBRO'}
                            </div>
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

            {/* Modal */}
            <div className={`${styles.modalOverlay} ${isModalOpen ? styles.active : ''}`}>
                <div className={styles.modalContent}>
                    <div className={styles.modalHeader}>
                        <h2 className={styles.modalTitle}>Vincular Nova Empresa</h2>
                        <button onClick={handleCloseModal} className={styles.closeButton}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className={styles.modalBody}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Selecione a empresa</label>
                            <select
                                className={styles.select}
                                value={selectedCompanyId}
                                onChange={(e) => setSelectedCompanyId(e.target.value)}
                            >
                                <option value="">Selecione...</option>
                                {availableCompanies.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                            {availableCompanies.length === 0 && (
                                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
                                    Nenhuma nova empresa disponível para vincular.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className={styles.modalFooter}>
                        <button onClick={handleCloseModal} className={styles.cancelButton}>
                            Cancelar
                        </button>
                        <button
                            onClick={handleLinkCompany}
                            className={styles.confirmButton}
                            disabled={!selectedCompanyId || isLinking}
                        >
                            {isLinking ? 'Vinculando...' : 'Vincular'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
