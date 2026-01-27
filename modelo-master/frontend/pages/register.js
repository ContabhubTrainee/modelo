import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Mail, Lock, User, Eye, EyeOff, UserPlus, Check, X, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import styles from '../styles/Login.module.css'; // Reusing login styles

export default function Register() {
    const router = useRouter();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Validation states
    const [passwordValidation, setPasswordValidation] = useState({
        length: false,
        uppercase: false,
        special: false
    });

    const [isFormValid, setIsFormValid] = useState(false);

    useEffect(() => {
        // Password validation logic
        const length = password.length >= 8;
        const uppercase = /[A-Z]/.test(password);
        const special = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        setPasswordValidation({ length, uppercase, special });
        setIsFormValid(fullName.trim().length > 2 && email.includes('@') && length && uppercase && special);
    }, [password, email, fullName]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid) return;

        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await axios.post(`${apiUrl}/auth/register`, {
                full_name: fullName,
                email,
                password
            });

            setSuccess('Conta criada com sucesso! Redirecionando para o login...');
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao realizar cadastro. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <Head>
                <title>Cadastro | AURA 8</title>
            </Head>

            <div className={styles.loginCard}>
                <div className={styles.header}>
                    <div className={styles.logo}>
                        <Image
                            src="/img/logo-aura8-branca.png"
                            alt="Aura8"
                            width={160}
                            height={36}
                            priority
                        />
                    </div>
                    <h1 className={styles.title}>Crie sua conta</h1>
                    <p className={styles.subtitle}>Junte-se ao AURA 8 e automatize sua operação</p>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    {error && <div className={styles.errorMessage}>{error}</div>}
                    {success && <div style={{ color: '#22c55e', fontSize: '14px', marginBottom: '10px', textAlign: 'center' }}>{success}</div>}

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Nome Completo</label>
                        <div className={styles.inputWrapper}>
                            <User size={18} className={styles.inputIcon} />
                            <input
                                type="text"
                                placeholder="Seu nome"
                                className={styles.input}
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>E-mail</label>
                        <div className={styles.inputWrapper}>
                            <Mail size={18} className={styles.inputIcon} />
                            <input
                                type="email"
                                placeholder="seu@email.com"
                                className={styles.input}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Senha</label>
                        <div className={styles.inputWrapper}>
                            <Lock size={18} className={styles.inputIcon} />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className={`${styles.input} ${!passwordValidation.length && password.length > 0 ? styles.inputError : ''}`}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className={styles.togglePassword}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {/* Validation indicators */}
                        <div className={styles.validationList}>
                            <div className={`${styles.validationItem} ${passwordValidation.length ? styles.validationValid : styles.validationInvalid}`}>
                                {passwordValidation.length ? <Check size={12} /> : <X size={12} />}
                                Mínimo de 8 caracteres
                            </div>
                            <div className={`${styles.validationItem} ${passwordValidation.uppercase ? styles.validationValid : styles.validationInvalid}`}>
                                {passwordValidation.uppercase ? <Check size={12} /> : <X size={12} />}
                                Pelo menos uma letra maiúscula
                            </div>
                            <div className={`${styles.validationItem} ${passwordValidation.special ? styles.validationValid : styles.validationInvalid}`}>
                                {passwordValidation.special ? <Check size={12} /> : <X size={12} />}
                                Pelo menos um caractere especial
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={!isFormValid || isLoading}
                    >
                        {isLoading ? (
                            <div className={styles.loadingSpinner}></div>
                        ) : (
                            <>
                                <UserPlus size={20} />
                                Criar conta grátis
                            </>
                        )}
                    </button>
                </form>

                <div className={styles.footer}>
                    Já tem uma conta?
                    <Link href="/login" className={styles.registerLink}>
                        Fazer login
                    </Link>
                </div>

                <Link href="/" className={styles.backLink} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px', color: '#94a3b8', fontSize: '14px', gap: '5px', textDecoration: 'none' }}>
                    <ArrowLeft size={16} /> Voltar para o início
                </Link>
            </div>
        </div>
    );
}
