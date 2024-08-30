export interface CliEnvs {
  [key: string]: string | undefined;

  TEMP_CLI_TEMPLATE_DIRECTORY?: string | undefined;
  TEMP_CLI_OUTPUT_DIRECTORY?: string | undefined;
  TEMP_CLI_OUTPUT_DIRECTORY_CHOICES?: string | undefined;
}

export interface Envs {
  argv: any;
  __dirname: string;
  __filename: string;
  envs: CliEnvs;
}
