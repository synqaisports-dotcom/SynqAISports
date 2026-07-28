'use client';

import { cn } from '@/lib/utils';
import type { ComponentType, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

/** Balón de fútbol — asset vectorial real del usuario (Google Drive). */
export function FootballBallIcon({ className }: IconProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={SPONSOR_WALL_SPORT_ASSETS.football}
      alt=""
      aria-hidden
      draggable={false}
      className={className}
    />
  );
}

export function BasketballBallIcon({ className }: IconProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={SPONSOR_WALL_SPORT_ASSETS.basketball}
      alt=""
      aria-hidden
      draggable={false}
      className={className}
    />
  );
}

export function VolleyballBallIcon({ className }: IconProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={SPONSOR_WALL_SPORT_ASSETS.volleyball}
      alt=""
      aria-hidden
      draggable={false}
      className={className}
    />
  );
}

/** Balón de waterpolo — SVG inline (evita fallos de carga del asset estático). */
const WATERPOLO_BALL_PATH =
  'M 1846.859375 987.949219 C 1973.480469 1111.039062 2067.519531 1260.398438 2081.109375 1399.988281 C 2131.898438 1370.179688 2179.191406 1334.421875 2221.878906 1293.378906 C 2186.328125 1169.730469 2119.851562 1059.171875 2031.339844 970.660156 C 1895.621094 834.949219 1708.101562 751 1501 751 L 1480.21875 751.289062 C 1606.640625 796.53125 1738.898438 883 1846.859375 987.949219 Z M 1719.070312 1974.710938 C 1575.230469 1977.449219 1441.390625 1945.148438 1318.089844 1877.328125 C 1291.121094 1992.96875 1291.898438 2113.769531 1320.410156 2229.105469 C 1378.25 2243.410156 1438.730469 2251 1501 2251 C 1708.101562 2251 1895.621094 2167.046875 2031.339844 2031.335938 C 2078.199219 1984.46875 2118.890625 1931.441406 2152.078125 1873.539062 C 1999.421875 1938.261719 1854.929688 1972.140625 1719.070312 1974.710938 Z M 1907.25 1524.671875 C 1780.710938 1558.558594 1644.160156 1561.730469 1508.480469 1527.910156 C 1423.601562 1615.878906 1364.441406 1719.46875 1331.03125 1829.179688 C 1449.789062 1896.890625 1579.070312 1929.171875 1718.308594 1926.511719 C 1863.371094 1923.761719 2019.691406 1883.148438 2186.679688 1805.320312 C 2228.011719 1712.300781 2251 1609.339844 2251 1501 C 2251 1448.191406 2245.53125 1396.640625 2235.140625 1346.910156 C 2141.53125 1430.941406 2029 1492.058594 1907.25 1524.671875 Z M 1227.960938 1251.828125 C 1131.109375 1349.238281 1063.238281 1463.640625 1026.808594 1596.78125 C 989.085938 1734.601562 984.808594 1892.898438 1016.578125 2073.605469 C 1089.519531 2135.378906 1174.441406 2183.449219 1267.339844 2213.878906 C 1241.398438 2090.804688 1244.730469 1962.789062 1277.371094 1841.019531 L 1279.03125 1834.890625 L 1279.53125 1833.121094 C 1313.640625 1710.839844 1377.398438 1595.128906 1470.761719 1497.351562 C 1407.988281 1394.390625 1324.109375 1311.769531 1227.960938 1251.828125 Z M 980.320312 1584.109375 C 1017.921875 1446.699219 1086.878906 1328.199219 1184.828125 1226.890625 C 1080.101562 1170.910156 963.246094 1140.378906 844.519531 1138.050781 C 784.933594 1245.609375 751 1369.328125 751 1501 C 751 1702.339844 830.335938 1885.148438 959.449219 2019.871094 C 937.53125 1857.441406 945.128906 1712.648438 980.320312 1584.109375 Z M 1711.789062 1503.328125 C 1704.511719 1377.351562 1620.449219 1248.558594 1504.269531 1142.988281 C 1368.5 1019.589844 1189.949219 928.839844 1038.128906 910.820312 C 1014.460938 929.410156 991.921875 949.410156 970.664062 970.660156 C 934.132812 1007.191406 901.363281 1047.480469 872.964844 1090.871094 C 998.578125 1097.671875 1121.351562 1134.019531 1230.480469 1197.039062 L 1236.308594 1200.449219 L 1237.210938 1200.96875 C 1348.890625 1266.921875 1445.988281 1361.03125 1516.75 1480.128906 C 1581.988281 1496.710938 1647.460938 1504.191406 1711.789062 1503.328125 Z M 2034.460938 1425.199219 C 2030.421875 1292.460938 1938.929688 1144.738281 1813.210938 1022.539062 C 1673.75 886.96875 1493.308594 783.949219 1343.351562 767.609375 C 1253.070312 786.929688 1168.808594 822.488281 1093.769531 871.078125 C 1243.238281 901.898438 1408.621094 990.789062 1536.789062 1107.261719 C 1661.691406 1220.769531 1752.070312 1361.171875 1759.960938 1501.128906 C 1805.828125 1497.53125 1850.941406 1489.71875 1894.761719 1477.988281 C 1943.109375 1465.03125 1989.898438 1447.300781 2034.460938 1425.199219 ';

export function WaterPoloBallIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 3002 3002" className={className} fill="none" aria-hidden>
      <path fillRule="evenodd" fill="#00E5FF" d={WATERPOLO_BALL_PATH} />
    </svg>
  );
}

export const SPONSOR_WALL_SPORT_ASSETS = {
  football: '/signage/watermark/football.svg',
  basketball: '/signage/watermark/basketball.svg',
  volleyball: '/signage/watermark/volleyball.png',
  waterpolo: '/signage/watermark/waterpolo.png',
} as const;

type SportWatermark = {
  id: string;
  Icon: ComponentType<IconProps>;
  className: string;
  opacity?: string;
};

export const SPONSOR_WALL_SPORT_WATERMARKS: SportWatermark[] = [
  {
    id: 'football-tl',
    Icon: FootballBallIcon,
    className: 'left-[2%] top-[6%] size-[110px] -rotate-[14deg]',
    opacity: 'opacity-[0.48]',
  },
  {
    id: 'volleyball-tr',
    Icon: VolleyballBallIcon,
    className: 'right-[3%] top-[8%] size-[110px] rotate-[10deg]',
    opacity: 'opacity-[0.48]',
  },
  {
    id: 'basketball-bl',
    Icon: BasketballBallIcon,
    className: 'left-[4%] bottom-[8%] size-[110px] rotate-[8deg]',
    opacity: 'opacity-[0.48]',
  },
  {
    id: 'waterpolo-br',
    Icon: WaterPoloBallIcon,
    className: 'right-[2%] bottom-[6%] size-[110px] -rotate-[6deg]',
    opacity: 'opacity-[0.48]',
  },
];

/** Capa de marca de agua deportiva — assets reales del usuario. */
export function SportBallLayer({ compact }: { compact?: boolean }) {
  const scale = compact ? 'scale-[0.84]' : 'scale-100';

  return (
    <>
      {SPONSOR_WALL_SPORT_WATERMARKS.map(({ id, Icon, className, opacity }) => (
        <Icon
          key={id}
          className={cn(
            'absolute select-none drop-shadow-[0_0_28px_rgba(0,229,255,0.5)]',
            scale,
            opacity ?? 'opacity-[0.48]',
            className
          )}
        />
      ))}
    </>
  );
}
