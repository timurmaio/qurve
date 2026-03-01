import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("comparison", "routes/comparison.tsx"),
] satisfies RouteConfig;
