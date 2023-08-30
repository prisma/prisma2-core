import { defineMatrix } from '../../_utils/defineMatrix'

export default defineMatrix(() => [
  [
    {
      provider: 'postgresql',
      url: 'postgresql://invalid:invalid@invalid.org:123/invalid',
    },
    // {
    //   provider: 'postgresql',
    //   providerFlavor: 'js_neon',
    //   url: 'postgresql://invalid:invalid@invalid.org:123/invalid',
    // },
    {
      provider: 'mysql',
      url: 'mysql://invalid:invalid@invalid:3307/invalid',
    },
    {
      provider: 'mysql',
      providerFlavor: 'vitess_8',
      url: 'mysql://invalid:invalid@invalid:3307/invalid',
    },
    {
      provider: 'mysql',
      providerFlavor: 'js_planetscale',
      url: 'mysql://invalid:invalid@invalid:3307/invalid',
    },
    {
      provider: 'cockroachdb',
      url: 'postgresql://invalid:invalid@invalid.org:123/invalid',
    },
  ],
])
