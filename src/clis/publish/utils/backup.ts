import dayjs from 'dayjs';
import path from 'path';

interface FileInfo {
  name: string;
  datetime: string;
}

/**
 * dayjs 无法解析 YYYY-MM-DD-hh-mm-ss 格式的时间
 * 转换为 YYYY-MM-DD hh:mm:ss
 */
export function getRealDateTime(dateTime: string) {
  const [YYYY, MM, DD, hh, mm, ss] = dateTime.split('-');
  if (!YYYY || !MM || !DD || !hh || !mm || !ss) return dateTime;
  return `${YYYY}-${MM}-${DD} ${hh}:${mm}:${ss}`;
}

export function createBackupName(appName = 'dist', format: string = 'YYYY-MM-DD-hh-mm-ss'): string {
  const datetime = dayjs().format(format);
  if (/.*(\.jar)/.test(appName)) {
    appName = appName.slice(0, appName.lastIndexOf('.'));
  }
  return `${appName}_${datetime}.tar.gz`;
}

export function getBackInfoByName(fileName: string): FileInfo | null {
  if (!/.*_\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}\..*/.test(fileName)) {
    return null;
  }
  const dateTimeRegexp = /\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}/;
  const matchs = fileName.match(dateTimeRegexp);
  if (matchs && Array.isArray(matchs) && matchs.length) {
    const datetime = matchs[0];
    const i = fileName.indexOf(datetime);
    const name = fileName.slice(0, i - 1);
    return {
      name,
      datetime,
    };
  }
  return null;
}

export function getFileInfoList(fileNameList: string[]): FileInfo[] {
  return fileNameList
    .map((fileName) => getBackInfoByName(fileName))
    .filter((v) => !!v) as FileInfo[];
}

export function createFileNameList(fileInfoList: FileInfo[], baseDir?: string) {
  return fileInfoList.map(({ name, datetime }) => {
    if (baseDir) {
      return path.join(baseDir, `${name}_${datetime}.tar.gz`);
    } else {
      return `${name}_${datetime}.tar.gz`;
    }
  });
}

export function sortFileInfoByDatetime(fileInfoList: FileInfo[]): FileInfo[] {
  return fileInfoList
    .sort((a, b) => {
      return dayjs(getRealDateTime(a.datetime)).diff(dayjs(getRealDateTime(b.datetime)));
    })
    .reverse();
}

export function filterExpiredFiles(baseDir: string, fileNameList: string[], max: number) {
  const fileInfoList = getFileInfoList(fileNameList);
  const sortFileInfoList = sortFileInfoByDatetime(fileInfoList);
  if (sortFileInfoList.length <= max) return [];
  return createFileNameList(sortFileInfoList.slice(max, sortFileInfoList.length), baseDir);
}

export function getSortFileList(fileNameList: string[]) {
  const fileInfoList = getFileInfoList(fileNameList);
  const sortFileInfoList = sortFileInfoByDatetime(fileInfoList);
  return createFileNameList(sortFileInfoList);
}

export function getSortBackupChoices(fileNameList: string[]) {
  return getSortFileList(fileNameList).map((v, i) => {
    let title = v;
    if (i === 0) {
      title = v + '( last )';
    }
    return {
      title,
      value: v,
    };
  });
}
