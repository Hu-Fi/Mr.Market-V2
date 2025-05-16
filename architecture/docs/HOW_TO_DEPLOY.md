## Manual Deployment to Vercel via Dashboard

This project supports deployment to **Vercel**, and includes `vercel.json` files for each backend app: `mm-backend` and `tse-backend`.

### Steps to Deploy

1. **Open the Vercel Dashboard**
   Go to [Vercel Dashboard](https://vercel.com/dashboard), log in, and click **"Add New Project"**.

2. **Import the GitHub Repository**
   Import the repository containing your project.

3. **Set the Root Directory**
   During setup, Vercel will ask for the root directory:

    * For `mm-backend`: use `packages/mm-backend`
    * For `tse-backend`: use `packages/tse-backend`
      Vercel will automatically detect and apply the `vercel.json` file inside that directory.

4. **Set Required Environment Variables** (See below for `mm-backend`)

5. **Provision Databases (PostgreSQL and Redis)**
   In the **"Add Storage"** section of the project setup:

    * Select **PostgreSQL** – Vercel will provision a database for you.
    * Select **Redis** also.
    * After creation, manually connect the database instance to the projects.

---

## Deploy with Vercel Button

You can also start deployments quickly using the Vercel deploy buttons below:

| Project         | Deploy                                                                                                                                                                                                                                                                                                                                                             |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **mm-backend**  | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FHu-Fi%2FMr.Market-V2%2Ftree%2Fmain%2Fpackages%2Fmm-backend&env=ADMIN_PASSWORD,MIXIN_APP_ID,MIXIN_SESSION_ID,MIXIN_SERVER_PUBLIC_KEY,MIXIN_SESSION_PRIVATE_KEY,MIXIN_SPEND_PRIVATE_KEY,MIXIN_OAUTH_SECRET) |
| **tse-backend** | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FHu-Fi%2FMr.Market-V2%2Ftree%2Fmain%2Fpackages%2Ftse-backend)                                                                                                                                                                             |

> **Tip:** Start by deploying `mm-backend`, then deploy `tse-backend`.

---

### Required Environment Variables for `mm-backend`

| Variable                    | Description                          |
| --------------------------- | ------------------------------------ |
| `ADMIN_PASSWORD`            | Admin password for protected routes. |
| `MIXIN_APP_ID`              | Mixin application ID.                |
| `MIXIN_SESSION_ID`          | Mixin session identifier.            |
| `MIXIN_SERVER_PUBLIC_KEY`   | Mixin server public key.             |
| `MIXIN_SESSION_PRIVATE_KEY` | Mixin session private key.           |
| `MIXIN_SPEND_PRIVATE_KEY`   | Mixin spend private key.             |
| `MIXIN_OAUTH_SECRET`        | OAuth secret for Mixin integration.  |

---
