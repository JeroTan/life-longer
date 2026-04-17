import { AnalysisService } from "../services/AnalysisService";
import { env } from "cloudflare:workers";
import { Biomarkers } from "../lib/math/phenoage";

export class AnalysisController {
  constructor(protected analysisService: AnalysisService) {}

  async runAnalysis(userId: string, data: Biomarkers, set: any) {
    try {
      const result = await this.analysisService.runAnalysis(userId, data, env.DB);
      return result;
    } catch (err: any) {
      if (err.message === "Payment Required") {
        set.status = 402;
        return { error: err.message };
      }
      set.status = 500;
      return { error: "Internal Server Error" };
    }
  }

  async saveAnalysis(userId: string, analysisData: string, set: any) {
    try {
      await this.analysisService.saveAnalysis(userId, analysisData, env.DB);
      set.status = 201;
      return { message: "Created" };
    } catch (err: any) {
      if (err.message === "Storage limit reached") {
        set.status = 403;
        return { error: err.message };
      }
      set.status = 500;
      return { error: "Internal Server Error" };
    }
  }

  async getHistory(userId: string) {
    const history = await this.analysisService.getHistory(userId, env.DB);
    return { history };
  }
}
