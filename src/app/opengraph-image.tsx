import { ImageResponse } from 'next/og';
import { BRAND_COLORS, SITE_DESCRIPTION, SITE_NAME } from '@/lib/site';

// Imagem de prévia ao compartilhar o site (WhatsApp, LinkedIn, Facebook),
// gerada no build com o nome e a descrição. Quando houver uma foto ou arte
// do cliente, substitua por src/app/opengraph-image.jpg (1200x630).
export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 80,
          background: BRAND_COLORS.fundo,
          border: `12px solid ${BRAND_COLORS.marca}`,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 84, fontWeight: 700, color: BRAND_COLORS.marca }}>{SITE_NAME}</div>
        <div style={{ marginTop: 32, fontSize: 34, color: '#E5E5E5', maxWidth: 900 }}>{SITE_DESCRIPTION}</div>
      </div>
    ),
    size
  );
}
