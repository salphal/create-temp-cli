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

#### publish.config.json

```js

[
  {
    "envName": "__front_demo__",            // 环境名称
    "local": {
      "outputName": "dist"                  // 产物名称( 基于执行的目录为根目录, 可以是 /路径/名称 或 名称 )
    },
    "server": {                             // - 服务器连接配置
      "connect": {                          // ssh 连接的配置
        "host": "192.168.1.1",              // 服务器-域名
        "username": "root",                 // 服务器-用户名
        "port": 22,                         // 服务器-端口
        "password": "password",             // 密码 和 私钥 传递其中一个即可
        "privateKey": "/path/to/my/key"     // ssh 私钥( 若不使用, 则需设置为 null )
      },
      "jumpServer": {                       // - 跳板机配置( 配置跳板机后自动切换为 先连接跳板机, 再连接服务器 ) 
        "host": "192.168.1.2",              // 跳板机-域名
        "username": "root",                 // 跳板机-用户名
        "port": 22,                         // 跳板机-端口
        "password": "password",             // 密码 和 私钥 传递其中一个即可   
        "privateKey": "/path/to/my/key"     // ssh 私钥( 若不使用, 则需设置为 null )
      },
      "isBackup": true,                     // 是否备份
      "backup": {                           // - 备份配置
        "dirName": "time-machine",          // 备份名称( 默认 appName-dirName )
        "max": 5                            // 备份最大数量
      },
      "publishDir": "/etc/nginx/html/app",  // 发布到服务器的路径
      "appName": "app",                     // 最终发布的文件名称( 若上产的产物名称和 appName 不同, 则会重命名 )
      "restartCmd": "nginx -s reload"       // 重启服务的 shell 命令
    }
  },
]

```

## Template Cli

> 根据已有或自定义模版生成文件

```shell

# 默认读取 .dev-cli/__template__ 中的模版

dev-cli create temp

或

dev-cli ct


```

#### template.config.mjs

```js

import path from 'path';

/**
 * 自定配置
 *
 * 自定义配置会优先执行, 并且将 promptList 交互的结果 注入到当前执行的上下文中
 */
const createTempConfig = (context) => {
  
  return {
    "front/react": {            // 自定义配置名
      data: (ctx) => {          // 自定义数据
        return {};
      },
      promptList: [             // 自定义 prompts 用户交互的问题
        {
          type: "",             // 交互类型
          name: "",             // 交互完成后返回的数据名
          message: "",          // 交互信息
          chocies: [            // 若是 select 等类型, 则需要传递选项
            {
              title: "",
              value: "",
            }
          ]
        }
      ],
    }
  }
};

export default createTempConfig;

```

## Download config

> 下载默认配置到当前工程的 .dev-cli 文件下

```shell


dev-cli download

或

dev-cli dw


```
