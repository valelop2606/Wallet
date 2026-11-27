import { SVGProps } from 'react';

const paths = {
  home: 'M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-9.5z',
  wallet: 'M4 7h15a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h11M16 13.5h.01',
  target: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 16a4 4 0 100-8 4 4 0 000 8zM12 12h.01',
  piggy: 'M19 10c0-3.3-3.1-6-7-6-1.3 0-2.6.3-3.6.9L6 3.5V7a6.4 6.4 0 00-2 3H2v4h2a6.8 6.8 0 003 3.5V21h3v-2h4v2h3v-3.5a6 6 0 002-4.5M16 10h.01',
  trophy: 'M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0V4zM17 5h3v2a3 3 0 01-3 3M7 5H4v2a3 3 0 003 3',
  logout: 'M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3M10 17l5-5-5-5M15 12H3',
  x: 'M6 6l12 12M18 6L6 18',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  arrows: 'M7 7h13l-3-3M17 17H4l3 3',
  chevron: 'M6 9l6 6 6-6',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  coins: 'M9 14c3.9 0 7-1.3 7-3s-3.1-3-7-3-7 1.3-7 3 3.1 3 7 3zM2 11v4c0 1.7 3.1 3 7 3s7-1.3 7-3v-4M16 7.5c3.4.3 6 1.5 6 3s-1.5 2.4-4 2.8M22 10.5v4c0 1.3-1.8 2.4-4.5 2.8',
  lock: 'M6 11h12v10H6zM8 11V7a4 4 0 018 0v4',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  folder: 'M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z',
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7l1-8z',
  inbox: 'M3 13h5l1.5 3h5L16 13h5M5 5h14l2 8v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6l2-8z',
  arrowUp: 'M12 19V5M5 12l7-7 7 7',
  arrowDown: 'M12 5v14M19 12l-7 7-7-7',
} as const;

export type IconName = keyof typeof paths;

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

function Icon({ name, size = 20, strokeWidth = 1.8, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      <path d={paths[name]} />
    </svg>
  );
}

export default Icon;
