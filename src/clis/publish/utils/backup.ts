import dayjs from 'dayjs';
import { PathExtra } from '@utils';
import path from 'path';

interface FileInfo {
  name: string;
  datetime: string;
}

export function createBackupName(appName = 'dist', format: string = 'YYYY-MM-DD-hh-mm-ss'): string {
  const datetime = dayjs().format(format);
  return `${appName}_${datetime}.tar.gz`;
}

export function getBackInfoByName(fileName: string) {
  fileName = PathExtra.__basename(fileName);
  const [name, datetime] = fileName.split('_');
  return {
    name,
    datetime,
  };
}

export function createFileListByFileInfo(baseDir: string, fileInfoList: FileInfo[]) {
  return fileInfoList.map(({ name, datetime }) => path.join(baseDir, `${name}_${datetime}.tar.gz`));
}

export function sortFileInfoByDatetime(fileInfoList: FileInfo[]): FileInfo[] {
  return fileInfoList.sort((a, b) => dayjs(a.datetime).diff(dayjs(b.datetime))).reverse();
}

export function getFileListBySort() {}

export function filterExpiredFiles(baseDir: string, fileNameList: string[], max: number) {
  const fileInfoList = sortFileInfoByDatetime(
    fileNameList.map((fileName) => getBackInfoByName(fileName)),
  );
  if (fileInfoList.length <= max) {
    return [];
  }
  return createFileListByFileInfo(baseDir, fileInfoList.slice(max, fileInfoList.length));
}
