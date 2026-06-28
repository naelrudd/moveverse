export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN || "https://live-peacock-44.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};
