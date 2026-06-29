// Improved lightweight STEP parser that extracts CARTESIAN_POINTs and
// performs a heuristic 'cutout' detection based on interior point locations.
function parseCartesianPoints(content) {
  const re = /#(\d+)\s*=\s*CARTESIAN_POINT\('',\s*\(([^)]+)\)\)\s*;/g;
  const pts = {};
  let m;
  while ((m = re.exec(content)) !== null) {
    const id = m[1];
    const nums = m[2].split(',').map(s => parseFloat(s));
    pts[id] = nums; // [x,y,z]
  }
  return pts;
}

function parseAxisPlacements(content) {
  // AXIS2_PLACEMENT_3D('',#21,#22,#23);
  const re = /#(\d+)\s*=\s*AXIS2_PLACEMENT_3D\('',\s*#(\d+),\s*#(\d+),\s*#(\d+)\)\s*;/g;
  const map = {};
  let m;
  while ((m = re.exec(content)) !== null) {
    const id = m[1];
    const pointId = m[2];
    map[id] = pointId;
  }
  return map; // axisId -> pointId
}

function bboxFromPoints(pts) {
  const xs = [], ys = [], zs = [];
  Object.values(pts).forEach(p => { xs.push(p[0]); ys.push(p[1]); zs.push(p[2]); });
  return {
    min: [Math.min(...xs), Math.min(...ys), Math.min(...zs)],
    max: [Math.max(...xs), Math.max(...ys), Math.max(...zs)]
  };
}

function isInterior(point, bbox, tol = 1e-6) {
  for (let i = 0; i < 3; i++) {
    if (Math.abs(point[i] - bbox.min[i]) < tol) return false;
    if (Math.abs(point[i] - bbox.max[i]) < tol) return false;
  }
  // if all coords are strictly between min and max, it's interior
  return point[0] > bbox.min[0] + tol && point[0] < bbox.max[0] - tol &&
         point[1] > bbox.min[1] + tol && point[1] < bbox.max[1] - tol &&
         point[2] > bbox.min[2] + tol && point[2] < bbox.max[2] - tol;
}

exports.parseStep = function(content, name) {
  const pts = parseCartesianPoints(content);
  const axisMap = parseAxisPlacements(content);
  const bbox = bboxFromPoints(pts);

  // Collect interior points referenced by axis placements (heuristic cutout centers)
  const interiorPoints = {};
  Object.values(axisMap).forEach(pointId => {
    const p = pts[pointId];
    if (!p) return;
    if (isInterior(p, bbox)) {
      interiorPoints[pointId] = p;
    }
  });

  // Derive a length from bbox X dimension as fallback
  const len = Math.round((bbox.max[0] - bbox.min[0]) * 1000) || 100000;

  const cutouts = Object.values(interiorPoints).map(p => ({ x: p[0], y: p[1], z: p[2] }));

  return {
    UID: 1,
    ELEMENTNUMBER: name.replace(/[^a-z0-9]/gi, '_'),
    LENGTH: len,
    HEIGHT: Math.round((bbox.max[2] - bbox.min[2]) * 1000) || 14000,
    WIDTH: Math.round((bbox.max[1] - bbox.min[1]) * 1000) || 20000,
    COUNT: 1,
    COMMENT: `Converted from ${name}`,
    PROCESSES: [
      { key: 'AnalysedCut - Perpendicular', params: [`P01:${String(len).padStart(8, '0')}`, 'P02:00000000', 'P03:00000000'] }
    ],
    CUTOUTS: cutouts
  };
};
