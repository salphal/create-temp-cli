# Dev Cli

- download cli
- publish cli
- template cli


## Publish Cli

> 部署资源到服务器, 并重启( 支持跳板机 )

```shell

# 默认读取 .dev-cli/publish.config.json 作为部署的配置文件

dev-cli publish

或

dev-cli pb


```

## Template Cli

> 根据已有或自定义模版生成文件

```shell

# 默认读取 .dev-cli/__template__ 中的模版

dev-cli create temp

或

dev-cli ct


```

## Download config

> 下载默认配置到当前工程的 .dev-cli 文件下

```shell


dev-cli download

或

dev-cli dw


```
