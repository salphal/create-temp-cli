import {Client} from 'ssh2';


/**
 * https://github.com/mscdex/ssh2
 *
 *
 * https://blog.csdn.net/qq_39147299/article/details/134712434
 *
 * @type {Client}
 */

const conn1 = new Client();
const conn2 = new Client();

// Checks uptime on 10.1.1.40 via 192.168.1.1

conn1.on('ready', () => {

  console.log('FIRST :: connection ready');
  // Alternatively, you could use something like netcat or socat with exec()
  // instead of forwardOut(), depending on what the server allows

  conn1.forwardIn('192.168.1.241', 22 , (err, stream) => {

    if (err) {
      console.log('FIRST :: forwardOut error: ' + err);
      return conn1.end();
    }

    conn2.connect({
      sock: stream,
      username: 'root',
      port: 22,
      password: 'Liang1992@12',
    });

  });

}).connect({
  host: '192.168.1.158',
  port: 22,
  username: 'root',
  password: 'Liang1992@12',
});

conn2.on('ready', () => {
  // This connection is the one to 10.1.1.40

  console.log('SECOND :: connection ready');

  conn2.exec('uptime', (err, stream) => {
    if (err) {
      console.log('SECOND :: exec error: ' + err);
      return conn1.end();
    }
    stream.on('close', () => {
      conn1.end(); // close parent (and this) connection
    }).on('data', (data) => {
      console.log(data.toString());
    });
  });

});
