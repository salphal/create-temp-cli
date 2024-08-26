import shell from "shelljs";


/**
 * https://www.npmjs.com/package/shelljs
 */


shell.which('git');


shell.rm('-rf', 'out/Release');

shell.cp('-R', 'stuff/', 'out/Release');

shell.cd('lib');

shell.ls('*.js').forEach(function (file) {
  shell.sed('-i', 'BUILD_VERSION', 'v0.1.2', file);
  shell.sed('-i', /^.*REMOVE_THIS_LINE.*$/, '', file);
  shell.sed('-i', /.*REPLACE_LINE_WITH_MACRO.*\n/, shell.cat('macro.js'), file);
});

shell.echo('Error: Git commit failed');
shell.exit(1);

const str = cat('file*.txt');
