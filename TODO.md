## Must Do

- **FIXED:** Hardcoded `baseURL` in `client/src/services/api.js` has been updated to use `import.meta.env.VITE_API_URL` for correct deployment.

- **CRITICAL:** Ensure `npm install` has been run in both the `client` and `server` directories to install/update dependencies, and that the `package-lock.json` files are committed and up-to-date in the repository. Out-of-sync `package-lock.json` files can cause build failures on deployment.

  ```bash
  cd client
  npm install
  cd ../server
  npm install
  ```

- **CRITICAL:** **Verify all environment variables are correctly set on the Render dashboard for both the client and server services.**
  *   **For Server:** `DATABASE_URL`, `JWT_SECRET`, `EMAIL_USER`, `EMAIL_PASS`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_ID`.
  *   **For Client:** `VITE_API_URL`.
  Incorrect or missing environment variables are a very common cause of deployment failures.

## Deployment

The application is configured to be deployed on Render.
The build process is defined in the `render.yaml` file and will be executed automatically by Render.

To build and deploy the application, you need to:
1.  Push your code to the Git repository that is connected to your Render services.
2.  Render will automatically trigger the build and deployment process.

The build commands are:
-   **Server:** `npm install && npx prisma migrate deploy`
-   **Client:** `npm install && npm run build`