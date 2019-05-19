declare module "just-map-values" {
    export default function map<Obj, T extends Obj[keyof Obj], TResult>(
        obj: { [K in keyof Obj]: T },
        fn: (value: T, key: keyof Obj) => TResult
    ): { [K in keyof Obj]: TResult };
}
