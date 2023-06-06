import { usePrevious } from "./usePrevious";

export const useDependencyDebugger = (
  dependencies: Record<string, unknown>
): void => {
  const dependencyValues = Object.values(dependencies);
  const dependencyNames = Object.keys(dependencies);

  const previousDeps = usePrevious(dependencyValues);

  const changedDeps = dependencyValues.reduce(
    (accum: Record<string, unknown>, dependency: unknown, index: number) => {
      if (previousDeps != null && dependency !== previousDeps[index]) {
        const dependencyName = dependencyNames[index]!;
        return {
          ...accum,
          [dependencyName]: {
            before: previousDeps[index],
            after: dependency,
          },
        };
      }

      return accum;
    },
    {}
  );

  if (Object.keys(changedDeps).length > 0) {
    console.log("[use-effect-debugger] ", changedDeps);
  }
};
