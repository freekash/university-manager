## Must Do

- Run `npm install` in the `client` directory to install the new dependencies and update the existing ones. The application will not work without this step.

  ```bash
  cd client
  npm install
  ```

## Deployment

The application is configured to be deployed on Render.
The build process is defined in the `render.yaml` file and will be executed automatically by Render.

To build and deploy the application, you need to:
1.  Push your code to the Git repository that is connected to your Render services.
2.  Render will automatically trigger the build and deployment process.

The build commands are:
-   **Server:** `npm install && npx prisma migrate deploy`
-   **Client:** `npm install && npm run build`