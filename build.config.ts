import { defineBuildConfig } from "unbuild"

export default defineBuildConfig({
  declaration: true,
  entries: ["./src/index"],
  rollup: {
    inlineDependencies: true,
    emitCJS: true,
  },
})
