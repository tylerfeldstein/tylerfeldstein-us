const authConfig = {
  providers: [
    // Uncomment this once you have set up a Clerk app
    {
      // Replace with your own Clerk Issuer URL from your "convex" JWT template
      // or with `process.env.CLERK_JWT_ISSUER_DOMAIN`
      // and configure CLERK_JWT_ISSUER_DOMAIN on the Convex Dashboard
      // See https://docs.convex.dev/auth/clerk#configuring-dev-and-prod-instances
      //domain: "https://classic-llama-88.clerk.accounts.dev",
      domain: "https://clerk.tylerfeldstein.us",
      applicationID: "convex",
    },
  ],
};

export default authConfig;
