import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { generateTimeSlots, formatDate, getDayName } from '../utils/dateUtils';

export default function Booking() {
    const { services, appointments, addAppointment, getBusyTimesByDate, getAppointmentsByClient, cancelAppointment } = useData();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
    const [selectedTime, setSelectedTime] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [successMsg, setSuccessMsg] = useState('');

    // User appointments for history view
    const userAppointments = getAppointmentsByClient(user?.id);

    useEffect(() => {
        if (selectedService && selectedDate) {
            // Use busy_times view data for availability
            const dayBusySlots = getBusyTimesByDate(selectedDate);
            const slots = generateTimeSlots(selectedDate, dayBusySlots, selectedService.duration);
            setAvailableSlots(slots);
        }
    }, [selectedService, selectedDate, appointments]);

    const handleServiceSelect = (service) => {
        setSelectedService(service);
        setStep(2);
    };

    const handleTimeSelect = (time) => {
        setSelectedTime(time);
        setStep(3);
    };

    const handleConfirm = () => {
        addAppointment({
            service_id: selectedService.id,
            service_name: selectedService.name,
            duration: selectedService.duration,
            price: selectedService.price,
            date: selectedDate,
            time: selectedTime,
            client_name: user.name,
            client_id: user.id,
        });

        // Webhook Notification
        fetch('https://jhonkley.app.n8n.cloud/webhook-test/progressive', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: user.name,
                phone: user.phone || 'N/A',
                email: user.email,
                date: selectedDate,
                time: selectedTime,
                service: selectedService.name
            })
        }).catch(err => console.error('Webhook Error:', err));

        setSuccessMsg('Agendamento Confirmado!');
        setTimeout(() => {
            setSuccessMsg('');
            setStep(1);
            setSelectedService(null);
            setSelectedTime(null);
            // navigate('/dashboard'); // Or stay here
        }, 3000);
    };

    const handleCancel = (id) => {
        if (window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
            cancelAppointment(id);
        }
    };

    const Step1 = () => (
        <div className="fade-in">
            <h3 style={{ marginBottom: '1rem' }}>Escolha um Serviço</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
                {services.map(service => (
                    <div key={service.id}
                        onClick={() => handleServiceSelect(service)}
                        style={{
                            padding: '1.5rem',
                            backgroundColor: 'var(--bg-secondary)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-color)',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'all 0.2s'
                        }}
                        className="hover-card"
                    >
                        <div>
                            <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{service.name}</div>
                            <div className="text-muted">{service.duration} min</div>
                        </div>
                        <div style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                            R$ {parseFloat(service.price).toFixed(2)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const Step2 = () => (
        <div className="fade-in">
            <div style={{ marginBottom: '1rem' }}>
                <button onClick={() => setStep(1)} className="btn btn-secondary text-sm">Voltar para Serviços</button>
            </div>

            <h3 style={{ marginBottom: '1rem' }}>Escolha o Horário</h3>
            <p className="text-muted" style={{ marginBottom: '1rem' }}>Para: {selectedService.name} ({selectedService.duration} min)</p>

            <div className="input-group">
                <label className="label">Data</label>
                <input
                    type="date"
                    className="input"
                    value={selectedDate}
                    min={formatDate(new Date())}
                    onChange={(e) => setSelectedDate(e.target.value)}
                />
            </div>

            <div style={{ marginBottom: '1rem', fontWeight: '500' }}>
                {getDayName(selectedDate)}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.5rem' }}>
                {availableSlots.map(time => (
                    <button
                        key={time}
                        onClick={() => handleTimeSelect(time)}
                        className="btn btn-secondary"
                        style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                    >
                        {time}
                    </button>
                ))}
                {availableSlots.length === 0 && <p className="text-muted">Sem horários disponíveis para esta data.</p>}
            </div>
        </div>
    );

    const Step3 = () => (
        <div className="fade-in">
            <div style={{ marginBottom: '1rem' }}>
                <button onClick={() => setStep(2)} className="btn btn-secondary text-sm">Alterar Horário</button>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                <h2 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>Confirmar Agendamento</h2>

                <div style={{ marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
                    <p><strong>Serviço:</strong> {selectedService.name}</p>
                    <p><strong>Data:</strong> {getDayName(selectedDate)}</p>
                    <p><strong>Horário:</strong> {selectedTime}</p>
                    <p><strong>Valor:</strong> R$ {parseFloat(selectedService.price).toFixed(2)}</p>
                </div>

                <button onClick={handleConfirm} className="btn btn-primary btn-full" style={{ fontSize: '1.2rem', padding: '1rem' }}>
                    Confirmar Agendamento
                </button>
            </div>
        </div>
    );

    return (
        <div className="container" style={{ maxWidth: '600px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Agendar</h1>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {(user?.role === 'admin' || user?.role === 'barber') && (
                        <Link to="/dashboard" className="btn btn-secondary text-sm">Painel</Link>
                    )}
                    <Link to="/profile" style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                            {user?.avatar ? <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>{user?.name?.charAt(0)}</span>}
                        </div>
                    </Link>
                    <button onClick={logout} className="btn btn-secondary text-sm">Sair</button>
                </div>
            </header>

            {successMsg ? (
                <div className="card fade-in" style={{ textAlign: 'center', padding: '3rem', color: 'var(--success)', marginBottom: '2rem' }}>
                    <h1>✅</h1>
                    <h2>{successMsg}</h2>
                    <p className="text-muted">Te esperamos lá!</p>
                </div>
            ) : (
                <div style={{ marginBottom: '3rem' }}>
                    {step === 1 && <Step1 />}
                    {step === 2 && <Step2 />}
                    {step === 3 && <Step3 />}
                </div>
            )}

            {/* Appointment History Section */}
            <div className="fade-in" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
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
                                    <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{appt.service_name}</div>
                                    <div style={{
                                        color: appt.status === 'cancelled' ? 'var(--danger)' : 'var(--success)',
                                        fontWeight: '500',
                                        textTransform: 'uppercase',
                                        fontSize: '0.75rem'
                                    }}>
                                        {appt.status === 'scheduled' ? 'Confirmado' : 'Cancelado'}
                                    </div>
                                </div>
                                <div className="text-muted text-sm" style={{ marginBottom: '0.5rem' }}>
                                    {getDayName(appt.date)} • {appt.time}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div className="text-sm">R$ {parseFloat(appt.price).toFixed(2)}</div>
                                    {appt.status === 'scheduled' && (
                                        <button
                                            onClick={() => handleCancel(appt.id)}
                                            className="btn btn-secondary text-sm"
                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-muted text-sm">Nenhum agendamento encontrado.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
