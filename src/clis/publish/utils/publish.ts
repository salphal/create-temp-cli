import { PublishConfig, PublishConfigList } from '@clis/publish/publish';

export function getPublishConfigByEnvName(envName: string, publishConfigList: PublishConfigList) {
  const [currentPublishConfig] = publishConfigList.filter((publishConfig: PublishConfig) => {
    return publishConfig.envName === envName;
  });
  return currentPublishConfig;
}

export function crateNameConfigChoices(publishConfigList: PublishConfigList) {
  return publishConfigList
    .map((config) => {
      const {
        envName,
        server: {
          connect: { host },
        },
      } = config;
      return {
        title: `[${envName}]:${host}`,
        value: envName,
      };
    })
    .filter((v) => !/^__.*__$/.test(v.value));
}
