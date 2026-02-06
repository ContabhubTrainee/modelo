import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
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
    ChevronDown
} from 'lucide-react';

export default function NotesPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('todos');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    return (
        <div style={{ background: '#0f172a', minHeight: '100vh', color: '#fff', padding: '40px' }}>
            <Head>
                <title>Meu Diário | AURA 8</title>
            </Head>

            {/* Header Section */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <button
                        onClick={() => router.back()}
                        style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Meu Diário</h1>
                            <div style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>Organize suas anotações, metas e lembretes em um só lugar</div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
                        <Plus size={18} /> Anotação
                    </button>
                    <button style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
                        <Plus size={18} /> Meta
                    </button>
                    <button style={{ background: '#d946ef', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
                        <Plus size={18} /> Lembrete
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div style={{ marginBottom: '32px' }}>
                <div style={{ position: 'relative', marginBottom: '24px' }}>
                    <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px 16px 16px 50px', color: '#fff', fontSize: '16px' }}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {[
                            { id: 'todos', label: 'Todos' },
                            { id: 'anotacoes', label: 'Anotações', icon: BookOpen },
                            { id: 'metas', label: 'Metas', icon: Target },
                            { id: 'lembretes', label: 'Lembretes', icon: Bell }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    background: activeTab === tab.id ? '#10b981' : 'transparent',
                                    color: activeTab === tab.id ? '#fff' : '#94a3b8',
                                    border: activeTab === tab.id ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontWeight: '500',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {tab.icon && <tab.icon size={16} />}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            Todos os meses <ChevronDown size={16} />
                        </button>
                        <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            Todos os anos <ChevronDown size={16} />
                        </button>
                        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '2px' }}>
                            <button
                                onClick={() => setViewMode('grid')}
                                style={{ background: viewMode === 'grid' ? '#10b981' : 'transparent', border: 'none', color: '#fff', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}
                            >
                                <LayoutGrid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                style={{ background: viewMode === 'list' ? '#10b981' : 'transparent', border: 'none', color: '#fff', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}
                            >
                                <List size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Empty State */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                    <Calendar size={40} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>Nenhum item encontrado</h3>
                <p>Comece criando sua primeira anotação, meta ou lembrete.</p>
            </div>
        </div>
    );
}
