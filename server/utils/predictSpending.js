/**
 * Predicts next month's spending using simple linear regression
 * over the monthly totals array: [{ month: '2026-01', total: 5000 }, ...]
 * Returns a predicted number for the next period, or null if insufficient data.
 */
const predictNextMonthSpending = (monthlyTotals) => {
  if (!monthlyTotals || monthlyTotals.length < 2) return null;

  const n = monthlyTotals.length;
  const xs = monthlyTotals.map((_, i) => i + 1);
  const ys = monthlyTotals.map((m) => m.total);

  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((sum, x, i) => sum + x * ys[i], 0);
  const sumX2 = xs.reduce((sum, x) => sum + x * x, 0);

  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) return Math.round(sumY / n);

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  const nextX = n + 1;
  const prediction = slope * nextX + intercept;

  return Math.max(0, Math.round(prediction));
};

module.exports = { predictNextMonthSpending };
