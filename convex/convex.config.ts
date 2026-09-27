import polar from "@convex-dev/polar/convex.config.js";
import { defineApp } from "convex/server";
import { v } from "convex/values";

const app = defineApp({
  env: {
    GEMINI_API_KEY: v.optional(v.string()),
  },
});

app.use(polar);

export default app;
