export function getTouchX(event: TouchEvent): number | null {
  const touch = event.touches[0] ?? event.changedTouches[0];
  return touch ? touch.clientX : null;
}

export function getTouchDistance(touchA: { clientX: number; clientY: number }, touchB: { clientX: number; clientY: number }): number {
  const dx = touchB.clientX - touchA.clientX;
  const dy = touchB.clientY - touchA.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}
