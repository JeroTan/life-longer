import { SampleController } from "../controller/Sample";
import { mainApp } from "../main";

export function MobileRoutes({ sampleController }: { sampleController: SampleController }) {
  mainApp.group("/sample", (app) => {
    app.get("/", () => sampleController.sampleTodo(), {
      tags: [""],
      detail: {
        description: "Sample API",
        summary: "This is a sample API endpoint",
      },
    });

    return app;
  });
}
