import { SampleController } from "../controller/Sample";
import { mainApp } from "../main";

export function MobileRoutes({
  sampleController,
}:{
  sampleController: SampleController,
}){
  mainApp.get("/mobile/sample", () => sampleController.sampleTodo());
}