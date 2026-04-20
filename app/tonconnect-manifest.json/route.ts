import { env } from '@/lib/env';

export function GET() {
  return Response.json({
    url: env.NEXT_PUBLIC_APP_URL,
    name: 'TonRoute',
    iconUrl: `${env.NEXT_PUBLIC_APP_URL}/icon.svg`,
    termsOfUseUrl: `${env.NEXT_PUBLIC_APP_URL}`,
    privacyPolicyUrl: `${env.NEXT_PUBLIC_APP_URL}`
  });
}
