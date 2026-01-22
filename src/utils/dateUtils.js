export const START_HOUR = 9; // Fallback
export const END_HOUR = 19; // Fallback
export const SLOT_INTERVAL = 30; // 30 mins

export const generateTimeSlots = (dateStr, appointments = [], duration = 30, workingHours = []) => {
    // dateStr: YYYY-MM-DD
    const slots = [];
    const date = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = date.getDay(); // 0 = Sunday

    // Find config for this day
    const dayConfig = workingHours.find(h => h.day_of_week === dayOfWeek);

    // If day is closed, return empty
    if (dayConfig && dayConfig.is_closed) {
        return [];
    }

    let startH = START_HOUR;
    let startM = 0;
    let endH = END_HOUR;
    let endM = 0;

    if (dayConfig) {
        // Parse "09:00:00"
        const [sH, sM] = dayConfig.start_time.split(':').map(Number);
        const [eH, eM] = dayConfig.end_time.split(':').map(Number);
        startH = sH;
        startM = sM;
        endH = eH;
        endM = eM;
    }

    // Start
    let current = new Date(date);
    current.setHours(startH, startM, 0, 0);

    const end = new Date(date);
    end.setHours(endH, endM, 0, 0);

    while (current < end) {
        const timeString = current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Calculate end time of this potential slot
        const slotEnd = new Date(current.getTime() + duration * 60000);

        if (slotEnd > end) break; // Don't go past closing time

        // Check collision
        const isTaken = appointments.some(appt => {
            const apptStart = new Date(dateStr + 'T' + appt.time);
            const apptEnd = new Date(apptStart.getTime() + appt.duration * 60000);

            // Check overlap
            // (StartA < EndB) and (EndA > StartB)
            return current < apptEnd && slotEnd > apptStart;
        });

        if (!isTaken) {
            slots.push(timeString);
        }

        // Increment
        current.setMinutes(current.getMinutes() + 30);
    }

    return slots;
};

export const formatDate = (date) => {
    return date.toISOString().split('T')[0];
};

export const getDayName = (dateStr) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
};
