# seismo-demo-shop

The demo app that [Seismo](https://github.com/NetPranav/Hackwave3.0) watches. A small Next.js shop that depends on four
fake third-party APIs (users, payments, shipping, orders) from `Hackwave3.0/services`.

| Page | Uses |
|---|---|
| `/checkout` | user name + email, payment amount × 1.18 (GST), payment status, shipment status |
| `/invoice` | user name, payment amount |
| `/orders` | orders list (`limit=500`) and their total |

## Run
```bash
cp .env.example .env        # point the *_API_URL at the fake services, SEISMO_* at the Seismo backend
npm install
npm run dev                 # http://localhost:3100
npm test                    # invoice + alias guarantees
```

## How Seismo is wired in
- `instrumentation.ts` starts the read-only, fail-open SDK (`@seismo/sdk`) once at server start.
- Every API client passes the parsed JSON through `withAliases(...)` (`lib/api/aliases.ts`), which applies the data rules in
  `seismo/aliases.json`. The file starts empty, so nothing changes until Seismo opens a fix PR that adds a rule.
- `seismo/aliases.test.ts` re-checks guarantees G1/G2 for every rule in this repo's CI.
- `seismo.config.json` maps env vars to provider names; `seismo.workflows.yml` groups files into user workflows.

The SDK is vendored as `vendor/seismo-sdk-0.1.0.tgz` (built from `Hackwave3.0/sdk-node`) until it is published to npm.
