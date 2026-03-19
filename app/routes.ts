import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("comparison", "routes/comparison.tsx"),
  route("are-we-recharts-yet", "routes/are-we-recharts-yet.tsx"),
] satisfies RouteConfig;
