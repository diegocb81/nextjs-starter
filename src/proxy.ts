import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// No Next 16 o antigo "middleware" passou a se chamar "proxy".
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        // Chamado quando o Supabase renova o token: gravamos os cookies novos
        // tanto na requisição (para o restante do servidor) quanto na resposta
        // (para o navegador).
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
          // Cabeçalhos anti-cache: uma resposta com cookie de sessão nunca
          // pode ser guardada por CDN e servida a outro visitante.
          Object.entries(headers ?? {}).forEach(([key, value]) =>
            response.headers.set(key, value)
          )
        },
      },
    }
  )

  // getUser() valida o token junto ao servidor de autenticação do Supabase.
  // getSession() apenas lê o cookie, que pode ser forjado pelo visitante.
  const { data: { user } } = await supabase.auth.getUser()

  const isLoginPage = request.nextUrl.pathname === '/admin/login'

  if (!user && !isLoginPage) {
    return redirectPreservingCookies(new URL('/admin/login', request.url), response)
  }

  // Quem já está logado não precisa ver a tela de login de novo
  if (user && isLoginPage) {
    return redirectPreservingCookies(new URL('/admin', request.url), response)
  }

  return response
}

// Um redirect é uma resposta nova: sem copiar os cookies, um token recém-renovado
// se perderia e o usuário seria deslogado sem motivo.
function redirectPreservingCookies(url: URL, from: NextResponse) {
  const redirect = NextResponse.redirect(url)
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
  const cacheControl = from.headers.get('cache-control')
  if (cacheControl) redirect.headers.set('cache-control', cacheControl)
  return redirect
}

export const config = {
  matcher: ['/admin/:path*'],
}
