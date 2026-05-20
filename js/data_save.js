/*
  data_save.js

  This file stores simple data-saving utilities.
  Current version downloads the task data as a CSV file at the end.
*/

function makeParticipantId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("pid") || `P_${Date.now()}`;
}

function convertRowsToCSV(rows) {
  if (!rows.length) return "";

  const headers = [];
  rows.forEach(row => {
    Object.keys(row).forEach(key => {
      if (!headers.includes(key)) headers.push(key);
    });
  });

  const escapeCell = value => {
    if (value === null || value === undefined) return "";
    const stringValue = String(value);
    return `"${stringValue.replace(/"/g, '""')}"`;
  };

  const csvLines = [
    headers.join(","),
    ...rows.map(row => headers.map(header => escapeCell(row[header])).join(","))
  ];

  return csvLines.join("\n");
}

function downloadCSV(rows, filename = "real_picture_task_data.csv") {
  const csv = convertRowsToCSV(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}
