export type ClassMap = { [key: string]: boolean | undefined | null | false };

export const c = (...classes: (ClassMap | string | undefined | null | false)[]): string =>
    (classes
        .filter(x => x !== null && x !== undefined && x !== false) as (ClassMap | string)[])
        .flatMap(x => typeof(x) === "string"
            ? [x] : Object.entries(x).filter(([, r]) => r).map(([cl]) => cl))
        .join(" ");
