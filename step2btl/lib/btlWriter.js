function pad(n, width) { return String(n).padStart(width, '0'); }

exports.writeBTL = function(part) {
  const lines = [];
  lines.push('VERSION: "BTL V10.6"');
  lines.push('BUILD: "10600"');
  lines.push('EDITION: "STANDARD"');
  lines.push('[GENERAL]');
  lines.push(`EXPORTDATE: "${new Date().toLocaleDateString('sv-SE')}"`);
  lines.push('EXPORTTIME: "00:00:00"');
  lines.push('EXPORTRELEASE: "Converted from STEP"');
  lines.push('[PART]');
  lines.push(`ELEMENTNUMBER: "${part.ELEMENTNUMBER}"`);
  lines.push(`LENGTH: ${pad(part.LENGTH, 8)}`);
  lines.push(`HEIGHT: ${pad(part.HEIGHT, 8)}`);
  lines.push(`WIDTH: ${pad(part.WIDTH, 8)}`);
  lines.push(`UID: ${part.UID}`);
  lines.push(`COUNT: ${part.COUNT}`);
  lines.push(`COMMENT: "${part.COMMENT}"`);
  part.PROCESSES.forEach((proc, i) => {
    lines.push(`PROCESSKEY: ${i+1}-010-1        ${proc.key}`);
    lines.push(`PROCESSPARAMETERS: ${proc.params.join('   ')}`);
    lines.push(`PROCESSIDENT: ${i+1}`);
    lines.push('PRIORITY: 0');
  });
  return lines.join('\n') + '\n';
};
