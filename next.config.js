const allowedDevOrigins = process.env.BASE44_PUBLIC_HOST_SUFFIX
  ? ["3000-" + process.env.BASE44_PUBLIC_HOST_SUFFIX]
  : [];

module.exports = {
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
  allowedDevOrigins,
};
