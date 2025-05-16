/**
 * convert all " to '' and add ","
 */
function fenceLine(items) {
    return '"' + items.map(i => i.replaceAll('"','\'\'')).join('","') + '"\r\n';
}

export async function exportCSVFile(headers, lines, fileTitle) {
  let csv = fenceLine(Object.values(headers));

  for (const line of lines) {
    const items = [];
    for (const key of Object.keys(headers)) {
        const v = line[key];
        items.push(v == null ? '': v + '');
    }
    csv += fenceLine(items);
  }

  var exportedFilenmae = fileTitle + '.csv' || 'export.csv';

  var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  if (navigator.msSaveBlob) { // IE 10+
      navigator.msSaveBlob(blob, exportedFilenmae);
  } else {
      var link = document.createElement("a");
      if (link.download !== undefined) { // feature detection
          // Browsers that support HTML5 download attribute
          var url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", exportedFilenmae);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      }
  }
}