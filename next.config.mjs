/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  // Activity photography still lives in the old site's blob store; nothing is re-hosted yet.
  images: { unoptimized: true },

  // The old site gave every tour its own page, and those URLs are indexed and in ads. The
  // rebuild has one grid instead, so they all land there rather than 404. Temporary until the
  // cutover is settled — make them permanent once we are sure.
  async redirects() {
    return [
      { source: "/sailingboat", destination: "/#activities", permanent: false },
      { source: "/cabosignaturexperience", destination: "/#activities", permanent: false },
      { source: "/outdooradventurezipline", destination: "/#activities", permanent: false },
      { source: "/camelsATVlaunch", destination: "/#activities", permanent: false },
      { source: "/cabosunsetcruise", destination: "/#activities", permanent: false },
      { source: "/cabodolphinexperience", destination: "/#activities", permanent: false },
      { source: "/twobaysnorkel", destination: "/#activities", permanent: false },
      { source: "/outbackcamel", destination: "/#activities", permanent: false },
      { source: "/balandrabeach", destination: "/#activities", permanent: false },
      { source: "/cabosnorkellandsarch", destination: "/#activities", permanent: false },
      { source: "/cabopulmosnorkeling", destination: "/#activities", permanent: false },
      { source: "/offroadcamel", destination: "/#activities", permanent: false },
      { source: "/familydolphinencounter", destination: "/#activities", permanent: false },
      { source: "/camelridearch", destination: "/#activities", permanent: false },
      { source: "/offroadtour", destination: "/#activities", permanent: false },
      { source: "/atvdesertadventure", destination: "/#activities", permanent: false },
      { source: "/jetskicaboadventure", destination: "/#activities", permanent: false },
      { source: "/artandwine", destination: "/#activities", permanent: false },
      { source: "/cabopulmodiving", destination: "/#activities", permanent: false },
      { source: "/electricbikecamel", destination: "/#activities", permanent: false },
      { source: "/privateyatchexperience", destination: "/#activities", permanent: false },
      { source: "/whalesharkexperience", destination: "/#activities", permanent: false },
      { source: "/luxurywhalewatching", destination: "/#activities", permanent: false },
      { source: "/caboprivatediving", destination: "/#activities", permanent: false },
      { source: "/padiadvancediving", destination: "/#activities", permanent: false },
      { source: "/padidivingcertificate", destination: "/#activities", permanent: false },
      { source: "/magicaltodosantos", destination: "/#activities", permanent: false },
      { source: "/cabocitytour", destination: "/#activities", permanent: false },
      { source: "/tours", destination: "/#activities", permanent: false },
    ]
  },
}

export default nextConfig
