export const SITE = {
  name: 'dongquoctien',
  title: 'dongquoctien — Full-Stack Developer',
  description:
    'Full-Stack developer building scalable systems, MCP servers, and AI tooling. Notes, projects, and writing from Vietnam.',
  url: 'https://dongquoctien.github.io',
  author: 'Đồng Quốc Tiến',
  locale: 'en',
  email: 'tien.dq@ohmyhotel.com',
  github: 'https://github.com/dongquoctien',
  avatar: 'https://avatars.githubusercontent.com/u/89438689?v=4',
  location: 'Vietnam',
} as const;

export const NAV = [
  { href: '/', label: 'Home' },
  { href: '/projects/', label: 'Projects' },
  { href: '/blog/', label: 'Blog' },
  { href: '/notes/', label: 'Notes' },
  { href: '/about/', label: 'About' },
] as const;
