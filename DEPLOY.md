# Deploy Aone Beauty (MongoDB + AWS)

## 1. MongoDB Atlas

1. Create a free/shared cluster.
2. Network Access → allow App Runner egress (or `0.0.0.0/0` for bootstrap).
3. Database Access → create a user.
4. Copy the SRV URI into `MONGODB_URI`.
5. Locally:

```bash
# .env.local must include MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD, AUTH_SECRET
npm run db:seed
```

## 2. S3 product images

1. Create bucket (e.g. `aonebeauty-product-images`) in `ap-south-1`.
2. Block public access off **or** use a bucket policy for `s3:GetObject` on `/*`.
3. IAM user/role needs `s3:PutObject` (+ `s3:PutObjectAcl` if using `public-read`).
4. Set `AWS_REGION`, `S3_BUCKET`, and credentials (or App Runner instance role).

## 3. Auth

1. `openssl rand -base64 32` → `AUTH_SECRET`
2. `ADMIN_EMAIL` must match the seeded admin email
3. Login at `/admin`

## 4. Razorpay

Set `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, optional webhook secret.  
Webhook URL: `https://YOUR_APP_RUNNER_URL/api/payments/webhook`

## 5. Docker + ECR + App Runner

1. Create ECR repository (name → GitHub secret `ECR_REPOSITORY`).
2. Create App Runner service from that ECR image, port **3000**.
3. Add runtime env/secrets on the service: Mongo, Auth, S3, Razorpay, `NEXT_PUBLIC_SITE_URL`.
4. Copy service ARN → GitHub secret `APP_RUNNER_SERVICE_ARN`.

## 6. GitHub Actions secrets

| Secret | Purpose |
| --- | --- |
| `AWS_ACCESS_KEY_ID` | Deploy IAM user |
| `AWS_SECRET_ACCESS_KEY` | Deploy IAM user |
| `AWS_REGION` | e.g. `ap-south-1` |
| `ECR_REPOSITORY` | ECR repo name |
| `APP_RUNNER_SERVICE_ARN` | Triggers redeploy after push |

CI (`ci.yml`) runs lint, test, build on every PR/push to `main`.  
CD (`deploy.yml`) builds/pushes the image and starts an App Runner deployment.

## Smoke checklist

- [ ] Home / shop show Face Wash + Cream from Mongo
- [ ] Admin login works
- [ ] Product edit + stock adjust
- [ ] Image upload appears on storefront
- [ ] Checkout (Razorpay test) + order appears in admin
