import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { token, user, rememberMe } = await req.json()
  const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 7

  const res = NextResponse.json({ ok: true })
  res.cookies.set('accessToken', token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
    path: '/',
  })
  res.cookies.set('user', encodeURIComponent(JSON.stringify(user)), {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
    path: '/',
  })
  return res
}
