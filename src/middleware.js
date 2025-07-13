import { NextResponse } from 'next/server';

const middleware = (req) => {
  if (!process.env.APP_URL) {
    console.error('APP_URL is not defined in environment variables.');
    return NextResponse.next();
  }

  let host;
  try {
    ({ host } = new URL(process.env.APP_URL));
  } catch (err) {
    console.error('Invalid APP_URL:', process.env.APP_URL);
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  const { pathname } = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  const currentHost = hostname.replace(`.${host}`, '');

  if (pathname.startsWith(`/_sites`)) {
    return new Response(null, { status: 404 });
  }

  if (!pathname.includes('.') && !pathname.startsWith('/api')) {
    if (hostname === host) {
      url.pathname = `${pathname}`;
    } else {
      url.pathname = `/_sites/${currentHost}${pathname}`;
    }

    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
};

export default middleware;
