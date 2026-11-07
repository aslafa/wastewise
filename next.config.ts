import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    cpus: 1,
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async redirects() {
    return [
      { source: '/pengguna', destination: '/admin/pengguna', permanent: false },
      { source: '/data-sampah', destination: '/admin/data-sampah', permanent: false },
      { source: '/penjemputan', destination: '/admin/penjemputan', permanent: false },
      { source: '/ai-monitoring', destination: '/admin/ai-monitoring', permanent: false },
      { source: '/laporan', destination: '/admin/laporan', permanent: false },
    ];
  },
};

export default nextConfig;
