import ssh2 from 'ssh2';

/**
 *
 */

const jumpServerConfig = {
  host: '192.168.30.193',
  port: 22,
  username: 'root',
  password: 'Founder123',
};

const serverConfig = {
  host: '192.168.90.100',
  port: 22,
  username: 'root',
  password: 'Founder123',
};

const sshClient = new ssh2.Client();

sshClient.on('error', (err) => {
  console.log('connect ssh error:', err);
});

sshClient.on('close', () => {
  console.log('connect ssh close');
});

sshClient.on('ready', () => {
  console.log('connect ssh success');

  sshClient.forwardOut(
    jumpServerConfig.host,
    jumpServerConfig.port,
    serverConfig.host,
    serverConfig.port,
    (err, stream) => {
      if (err) {
        console.log(`ssh forward err: ${err}`);
        return;
      }
      console.log('SSH forwarding established');

      // Now, create a new SSH connection using the forwarded stream
      const innerSSHClient = new ssh2.Client();

      innerSSHClient
        .on('ready', () => {
          console.log('Connected to inner server');

          // Execute a command on the inner server
          innerSSHClient.exec('uptime', (err, stream) => {
            if (err) throw err;
            stream
              .on('close', (code, signal) => {
                console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
                innerSSHClient.end();
                sshClient.end();
              })
              .on('data', (data) => {
                console.log('STDOUT: ' + data);
              }).stderr.on('data', (data) => {
              console.log('STDERR: ' + data);
            });
          });

          innerSSHClient.exec('pwd', (err, stream) => {
            if (err) throw err;
            stream
              .on('close', (code, signal) => {
                console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
                innerSSHClient.end();
                sshClient.end();
              })
              .on('data', (data) => {
                console.log('STDOUT: ' + data);
              }).stderr.on('data', (data) => {
              console.log('STDERR: ' + data);
            });
          });

        })
        .on('error', (err) => {
          console.log('Inner SSH error:', err);
        });

      innerSSHClient.connect({
        sock: stream, // Use the forwarded stream to connect to the inner server
        username: serverConfig.username,
        password: serverConfig.password,
      });
    }
  );
});

sshClient.connect(jumpServerConfig);
