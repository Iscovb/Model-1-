export interface NYTimeStatus {
  formattedTime: string;
  formattedDate: string;
  hour: number;
  minute: number;
  second: number;
  dayOfWeek: number;
  isMarketOpen: boolean;
  isWeekendMarketClosed: boolean;
  marketCloseNote?: string;
  activeSession: {
    name: string;
    openTime: string;
    description: string;
  };
  isPurgeWindow: boolean;
  activePurgeName: string | null;
  nextPurgeDescription: string;
  eatFormattedTime: string;
}

export function getNYTimeStatus(): NYTimeStatus {
  // Use Intl to get New York time
  const now = new Date();
  const nyString = now.toLocaleString('en-US', { timeZone: 'America/New_York' });
  const nyDate = new Date(nyString);

  const hour = nyDate.getHours();
  const minute = nyDate.getMinutes();
  const second = nyDate.getSeconds();
  const dayOfWeek = nyDate.getDay(); // 0 = Sunday, 1 = Monday, ... 5 = Friday, 6 = Saturday

  const formattedTime = nyDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const formattedDate = nyDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const eatFormattedTime = now.toLocaleTimeString('en-US', {
    timeZone: 'Africa/Mogadishu',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  // Market Weekend Schedule Rule:
  // Laga bilaabo 16:00 Jimcada ilaa 17:00 Axadda New York time suuqu waa xiran yahay
  const isWeekendMarketClosed =
    (dayOfWeek === 5 && hour >= 16) || // Jimco laga bilaabo 16:00 NY
    dayOfWeek === 6 ||                 // Sabti oo dhan (24h)
    (dayOfWeek === 0 && hour < 17);    // Axad illaa 17:00 NY

  const isMarketOpen = !isWeekendMarketClosed;

  // 7H Session Candles:
  // Asia opens 17:00 NY
  // London opens 00:00 NY
  // NY opens 07:00 NY
  let activeSession = {
    name: 'Asia Session',
    openTime: '17:00 NY',
    description: '7H Candle furmay 17:00 NY',
  };

  if (isWeekendMarketClosed) {
    activeSession = {
      name: 'Suuqu Waa Xiran Yahay (Weekend)',
      openTime: 'Axad 17:00 NY',
      description: 'Suuqu wuxuu xiran yahay Jimco 16:00 NY ilaa Axad 17:00 NY',
    };
  } else if (hour >= 0 && hour < 7) {
    activeSession = {
      name: 'London Session',
      openTime: '00:00 NY',
      description: '7H Candle furmay 00:00 NY',
    };
  } else if (hour >= 7 && hour < 17) {
    activeSession = {
      name: 'New York Session',
      openTime: '07:00 NY',
      description: '7H Candle furmay 07:00 NY',
    };
  } else {
    activeSession = {
      name: 'Asia Session',
      openTime: '17:00 NY',
      description: '7H Candle furmay 17:00 NY',
    };
  }

  // Purge windows in NY Time (Only active when market is open):
  // 1) 08:00 - 10:00 NY (Main NY Purge)
  // 2) 02:00 - 03:00 NY (London Purge)
  // 3) 20:00 - 22:00 NY (Asia / Late Purge)
  // 4) 06:00 - 08:00 NY (Pre-NY Purge)
  let isPurgeWindow = false;
  let activePurgeName: string | null = null;
  let nextPurgeDescription = 'Purge xiga: 8:00am NY';

  const timeInMinutes = hour * 60 + minute;

  if (isWeekendMarketClosed) {
    isPurgeWindow = false;
    activePurgeName = null;
    nextPurgeDescription = 'Suuqu wuxuu furmayaa Axadda 17:00 NY (Asia Open)';
  } else if (timeInMinutes >= 8 * 60 && timeInMinutes < 10 * 60) {
    isPurgeWindow = true;
    activePurgeName = 'NY Prime Purge (8:00am - 10:00am NY)';
    nextPurgeDescription = 'Dhamaadka Purge-ka: 10:00am NY';
  } else if (timeInMinutes >= 6 * 60 && timeInMinutes < 8 * 60) {
    isPurgeWindow = true;
    activePurgeName = 'Pre-NY Purge (6:00am - 8:00am NY)';
    nextPurgeDescription = 'U gudubka NY Purge: 8:00am NY';
  } else if (timeInMinutes >= 2 * 60 && timeInMinutes < 3 * 60) {
    isPurgeWindow = true;
    activePurgeName = 'London Purge (2:00am - 3:00am NY)';
    nextPurgeDescription = 'Dhamaadka Purge-ka: 3:00am NY';
  } else if (timeInMinutes >= 20 * 60 && timeInMinutes < 22 * 60) {
    isPurgeWindow = true;
    activePurgeName = 'Asia/Night Purge (8:00pm - 10:00pm NY)';
    nextPurgeDescription = 'Dhamaadka Purge-ka: 10:00pm NY';
  } else {
    if (timeInMinutes < 2 * 60) {
      nextPurgeDescription = 'Purge xiga: London Purge (2:00am NY)';
    } else if (timeInMinutes < 6 * 60) {
      nextPurgeDescription = 'Purge xiga: Pre-NY Purge (6:00am NY)';
    } else if (timeInMinutes < 8 * 60) {
      nextPurgeDescription = 'Purge xiga: NY Prime Purge (8:00am NY)';
    } else if (timeInMinutes < 20 * 60) {
      nextPurgeDescription = 'Purge xiga: Night Purge (8:00pm NY)';
    } else {
      nextPurgeDescription = 'Purge xiga: London Purge (2:00am NY)';
    }
  }

  return {
    formattedTime,
    formattedDate,
    hour,
    minute,
    second,
    dayOfWeek,
    isMarketOpen,
    isWeekendMarketClosed,
    marketCloseNote: isWeekendMarketClosed
      ? 'Suuqu waa xiran yahay: Jimco 16:00 NY ilaa Axad 17:00 NY'
      : undefined,
    activeSession,
    isPurgeWindow,
    activePurgeName,
    nextPurgeDescription,
    eatFormattedTime,
  };
}
