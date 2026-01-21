import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { getDayName } from '../utils/dateUtils';

export default function Profile() {
    const { user, updateUser, logout } = useAuth();
    const { getAppointmentsByClient, cancelAppointment } = useData();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        password: user?.password || '',
    });
    const [avatar, setAvatar] = useState(user?.avatar || null);
    const [msg, setMsg] = useState({ type: '', text: '' });
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const userAppointments = getAppointmentsByClient(user?.id);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setMsg({ type: '', text: '' });

        if (formData.password && formData.password.length > 8) {
            setMsg({ type: 'error', text: 'Senha deve ter no máximo 8 caracteres.' });
            return;
        }

        updateUser({
            ...formData,
            avatar: avatar
        });

        setMsg({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    };

    const handleCancel = (id) => {
        if (window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
            cancelAppointment(id);
        }
    }

    return (
        <div className="container" style={{ maxWidth: '600px', marginTop: '2rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <button onClick={() => navigate(-1)} className="btn btn-secondary">{'< Voltar'}</button>
                <h1>Meu Perfil</h1>
                <button onClick={logout} className="btn btn-secondary" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>Sair</button>
            </header>

            <div className="card fade-in" style={{ marginBottom: '2rem' }}>
                {msg.text && (
                    <div style={{
                        padding: '1rem',
                        marginBottom: '1rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: msg.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: msg.type === 'error' ? 'var(--danger)' : 'var(--success)',
                        textAlign: 'center'
                    }}>
                        {msg.text}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
                        <div
                            style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--bg-secondary)',
                                backgroundImage: `url(${avatar})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                border: '2px solid var(--accent-primary)',
                                marginBottom: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden'
                            }}
                        >
                            {!avatar && <span style={{ fontSize: '3rem', color: 'var(--text-secondary)' }}>{user?.name?.charAt(0)}</span>}
                        </div>
                        <button
                            type="button"
                            className="btn btn-secondary text-sm"
                            onClick={() => fileInputRef.current.click()}
                        >
                            Alterar Foto
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                    </div>

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
                        <label className="label">Telefone</label>
                        <input
                            name="phone"
                            type="tel"
                            className="input"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="label">Nova Senha</label>
                        <input
                            name="password"
                            type="text"
                            className="input"
                            value={formData.password}
                            onChange={handleChange}
                            maxLength={8}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-full">Salvar Alterações</button>
                </form>
            </div>

            <div className="card fade-in">
                <h3 style={{ marginBottom: '1rem' }}>Meus Agendamentos</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {userAppointments.length > 0 ? (
                        userAppointments.map(appt => (
                            <div key={appt.id} style={{
                                padding: '1rem',
                                backgroundColor: 'var(--bg-secondary)',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-color)',
                                opacity: appt.status === 'cancelled' ? 0.6 : 1
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{appt.serviceName}</div>
                                    <div style={{
                                        color: appt.status === 'cancelled' ? 'var(--danger)' : 'var(--success)',
                                        fontWeight: '500',
                                        textTransform: 'uppercase',
                                        fontSize: '0.8rem'
                                    }}>
                                        {appt.status === 'scheduled' ? 'Confirmado' : 'Cancelado'}
                                    </div>
                                </div>
                                <div className="text-muted text-sm" style={{ marginBottom: '0.5rem' }}>
                                    {getDayName(appt.date)} • {appt.time} ({appt.duration} min)
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div className="text-sm">R$ {parseFloat(appt.price).toFixed(2)}</div>
                                    {appt.status === 'scheduled' && (
                                        <button
                                            onClick={() => handleCancel(appt.id)}
                                            className="btn btn-secondary text-sm"
                                            style={{ padding: '0.25rem 0.5rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-muted">Você ainda não tem agendamentos.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
