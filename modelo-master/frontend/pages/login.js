import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Mail, Lock, Eye, EyeOff, LogIn, Check, X, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import styles from '../styles/Login.module.css';

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

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
        setIsFormValid(email.includes('@') && length && uppercase && special);
    }, [password, email]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid) return;

        setIsLoading(true);
        setError('');

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await axios.post(`${apiUrl}/auth/login`, {
                email,
                password
            });

            if (response.status === 200) {
                const data = response.data;
                localStorage.setItem('token', data.token);
                localStorage.setItem('userData', JSON.stringify(data.user));
                toast.success('Login realizado com sucesso!');

                // Redirecionamento baseado no cargo (role)
                // Se o usuário pedir, redireciona para a lista de empresas
                router.push('/minhas-empresas');
            }
        } catch (err) {
            console.log('Erro no login:', err);
            const errorMessage = err.response?.data?.error || 'E-mail ou senha inválidos.';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <Head>
                <title>Login | AURA 8</title>
            </Head>

            <div className={styles.loginCard}>
                <div className={styles.header}>
                    <div className={styles.logo}>
                        <Image
                            src="/img/logo-aura8-new.png"
                            alt="Aura8"
                            width={180}
                            height={120}
                            style={{ objectFit: 'contain' }}
                            priority
                        />
                    </div>
                    <h1 className={styles.title}>Bem-vindo de volta</h1>
                    <p className={styles.subtitle}>Acesse sua conta para continuar</p>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
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
                        <Link href="/recuperar-senha" className={styles.forgotPassword}>
                            Esqueceu a senha?
                        </Link>

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
                                <LogIn size={20} />
                                Entrar na conta
                            </>
                        )}
                    </button>
                </form>

                <div className={styles.footer}>
                    Não tem uma conta?
                    <Link href="/register" className={styles.registerLink}>
                        Cadastre-se grátis
                    </Link>
                </div>

                <Link href="/" className={styles.backLink} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px', color: '#94a3b8', fontSize: '14px', gap: '5px', textDecoration: 'none' }}>
                    <ArrowLeft size={16} /> Voltar para o início
                </Link>
            </div>
        </div>
    );
}
