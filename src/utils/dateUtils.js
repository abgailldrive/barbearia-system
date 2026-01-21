export const START_HOUR = 9; // 9 AM
export const END_HOUR = 19; // 7 PM
export const SLOT_INTERVAL = 30; // 30 mins

export const generateTimeSlots = (dateStr, appointments = [], duration = 30) => {
    // dateStr: YYYY-MM-DD
    const slots = [];
    const date = new Date(dateStr + 'T00:00:00');

    // Start at START_HOUR
    let current = new Date(date);
    current.setHours(START_HOUR, 0, 0, 0);

    const end = new Date(date);
    end.setHours(END_HOUR, 0, 0, 0);

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

        // Increment by step (e.g. 15 or 30 mins) - for now using standard 30 min step for grid
        // BUT logic suggests "Smart Scheduling" means calculating gaps.
        // Let's increment by 30 mins for simplicity of the grid for now.
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
