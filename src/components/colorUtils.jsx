// colorUtils.js
export const getColor = (index) => {
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ff00ff'];
  return colors[index % colors.length];
};
