import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function WorkingHoursSettings() {
    const { workingHours, updateWorkingHours } = useData();
    const [localHours, setLocalHours] = useState([]);

    useEffect(() => {
        if (workingHours) {
            // Sort by day_of_week
            setLocalHours([...workingHours].sort((a, b) => a.day_of_week - b.day_of_week));
        }
    }, [workingHours]);

    const handleChange = (id, field, value) => {
        setLocalHours(prev => prev.map(h => h.id === id ? { ...h, [field]: value } : h));
    };

    const handleSave = async (hour) => {
        await updateWorkingHours(hour);
        alert(`Horário de ${DAYS[hour.day_of_week]} atualizado!`);
    };

    if (localHours.length === 0) return <div className="container">Carregando horários...</div>;

    return (
        <div className="container fade-in">
            <header style={{ marginBottom: '2rem' }}>
                <Link to="/dashboard" className="btn btn-secondary text-sm" style={{ marginBottom: '1rem', display: 'inline-block' }}>&larr; Voltar para Painel</Link>
                <h1>Configurar Horários</h1>
                <p className="text-muted">Defina seus dias e horários de atendimento.</p>
            </header>

            <div className="card">
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {localHours.map(hour => (
                        <div key={hour.id} style={{
                            display: 'grid',
                            gridTemplateColumns: 'minmax(80px, 1fr) 1fr 1fr 1fr auto',
                            gap: '1rem',
                            alignItems: 'center',
                            padding: '1rem',
                            borderBottom: '1px solid var(--border-color)',
                            backgroundColor: hour.is_closed ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                            opacity: hour.is_closed ? 0.7 : 1
                        }}>
                            <div style={{ fontWeight: 'bold' }}>{DAYS[hour.day_of_week]}</div>

                            <div className="input-group" style={{ margin: 0 }}>
                                <input
                                    type="time"
                                    className="input"
                                    value={hour.start_time.slice(0, 5)} // format HH:MM
                                    onChange={(e) => handleChange(hour.id, 'start_time', e.target.value)}
                                    disabled={hour.is_closed}
                                />
                            </div>

                            <div style={{ textAlign: 'center' }}>até</div>

                            <div className="input-group" style={{ margin: 0 }}>
                                <input
                                    type="time"
                                    className="input"
                                    value={hour.end_time.slice(0, 5)}
                                    onChange={(e) => handleChange(hour.id, 'end_time', e.target.value)}
                                    disabled={hour.is_closed}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <label style={{ fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={hour.is_closed}
                                        onChange={(e) => handleChange(hour.id, 'is_closed', e.target.checked)}
                                    />
                                    Fechado
                                </label>
                                <button onClick={() => handleSave(hour)} className="btn btn-primary text-sm">Salvar</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
