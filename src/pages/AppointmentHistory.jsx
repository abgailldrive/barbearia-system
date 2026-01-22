import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import { formatDate } from '../utils/dateUtils';

export default function AppointmentHistory() {
    const { appointments } = useData();
    const [filterDate, setFilterDate] = useState('');

    // Filter appointments for the past
    const history = useMemo(() => {
        const now = new Date();
        // Reset today to midnight to consider things strictly 'past' days or just past times?
        // Usually history implies completed or past days.
        // Let's show everything up to yesterday OR today if time has passed?
        // Simpler: Date < Today
        
        const todayStr = formatDate(now);
        
        let filtered = appointments.filter(a => {
            return a.date < todayStr || (a.date === todayStr && a.status === 'completed'); // Or just date based
        });

        // Current decision: Show all appointments where date < today OR status is completed/cancelled
        filtered = appointments.filter(a => {
            const isPastDate = a.date < todayStr;
             // If today, only show if status is explicitly final (optional logic)
             // Let's stick to "Past Dates" for simplicity of "History" vs "Agenda"
            return isPastDate;
        });

        if (filterDate) {
            filtered = filtered.filter(a => a.date === filterDate);
        }

        // Sort descending (newest first)
        return filtered.sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
    }, [appointments, filterDate]);

    const stats = useMemo(() => {
        const completed = history.filter(a => a.status !== 'cancelled');
        const revenue = completed.reduce((sum, a) => sum + Number(a.price), 0);
        return { count: completed.length, revenue };
    }, [history]);

    return (
        <div className="container fade-in">
             <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <Link to="/dashboard" className="btn btn-secondary text-sm" style={{ marginBottom: '1rem', display: 'inline-block' }}>&larr; Voltar para Painel</Link>
                    <h1>Histórico de Agendamentos</h1>
                </div>
            </header>

            <div className="card" style={{ marginBottom: '2rem', display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <div>
                   <label className="label">Filtrar por Data</label>
                   <input type="date" className="input" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <div className="text-muted">Total Realizado</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>R$ {stats.revenue.toFixed(2)}</div>
                    <div className="text-sm text-muted">{stats.count} cortes</div>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                        <tr>
                            <th style={{ padding: '1rem' }}>Data</th>
                            <th style={{ padding: '1rem' }}>Horário</th>
                            <th style={{ padding: '1rem' }}>Cliente</th>
                            <th style={{ padding: '1rem' }}>Serviço</th>
                            <th style={{ padding: '1rem' }}>Valor</th>
                            <th style={{ padding: '1rem' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.length > 0 ? (
                            history.map(appt => (
                                <tr key={appt.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem' }}>{new Date(appt.date + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                                    <td style={{ padding: '1rem' }}>{appt.time}</td>
                                    <td style={{ padding: '1rem', fontWeight: '500' }}>{appt.client_name}</td>
                                    <td style={{ padding: '1rem' }}>{appt.service_name}</td>
                                    <td style={{ padding: '1rem' }}>R$ {Number(appt.price).toFixed(2)}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ 
                                            padding: '0.25rem 0.5rem', 
                                            borderRadius: '4px',
                                            fontSize: '0.8rem',
                                            backgroundColor: appt.status === 'cancelled' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                                            color: appt.status === 'cancelled' ? 'var(--danger)' : 'var(--success)'
                                        }}>
                                            {appt.status === 'cancelled' ? 'Cancelado' : 'Realizado'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    Nenhum histórico encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
