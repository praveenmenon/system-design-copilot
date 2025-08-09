export function fitToContent(scene: any) {
  const elements = scene.elements || []
  if (!elements.length) return scene
  const minX = Math.min(...elements.map((e: any) => e.x))
  const minY = Math.min(...elements.map((e: any) => e.y))
  const maxX = Math.max(...elements.map((e: any) => e.x + (e.width || 0)))
  const maxY = Math.max(...elements.map((e: any) => e.y + (e.height || 0)))
  const width = maxX - minX
  const height = maxY - minY
  scene.appState = {
    ...(scene.appState || {}),
    scrollX: -minX + 50,
    scrollY: -minY + 50,
    zoom: Math.min(1, 800 / (width || 1), 600 / (height || 1))
  }
  return scene
}
