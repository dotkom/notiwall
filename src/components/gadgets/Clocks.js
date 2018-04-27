import React from 'react';

export const simpleClock = (time, pots = []) => {
  const potsElement = pots.map((e, i) => {
    const [ hours, minutes ] = e.split(':').map(e => parseInt(e, 10));
    const pos = (hours + minutes / 60) / 12;
    const dx = Math.sin(Math.PI - pos * Math.PI * 2) * 40;
    const dy = Math.cos(Math.PI + pos * Math.PI * 2) * 40;
    return <circle key={i} cx={50 + dx} cy={50 + dy} r="1" fill="rgba(255, 255, 255, .4)" />;
  });

  const hour = time.getHours();
  const minute = time.getMinutes();
  const second = time.getSeconds();
  const millisecond = time.getMilliseconds();

  const hourX = Math.sin(Math.PI - Math.PI * 2 * (hour / 12 + minute / 12 / 60)) * 16;
  const hourY = Math.cos(Math.PI + Math.PI * 2 * (hour / 12 + minute / 12 / 60)) * 16;
  const minuteX = Math.sin(Math.PI - Math.PI * 2 * (minute / 60 + second / 60 / 60)) * 32;
  const minuteY = Math.cos(Math.PI + Math.PI * 2 * (minute / 60 + second / 60 / 60)) * 32;
  const secondX = Math.sin(Math.PI - Math.PI * 2 * (second / 60 + millisecond / 60 / 1000)) * 32;
  const secondY = Math.cos(Math.PI + Math.PI * 2 * (second / 60 + millisecond / 60 / 1000)) * 32;

  const borderSize = 2;

  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="40" fill="rgba(0, 0, 0, .1)" />
      <text x="50" y={30} fill="rgba(255, 255, 255, .4)" textAnchor="middle" fontSize="10px">{pots.length}</text>
      <text x="50" y={38} fill="rgba(255, 255, 255, .4)" textAnchor="middle" fontSize="5px">Pots</text>
      <line strokeLinecap="round" x1="50" y1="50" x2={50 + hourX} y2={50 + hourY} strokeWidth={borderSize} stroke="rgba(255, 255, 255, 1)" />
      <line strokeLinecap="round" x1="50" y1="50" x2={50 + minuteX} y2={50 + minuteY} strokeWidth={borderSize} stroke="rgba(255, 255, 255, 1)" />
      <line strokeLinecap="round" x1="50" y1="50" x2={50 + secondX} y2={50 + secondY} strokeWidth={borderSize / 2} stroke="rgba(255, 255, 255, .6)" />
      <circle cx="50" cy="50" r={borderSize / 2} fill="rgba(0, 0, 0, .5)" />
      <circle cx="50" cy="50" r={borderSize * .8} fill="#fff" />
      {potsElement}
    </svg>
  );
}
