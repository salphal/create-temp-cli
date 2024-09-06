import fs from 'fs-extra';
import path from 'path';
import dayjs from 'dayjs';

(async function () {
  const str = '/Users/alphal/github/create-temp-cli/.front-cli/publish.config1.json';

  const backupList = [
    'dist_2024-09-05-10-24-40.tar.gz',
    'dist_2024-09-05-10-43-44.tar.gz',
    'dist_2024-09-05-10-46-03.tar.gz',
    'dist_2024-09-05-10-47-24.tar.gz',
    'dist_2024-09-06-10-37-59.tar.gz',
    'dist_2024-09-06-10-38-24.tar.gz',
  ];

  function getRealDateTime(dateTime) {
    dateTime = dateTime.replace('.tar.gz', '');
    const [YYYY, MM, DD, hh, mm, ss] = dateTime.split('-');
    return `${YYYY}-${MM}-${DD} ${hh}:${mm}:${ss}`;
  }

  console.log(
    backupList.sort((a, b) => {
      const [nameA, dateA] = a.split('_');
      // console.log('=>(test.js:19) dateA', dateA);
      const [nameB, dateB] = b.split('_');
      // console.log('=>(test.js:21) dateB', dateB);
      // const realDateTime = getRealDateTime(dateB);
      // console.log('=>(test.js:29) realDateTime', realDateTime);
      // console.log(dayjs(realDateTime));
      return dayjs(getRealDateTime(dateB)).diff(dayjs(getRealDateTime(dateA)));
    }),
  );

  // console.log(dayjs('2024-09-06 10:38:24', 'YYYY-MM-DD-HH-mm-ss'));
})();
