import {PublishConfig, PublishConfigList} from "@clis/publish/publish";

export function getPublishConfigByEnvName(envName: string, publishConfigList: PublishConfigList) {
  const [currentPublishConfig] = publishConfigList.filter((publishConfig: PublishConfig) => {
    return publishConfig.envName === envName;
  });
  return currentPublishConfig;
}
