// add XML export to file
import "https://unpkg.com/write-excel-file@1.x/bundle/write-excel-file.min.js";

export async function exportXLSFile(headers, lines, fileTitle) {
  try {
    console.log({ headers, lines });

    const schema = Object.entries(headers).map((h) => {
      const key = h[0];
      return {
        column: h[1],
        value: function (e) {
          return e[key];
        },
      };
    });


    const exportedFilename = fileTitle + ".xlsx" || "export.xlsx";
    await writeXlsxFile(lines, {
      schema,
      fileName: exportedFilename,
    });
  } catch (e) {
    console.log(e, e.stack);
  }
}
