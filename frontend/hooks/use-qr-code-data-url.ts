import { useEffect, useState } from "react"
import QRCode from "qrcode"

/** Generates a base64 PNG data URL for a QR code, usable in both <img>/<Image> and react-pdf's <Image>. */
export function useQrCodeDataUrl(value: string): string | null {
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    QRCode.toDataURL(value, { margin: 1, width: 200 })
      .then((url) => {
        if (!cancelled) setDataUrl(url)
      })
      .catch(() => {
        if (!cancelled) setDataUrl(null)
      })

    return () => {
      cancelled = true
    }
  }, [value])

  return dataUrl
}
