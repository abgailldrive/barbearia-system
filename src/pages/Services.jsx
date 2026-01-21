import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';

export default function Services() {
    const { services, addService, updateService, deleteService } = useData();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [currentService, setCurrentService] = useState({ name: '', duration: 30, price: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        const serviceData = {
            ...currentService,
            price: parseFloat(currentService.price),
            duration: parseInt(currentService.duration)
        };

        if (isEditing) {
            updateService(serviceData);
        } else {
            addService(serviceData);
        }
        resetForm();
    };

    const handleEdit = (service) => {
        setCurrentService(service);
        setIsEditing(true);
        window.scrollTo(0, 0);
    };

    const handleDelete = (id) => {
        if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
            deleteService(id);
        }
    };

    const resetForm = () => {
        setCurrentService({ name: '', duration: 30, price: '' });
        setIsEditing(false);
    };

    return (
        <div className="container" style={{ marginTop: '2rem', maxWidth: '800px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">{'< Painel'}</button>
                <h1>Gerenciar Serviços</h1>
                <div style={{ width: '80px' }}></div> {/* Spacer */}
            </header>

            <div className="card fade-in" style={{ marginBottom: '2rem' }}>
                <h3>{isEditing ? 'Editar Serviço' : 'Novo Serviço'}</h3>
                <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div className="input-group">
                            <label className="label">Nome do Serviço</label>
                            <input
                                className="input"
                                value={currentService.name}
                                onChange={(e) => setCurrentService({ ...currentService, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label className="label">Duração (minutos)</label>
                            <select
                                className="input"
                                value={currentService.duration}
                                onChange={(e) => setCurrentService({ ...currentService, duration: e.target.value })}
                            >
                                <option value="10">10 min</option>
                                <option value="20">20 min</option>
                                <option value="30">30 min</option>
                                <option value="40">40 min</option>
                                <option value="45">45 min</option>
                                <option value="50">50 min</option>
                                <option value="60">60 min</option>
                                <option value="90">1h 30min</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label className="label">Preço (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="input"
                                value={currentService.price}
                                onChange={(e) => setCurrentService({ ...currentService, price: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" className="btn btn-primary">{isEditing ? 'Atualizar' : 'Adicionar'}</button>
                        {isEditing && <button type="button" onClick={resetForm} className="btn btn-secondary">Cancelar</button>}
                    </div>
                </form>
            </div>

            <div className="card fade-in">
                <h3 style={{ marginBottom: '1rem' }}>Serviços Ativos</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {services.map(service => (
                        <div key={service.id} style={{
                            padding: '1rem',
                            backgroundColor: 'var(--bg-secondary)',
                            borderRadius: 'var(--radius-sm)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            border: '1px solid var(--border-color)'
                        }}>
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{service.name}</div>
                                <div className="text-muted text-sm">{service.duration} min • R$ {parseFloat(service.price).toFixed(2)}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => handleEdit(service)} className="btn btn-secondary" style={{ padding: '0.5rem' }}>✏️</button>
                                <button onClick={() => handleDelete(service.id)} className="btn btn-secondary" style={{ padding: '0.5rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}>🗑️</button>
                            </div>
                        </div>
                    ))}
                    {services.length === 0 && <p className="text-muted">Nenhum serviço cadastrado.</p>}
                </div>
            </div>
        </div>
    );
}
