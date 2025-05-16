// add XML export to file
import "https://unpkg.com/write-excel-file@1.x/bundle/write-excel-file.min.js";

const regexISO = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;

export async function exportXLSFile(headers, lines, fileTitle) {
  try {
    console.log({ headers, lines });

    const headersXLS = Object.values(headers).map((h) => ({
        value: h,
        fontWeight: 'bold',
    }));
    const columns = headersXLS.map((e) => ({ width: e.value.length + 2 }));

    const dataXLS = [];
    dataXLS.push(headersXLS);
    for (const line of lines) {
      const row = [];
      dataXLS.push(row);
      let i = 0;
      for (const [key, label] of Object.entries(headers)) {
        const cell = { value: line[key] };
        let myLength = 10;

        // -- number 
        const n = Number(cell.value);
        if (!Number.isNaN(n)) {
          cell.value = n;
          cell.type = Number;
        } else if (typeof cell.value === 'string') { // date
          myLength = cell.value.length;
          const fulldate = cell.value.endsWith('Z');
          const t =  fulldate ? cell.value : cell.value + 'T00:00:00.000Z';

          if (regexISO.test(t)) {
            cell.value = new Date(t);
            cell.type = Date;
            cell.format = fulldate ? 'yyyy-mm-dd hh:mm:ss' : 'yyyy-mm-dd'
            myLength = fulldate ? 18 : 11;
          }

        }
        row.push(cell);
        myLength = Math.min(myLength, 33) + 2;
        if (columns[i].width < myLength) columns[i].width = myLength;
        i++;
      }
    }
    console.log('## columns', {columns});
    const exportedFilename = fileTitle + '.xlsx' || 'export.xlsx';
    await writeXlsxFile(dataXLS, {
      columns,
      fileName: exportedFilename,
    });
  } catch (e) {
    console.log(e, e.stack);
  }
}
