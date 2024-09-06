
const str = 'D:\\opt\\demo\\data-warehouse-construction-0.0.1-SNAPSHOT.jar';

function forceSlash(path) {
  return path.replace(/\\/g, '/');
}

console.log(forceSlash(str)); // 输出：D:/opt/demo/data-warehouse-construction-0.0.1-SNAPSHOT.jar


