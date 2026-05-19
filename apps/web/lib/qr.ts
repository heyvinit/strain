import QRCode from 'qrcode'

/**
 * Generates a QR code SVG string with a transparent background.
 * qrcode only accepts hex colors, so we generate with white bg
 * then strip the background path to make it transparent.
 */
export async function qrToSvg(url: string, dotColor = '#888888'): Promise<string> {
  const svg = await QRCode.toString(url, {
    type: 'svg',
    margin: 0,
    color: { dark: dotColor, light: '#ffffff' },
  })
  // Remove the solid background path: <path fill="#ffffff" d="M0 0h...z"/>
  return svg.replace(/<path[^>]*fill="#ffffff"[^>]*\/>/g, '')
}
