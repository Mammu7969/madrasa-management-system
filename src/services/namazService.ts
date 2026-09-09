import { MadrasaNamazTimings } from '../types';

export interface NextPrayerInfo {
  name: string;
  nameUrdu: string;
  targetType: 'Azan' | 'Jamat';
  timeStr: string;
  countdownStr: string;
  isClose: boolean; // less than 15 mins
}

// Convert "05:30 AM" or "01:30 PM" to minutes from midnight
function parseTimeToMinutes(timeStr: string): number {
  const parts = timeStr.trim().match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!parts) return 0;
  let hours = parseInt(parts[1], 10);
  const minutes = parseInt(parts[2], 10);
  const meridian = parts[3].toUpperCase();

  if (meridian === 'PM' && hours < 12) hours += 12;
  if (meridian === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

export function getNextPrayerCountdown(timings: MadrasaNamazTimings, now: Date = new Date()): NextPrayerInfo {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const prayerSchedule: Array<{ name: string; urdu: string; targetType: 'Azan' | 'Jamat'; timeStr: string; minutes: number }> = [
    { name: 'Fajr', urdu: 'فجر', targetType: 'Azan', timeStr: timings.fajr.azan, minutes: parseTimeToMinutes(timings.fajr.azan) },
    { name: 'Fajr', urdu: 'فجر', targetType: 'Jamat', timeStr: timings.fajr.jamat, minutes: parseTimeToMinutes(timings.fajr.jamat) },
    { name: 'Zohr', urdu: 'ظہر', targetType: 'Azan', timeStr: timings.zohr.azan, minutes: parseTimeToMinutes(timings.zohr.azan) },
    { name: 'Zohr', urdu: 'ظہر', targetType: 'Jamat', timeStr: timings.zohr.jamat, minutes: parseTimeToMinutes(timings.zohr.jamat) },
    { name: 'Asar', urdu: 'عصر', targetType: 'Azan', timeStr: timings.asar.azan, minutes: parseTimeToMinutes(timings.asar.azan) },
    { name: 'Asar', urdu: 'عصر', targetType: 'Jamat', timeStr: timings.asar.jamat, minutes: parseTimeToMinutes(timings.asar.jamat) },
    { name: 'Magrib', urdu: 'مغرب', targetType: 'Azan', timeStr: timings.magrib.azan, minutes: parseTimeToMinutes(timings.magrib.azan) },
    { name: 'Magrib', urdu: 'مغرب', targetType: 'Jamat', timeStr: timings.magrib.jamat, minutes: parseTimeToMinutes(timings.magrib.jamat) },
    { name: 'Isha', urdu: 'عشاء', targetType: 'Azan', timeStr: timings.isha.azan, minutes: parseTimeToMinutes(timings.isha.azan) },
    { name: 'Isha', urdu: 'عشاء', targetType: 'Jamat', timeStr: timings.isha.jamat, minutes: parseTimeToMinutes(timings.isha.jamat) },
  ];

  // Find next event today
  let next = prayerSchedule.find(p => p.minutes > currentMinutes);

  // If none remaining today, next is Fajr tomorrow
  let diffMinutes = 0;
  if (next) {
    diffMinutes = next.minutes - currentMinutes;
  } else {
    next = prayerSchedule[0]; // Fajr tomorrow
    diffMinutes = (24 * 60 - currentMinutes) + next.minutes;
  }

  const hours = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;
  const countdownStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return {
    name: next.name,
    nameUrdu: next.urdu,
    targetType: next.targetType,
    timeStr: next.timeStr,
    countdownStr,
    isClose: diffMinutes <= 15
  };
}
