import {NodeSSH} from "node-ssh";

const nodeSsh = new NodeSSH();

nodeSsh.connect({
  host: '192.168.30.193',
  username: 'root',
  port: 22,
  password: 'Founder123',
  tryKeyboard: true,
})
  .then(ssh => {
    console.log('=>(ssh.mjs:14) ssh', ssh);

    ssh.connect({
      host: '192.168.30.214',
      username: 'root',
      port: 22,
      password: 'Founder123',
      tryKeyboard: true,
    })
      .then(res => {
        console.log('=>(ssh.mjs:27) res', res);

      }).catch(err => {
    })

  })
  .catch(err => {
  });
