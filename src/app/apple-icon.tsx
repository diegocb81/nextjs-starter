import { ImageResponse } from 'next/og';
import { BRAND_COLORS, siteInitials } from '@/lib/site';

// Ícone usado quando alguém adiciona o site à tela inicial do iPhone/iPad.
// Quando o cliente tiver logotipo, substitua por src/app/apple-icon.png.
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
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
          color: BRAND_COLORS.marca,
          fontSize: 96,
          fontWeight: 700,
          letterSpacing: -6,
        }}
      >
        {siteInitials()}
      </div>
    ),
    size
  );
}
