import * as xlsx from 'xlsx';
import * as fs from 'fs';

const fileBuffer = fs.readFileSync('d:\\PROYECTOS\\ELREMATE\\modificaciones\\lista_corregida.xlsx');
const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

console.log(JSON.stringify(data.slice(0, 5), null, 2));
