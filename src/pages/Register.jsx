import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: ''
    });
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password.length > 8) {
            setError("A senha deve ter no máximo 8 caracteres.");
            return;
        }
        const result = await register(formData);
        if (result.success) {
            navigate('/booking'); // Default to booking for new clients
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '400px', marginTop: '2rem' }}>
            <div className="card fade-in" style={{ textAlign: 'center' }}>
                <img src="/logo.jpg" alt="Logo" style={{ maxWidth: '150px', marginBottom: '1rem', borderRadius: '50%' }} />
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Criar Conta</h2>

                {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="label">Nome Completo</label>
                        <input
                            name="name"
                            type="text"
                            className="input"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label className="label">Email</label>
                        <input
                            name="email"
                            type="email"
                            className="input"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label className="label">Telefone</label>
                        <input
                            name="phone"
                            type="tel"
                            className="input"
                            placeholder="(00) 00000-0000"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label className="label">Senha (máx 8 dígitos)</label>
                        <input
                            name="password"
                            type="password"
                            className="input"
                            value={formData.password}
                            onChange={handleChange}
                            maxLength={8}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-full">Cadastrar</button>
                </form>

                <div style={{ marginTop: '1rem', textAlign: 'center' }} className="text-sm text-muted">
                    Já tem conta? <Link to="/login" style={{ color: 'var(--accent-primary)' }}>Entrar</Link>
                </div>
            </div>
        </div>
    );
}
