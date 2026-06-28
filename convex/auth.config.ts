// Detect environment based on CONVEX_DEPLOYMENT or NEXT_PUBLIC_CONVEX_URL
const isProd = process.env.CONVEX_DEPLOYMENT?.includes("prod") ||
               process.env.NEXT_PUBLIC_CONVEX_URL?.includes(".convex.cloud") ||
               process.env.NEXT_PUBLIC_CONVEX_URL?.includes("moveverse.my.id");

const jwtIssuer = isProd
  ? "https://clerk.moveverse.my.id"
  : (process.env.CLERK_JWT_ISSUER_DOMAIN || "https://live-peacock-44.clerk.accounts.dev");

export default {
  providers: [
    {
      domain: jwtIssuer,
      applicationID: "convex",
    },
  ],
};
