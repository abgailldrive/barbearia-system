import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    const { user } = useAuth();

    return (
        <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Progressive Barbearia</h1>
            <p className="text-muted" style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>
                Estilo e tradição na palma da sua mão.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                {user ? (
                    <Link to={user.role === 'admin' || user.role === 'barber' ? '/dashboard' : '/booking'} className="btn btn-primary">
                        Acessar Sistema
                    </Link>
                ) : (
                    <>
                        <Link to="/login" className="btn btn-primary">Entrar</Link>
                        <Link to="/register" className="btn btn-secondary">Cadastrar</Link>
                    </>
                )}
            </div>
        </div>
    );
}
