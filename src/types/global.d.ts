export interface Envs<T = any> {
  argv: any;
  __dirname: string;
  __filename: string;
  envs: T;
}
