import { Elysia, t } from "elysia";
import { AnalysisController } from "../controller/AnalysisController";
import { mainApp } from "../main";
import { authPlugin } from "../middleware/auth";

export function AnalysisRoutes({ analysisController }: { analysisController: AnalysisController }) {
  mainApp.group("/api/analysis", (app) => {
    app.use(authPlugin)
      .post("/run", async ({ userId, body, set }) => {
        return await analysisController.runAnalysis(userId, body, set);
      }, {
        body: t.Object({
          albumin: t.Number(),
          creatinine: t.Number(),
          glucose: t.Number(),
          crp: t.Number(),
          lymphocyte_percent: t.Number(),
          mcv: t.Number(),
          rdw: t.Number(),
          alkaline_phosphatase: t.Number(),
          wbc: t.Number(),
          age: t.Number(),
        }),
        detail: {
          tags: ['Analysis'],
          summary: 'Run Phenotypic Age Analysis',
          description: 'Calculates the Phenotypic Age based on 9 biomarkers and deducts 1 credit.',
          security: [{ BearerAuth: [] }]
        }
      })
      .post("/save", async ({ userId, body, set }) => {
        return await analysisController.saveAnalysis(userId, body.analysis_data, set);
      }, {
        body: t.Object({
          analysis_data: t.String()
        }),
        detail: {
          tags: ['Analysis'],
          summary: 'Save Analysis Result',
          description: 'Saves the analysis result into the user\'s history.',
          security: [{ BearerAuth: [] }]
        }
      })
      .get("/history", async ({ userId }) => {
        return await analysisController.getHistory(userId);
      }, {
        detail: {
          tags: ['Analysis'],
          summary: 'Get Analysis History',
          description: 'Retrieves all previously saved analysis results for the user.',
          security: [{ BearerAuth: [] }]
        }
      });

    return app;
  });
}
