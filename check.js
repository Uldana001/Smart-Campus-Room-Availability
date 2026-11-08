import fs from 'fs';
import path from 'path';

// Рекурсивный поиск файлов в папке src
const getFiles = (dir) => 
  fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => 
    e.isDirectory() ? getFiles(path.join(dir, e.name)) : [path.join(dir, e.name)]
  );

const files = getFiles('src').filter(f => /\.(ts|tsx)$/.test(f));

// 1. Подсчет строк
console.log('--- lines per file ---');
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lineCount = content.split('\n').length - (content.endsWith('\n') ? 1 : 0);
  console.log(lineCount, file);
});

// Функция для поиска паттернов в файлах
const searchInFiles = (label, regex) => {
  console.log(`--- ${label} ---`);
  files.forEach(file => {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, index) => {
      if (regex.test(line)) {
        console.log(`${file}:${index + 1}: ${line.trim()}`);
      }
    });
  });
};

// 2. Поиск чисел 1440 или 120
searchInFiles('1440 / 120', /1440|120/);

// 3. Поиск вызовов checkAvailability(
searchInFiles('checkAvailability(', /checkAvailability\(/);