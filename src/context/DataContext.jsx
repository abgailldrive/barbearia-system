import { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const [services, setServices] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [busySlots, setBusySlots] = useState([]); // View from 'public.busy_times'
    const [notifications, setNotifications] = useState([]);
    const [workingHours, setWorkingHours] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();

        // Realtime subscriptions
        const servicesSub = supabase
            .channel('public:services')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, fetchData)
            .subscribe();

        const appointmentsSub = supabase
            .channel('public:appointments')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, fetchData)
            .subscribe();

        const notificationsSub = supabase
            .channel('public:notifications')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, handleNotificationChange)
            .subscribe();

        const workingHoursSub = supabase
            .channel('public:working_hours')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'working_hours' }, fetchData)
            .subscribe();

        // We can't sub to Views directly usually, but if the underlying table changes, we might want to refresh.
        // Since we refresh ALL data on any change to appointments table, busySlots will update too.
        // So the appointmentsSub handles it.

        return () => {
            supabase.removeChannel(servicesSub);
            supabase.removeChannel(appointmentsSub);
            supabase.removeChannel(notificationsSub);
            supabase.removeChannel(workingHoursSub);
        };
    }, []);

    const fetchData = async () => {
        try {
            // Fetch Services
            const { data: servicesData } = await supabase.from('services').select('*').order('created_at');
            if (servicesData) setServices(servicesData);

            // Fetch Appointments (Respects RLS: Admin gets all, Client gets theirs)
            const { data: apptData } = await supabase.from('appointments').select('*');
            if (apptData) setAppointments(apptData);

            // Fetch Busy Times (Public View)
            const { data: busyData } = await supabase.from('busy_times').select('*');
            if (busyData) setBusySlots(busyData);

            // Fetch Notifications (Only for barbers implicitly via RLS)
            const { data: notifData } = await supabase
                .from('notifications')
                .select('*')
                .eq('read', false) // Only fetch unread for now
                .order('created_at', { ascending: false });

            if (notifData) setNotifications(notifData);

            // Fetch Working Hours
            const { data: hoursData } = await supabase.from('working_hours').select('*').order('day_of_week');
            if (hoursData) setWorkingHours(hoursData);

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationChange = (payload) => {
        if (payload.eventType === 'INSERT') {
            setNotifications(prev => [payload.new, ...prev]);
            // Optional: Play sound or toast here
        }
    };

    const markNotificationAsRead = async (id) => {
        const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
        if (!error) {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }
    };

    const updateWorkingHours = async (updatedHour) => {
        const { error } = await supabase.from('working_hours').update(updatedHour).eq('id', updatedHour.id);
        if (!error) {
            setWorkingHours(workingHours.map(h => h.id === updatedHour.id ? updatedHour : h));
        }
    };

    const addService = async (service) => {
        const { data, error } = await supabase.from('services').insert([service]).select();
        if (!error && data) {
            setServices([...services, data[0]]);
        }
    };

    const updateService = async (updatedService) => {
        const { error } = await supabase.from('services').update(updatedService).eq('id', updatedService.id);
        if (!error) {
            setServices(services.map(s => s.id === updatedService.id ? updatedService : s));
        }
    };

    const deleteService = async (id) => {
        const { error } = await supabase.from('services').delete().eq('id', id);
        if (!error) {
            setServices(services.filter(s => s.id !== id));
        }
    };

    const addAppointment = async (appointment) => {
        // Clean up object before sending
        const { id, ...apptData } = appointment;
        const { data, error } = await supabase.from('appointments').insert([apptData]).select();

        if (!error && data) {
            setAppointments([...appointments, data[0]]);
            // Optimistically update busySlots too? Or wait for refetch?
            // Refetch triggers automatically via subscription, so we wait.
            return data[0];
        } else {
            console.error("Error adding appointment:", error);
        }
    };

    const cancelAppointment = async (id) => {
        const { error } = await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id);
        if (!error) {
            setAppointments(appointments.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
        }
    };

    const getAppointmentsByDate = (dateStr) => {
        // For Dashboard (Barber uses this to see details)
        return appointments.filter(a => a.date === dateStr && a.status !== 'cancelled');
    };

    const getBusyTimesByDate = (dateStr) => {
        // For Booking Availability (Client uses this)
        return busySlots.filter(a => a.date === dateStr);
    };

    const getAppointmentsByClient = (clientId) => {
        return appointments.filter(a => a.client_id === clientId).sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            return a.time.localeCompare(b.time);
        });
    };

    return (
        <DataContext.Provider value={{
            services,
            appointments,
            busySlots,
            notifications,
            workingHours,
            loading,
            addService,
            updateService,
            deleteService,
            addAppointment,
            cancelAppointment,
            markNotificationAsRead,
            updateWorkingHours,
            getAppointmentsByDate,
            getBusyTimesByDate,
            getAppointmentsByClient
        }}>
            {!loading && children}
        </DataContext.Provider>
    );
};
