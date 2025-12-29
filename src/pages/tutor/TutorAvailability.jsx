/**
 * Tutor Availability
 * Manage weekly availability slots
 */

import React, { useState, useEffect } from 'react';
import { tutorsApi } from '../../api/tutors';
import {
  Loader2, AlertCircle, Save, Plus, Trash2, Clock, CheckCircle
} from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_OPTIONS = [];
for (let h = 6; h <= 22; h++) {
  for (let m = 0; m < 60; m += 30) {
    const hour = h.toString().padStart(2, '0');
    const min = m.toString().padStart(2, '0');
    TIME_OPTIONS.push(`${hour}:${min}`);
  }
}

function TutorAvailability() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const res = await tutorsApi.getAvailability();
      setSlots(res.availability || []);
    } catch (err) {
      setError(err.message || 'Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const addSlot = (dayOfWeek) => {
    setSlots([...slots, { dayOfWeek, startTime: '09:00', endTime: '17:00', isNew: true }]);
  };

  const updateSlot = (index, field, value) => {
    const updated = [...slots];
    updated[index] = { ...updated[index], [field]: value };
    setSlots(updated);
  };

  const removeSlot = (index) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const formattedSlots = slots.map(s => ({
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
      }));
      await tutorsApi.setAvailability(formattedSlots);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      fetchAvailability();
    } catch (err) {
      setError(err.message || 'Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  const getSlotsByDay = (dayIndex) => {
    return slots
      .map((slot, index) => ({ ...slot, originalIndex: index }))
      .filter(slot => slot.dayOfWeek === dayIndex);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 size={40} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Availability</h1>
          <p className="text-gray-500">Set your weekly schedule for tutoring sessions</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Save Changes
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} className="text-red-500" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <CheckCircle size={20} className="text-green-500" />
          <p className="text-green-700">Availability saved successfully!</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {DAYS.map((day, dayIndex) => {
          const daySlots = getSlotsByDay(dayIndex);
          return (
            <div key={day} className="border-b last:border-b-0">
              <div className="flex items-start gap-4 p-4">
                <div className="w-28 flex-shrink-0">
                  <p className="font-medium text-gray-900">{day}</p>
                  <p className="text-sm text-gray-500">{daySlots.length} slot{daySlots.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex-1">
                  {daySlots.length > 0 ? (
                    <div className="space-y-2">
                      {daySlots.map((slot) => (
                        <div key={slot.originalIndex} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <Clock size={18} className="text-gray-400" />
                          <select
                            value={slot.startTime}
                            onChange={(e) => updateSlot(slot.originalIndex, 'startTime', e.target.value)}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                          >
                            {TIME_OPTIONS.map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                          <span className="text-gray-500">to</span>
                          <select
                            value={slot.endTime}
                            onChange={(e) => updateSlot(slot.originalIndex, 'endTime', e.target.value)}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                          >
                            {TIME_OPTIONS.map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => removeSlot(slot.originalIndex)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 py-2">No availability set</p>
                  )}
                  <button
                    onClick={() => addSlot(dayIndex)}
                    className="mt-2 flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    <Plus size={16} /> Add time slot
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-indigo-50 rounded-xl">
        <p className="text-sm text-indigo-700">
          <strong>Note:</strong> Times are in your local timezone. Students will see these times converted to their timezone when booking.
        </p>
      </div>
    </div>
  );
}

export default TutorAvailability;
