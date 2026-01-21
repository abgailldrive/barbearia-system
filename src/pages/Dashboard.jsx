import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { getDayName, formatDate } from '../utils/dateUtils';
import NotificationBell from '../components/NotificationBell';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const { appointments, getAppointmentsByDate } = useData();
    const [todayDate, setTodayDate] = useState(formatDate(new Date()));
    const [todayAppointments, setTodayAppointments] = useState([]);
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [stats, setStats] = useState({ today: 0, count: 0 });

    useEffect(() => {
        // Daily View
        const appts = getAppointmentsByDate(todayDate);
        appts.sort((a, b) => a.time.localeCompare(b.time));
        setTodayAppointments(appts);

        // Calc Stats
        const totalValue = appts.reduce((sum, a) => sum + parseFloat(a.price), 0);
        setStats({ today: totalValue, count: appts.length });

        // Upcoming (Future from now)
        const now = new Date();
        const future = appointments.filter(a => {
            const apptDate = new Date(a.date + 'T' + a.time);
            return apptDate > now && a.status !== 'cancelled';
        });
        // Sort by date then time
        future.sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            return a.time.localeCompare(b.time);
        });
        // Take next 5
        setUpcomingAppointments(future.slice(0, 5));

    }, [todayDate, appointments]);

    return (
        <div className="container fade-in">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Painel do Barbeiro</h1>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <NotificationBell />
                    <Link to="/profile" style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                            {user?.avatar ? <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>{user?.name?.charAt(0)}</span>}
                        </div>
                    </Link>
                    <button onClick={logout} className="btn btn-secondary text-sm">Sair</button>
                </div>
            </header>

            <div className="input-group" style={{ maxWidth: '200px' }}>
                <input
                    type="date"
                    className="input"
                    value={todayDate}
                    onChange={(e) => setTodayDate(e.target.value)}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card">
                    <h3>Ganhos ({getDayName(todayDate)})</h3>
                    <p style={{ fontSize: '2rem', marginTop: '0.5rem', color: 'var(--success)' }}>
                        R$ {stats.today.toFixed(2)}
                    </p>
                </div>
                <div className="card">
                    <h3>Agendamentos</h3>
                    <p style={{ fontSize: '2rem', marginTop: '0.5rem', color: 'var(--accent-primary)' }}>
                        {stats.count}
                    </p>
                </div>
                <div className="card">
                    <h3>Ações Rápidas</h3>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                        <Link to="/services" className="btn btn-secondary btn-full">Gerenciar Serviços</Link>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {/* Upcoming List */}
                <div className="card">
                    <h3>Próximos Clientes</h3>
                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {upcomingAppointments.length > 0 ? (
                            upcomingAppointments.map(appt => (
                                <div key={appt.id} style={{
                                    padding: '0.8rem',
                                    borderLeft: '4px solid var(--text-secondary)',
                                    backgroundColor: 'var(--bg-secondary)',
                                    borderRadius: 'var(--radius-sm)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: '600' }}>{getDayName(appt.date)} • {appt.time}</div>
                                        <div className="text-muted text-sm">{appt.service_name} • {appt.client_name}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted text-sm">Sem agendamentos futuros.</p>
                        )}
                    </div>
                </div>

                {/* Daily Agenda */}
                <div className="card">
                    <h3>Agenda: {getDayName(todayDate)}</h3>

                    <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {todayAppointments.length > 0 ? (
                            todayAppointments.map(appt => (
                                <div key={appt.id} style={{
                                    padding: '1rem',
                                    borderLeft: '4px solid var(--accent-primary)',
                                    backgroundColor: 'var(--bg-secondary)',
                                    borderRadius: 'var(--radius-sm)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{appt.time}</div>
                                        <div className="text-muted">{appt.service_name} ({appt.duration} min)</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: '600' }}>{appt.client_name}</div>
                                        <div className="text-muted text-sm">R$ {parseFloat(appt.price).toFixed(2)}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted" style={{ padding: '2rem', textAlign: 'center' }}>
                                Nenhum agendamento para este dia.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
