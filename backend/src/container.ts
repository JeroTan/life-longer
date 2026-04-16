import Elysia from "elysia";
import { SampleService } from "./services/SampleServices";
import { SampleController } from "./controller/Sample";
import { MobileRoutes } from "./routes/sample.routes";



export function Container(app:Elysia){
  //Services
  const services = {
    sample: new SampleService()
  }
  //Controller
  const controllers = {
    sample: new  SampleController(services.sample)
  }
  //Routes
  MobileRoutes({sampleController: controllers.sample})
  
  return app;
}