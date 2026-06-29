const jwtIssuer = process.env.CLERK_JWT_ISSUER_DOMAIN;

export default {
  providers: [
    {
      domain: jwtIssuer,
      applicationID: "convex",
    },
  ],
};
