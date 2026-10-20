import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // A aba Armaduras virou o modo I do Caderno de Violino
      {
        source: "/:lang/armaduras",
        destination: "/:lang/violino/armaduras",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
