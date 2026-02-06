import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Building2, LogOut, Briefcase } from 'lucide-react';
import axios from 'axios';
import styles from '../styles/MinhasEmpresas.module.css';

export default function MinhasEmpresas() {
    const router = useRouter();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

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

            // 1. Busca os vínculos
            const response = await axios.get(`${apiUrl}/user-companies?user_id=${userId}`);
            const links = response.data; // array de { id, user_id, company_id, role }

            // 2. Para cada vínculo, busca os detalhes da empresa
            // Nota: O ideal seria o backend já retornar tudo junto (JOIN), mas vamos fazer assim por enquanto para respeitar a estrutura atual.
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

            // Filtra possíveis nulos de erros
            setCompanies(companiesWithDetails.filter(c => c !== null));
        } catch (error) {
            console.error('Erro ao buscar empresas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        router.push('/login');
    };

    const handleCompanyClick = (companyId) => {
        // Redirecionar para o dashboard da empresa ou algo assim
        // Por enquanto, vamos apenas navegar para a home ou dashboard
        router.push(`/admin/dashboard?company_id=${companyId}`);
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
                <button onClick={handleLogout} className={styles.logoutButton}>
                    <LogOut size={18} />
                    Sair
                </button>
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
                                <div className={styles.iconWrapper}>
                                    <Building2 size={24} />
                                    - </div>
                                <h2 className={styles.companyName}>{company.name}</h2>
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
        </div>
    );
}
