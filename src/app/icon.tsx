import { ImageResponse } from 'next/og';
import { BRAND_COLORS, siteInitials } from '@/lib/site';

// Favicon gerado no build (PNG) com as iniciais e as cores da marca.
// Quando o cliente tiver logotipo, substitua por src/app/icon.png (ou .svg)
// e apague este arquivo.
export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: BRAND_COLORS.fundo,
          borderRadius: 12,
          border: `3px solid ${BRAND_COLORS.marca}`,
          color: BRAND_COLORS.marca,
          fontSize: 34,
          fontWeight: 700,
          letterSpacing: -2,
        }}
      >
        {siteInitials()}
      </div>
    ),
    size
  );
}
