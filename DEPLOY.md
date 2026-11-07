# Deploy Aone Beauty (MongoDB + AWS ECS)

## Stack

- **MongoDB Atlas** — data
- **Auth.js** — admin login
- **S3** — product images
- **ECR** — Docker images
- **ECS Fargate + ALB** — run the site (standard; not App Runner)
- **GitHub Actions** — CI + deploy

## 1. MongoDB Atlas

1. Create cluster + DB user.
2. Network Access → allow `0.0.0.0/0` (needed for ECS tasks).
3. Put URI in `MONGODB_URI`.
4. Locally: `npm run db:seed`

## 2. S3 product images

1. Bucket in the same region you use for keys (this project: `us-east-1`).
2. Public `s3:GetObject` bucket policy on `/*`.
3. IAM user with `s3:PutObject` / `s3:GetObject` on the bucket.
4. Set `AWS_REGION`, `S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`.

## 3. ECR

Repository example: `munavvar/aonebeauty`  
URI: `ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/munavvar/aonebeauty`

## 4. ECS Fargate + ALB

1. Cluster (Fargate), e.g. `aonebeauty`
2. Task definition — container port **3000**, env from `.env.local`
3. Service + **internet-facing ALB**
   - Listener **80** → target port **3000**
   - Health check `/`
   - ALB security group: inbound HTTP 80 from `0.0.0.0/0`
4. Set task env `NEXT_PUBLIC_SITE_URL=http://YOUR-ALB-DNS`
5. Force new deployment after changing env

## 5. GitHub Actions secrets

Repo → **Settings → Secrets and variables → Actions**:

| Secret | Example / notes |
| --- | --- |
| `AWS_ACCESS_KEY_ID` | Deploy IAM user (ECR + ECS) |
| `AWS_SECRET_ACCESS_KEY` | Deploy IAM user |
| `AWS_REGION` | `us-east-1` |
| `ECR_REPOSITORY` | `munavvar/aonebeauty` |
| `ECS_CLUSTER` | cluster name (e.g. `aonebeauty`) |
| `ECS_SERVICE` | service name (e.g. `aonebeauty-web`) |
| `ECS_TASK_DEFINITION` | task **family** name (e.g. `aonebeauty`) |

Deploy IAM user needs at least:

- `AmazonEC2ContainerRegistryPowerUser` (or tighter ECR push)
- ECS: `RegisterTaskDefinition`, `UpdateService`, `DescribeTaskDefinition`, `DescribeServices`

CI (`ci.yml`): lint, test, build on PR/push.  
CD (`deploy.yml`): build/push image → new task definition revision → update ECS service.

## 6. Razorpay (optional)

Set keys in the task definition env.  
Webhook URL: `http://YOUR-ALB-DNS/api/payments/webhook` (use HTTPS when you add ACM).

## Smoke checklist

- [ ] Home / shop show Face Wash + Cream from Mongo
- [ ] Admin login works
- [ ] Product edit + stock adjust
- [ ] Image upload appears on storefront
- [ ] Checkout (Razorpay test) + order in admin
