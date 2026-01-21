import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await login(email, password);
        if (result.success) {
            if (result.user?.role === 'admin' || result.user?.role === 'barber') {
                navigate('/dashboard');
            } else {
                navigate('/booking');
            }
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '400px', marginTop: '4rem' }}>
            <div className="card fade-in">
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Bem-vindo de volta</h2>

                {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="label">Email</label>
                        <input
                            type="email"
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label className="label">Senha</label>
                        <input
                            type="password"
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            maxLength={8}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-full">Entrar</button>
                </form>

                <div style={{ marginTop: '1rem', textAlign: 'center' }} className="text-sm text-muted">
                    Não tem uma conta? <Link to="/register" style={{ color: 'var(--accent-primary)' }}>Cadastre-se</Link>
                </div>
            </div>
        </div>
    );
}
