// next.config.ts
import withNextIntl from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withIntl = withNextIntl('./i18n.ts'); // ✅ 경로는 문자열로 지정!

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default withIntl(nextConfig);
