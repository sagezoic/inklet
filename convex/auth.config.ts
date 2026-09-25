export default {
  providers: [
    {
      // This file is loaded as auth config, not inside a Convex function,
      // so the typed env export is not available here.
      // eslint-disable-next-line @convex-dev/no-process-env
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};
