import Elysia from "elysia";
import { SampleService } from "./services/SampleServices";
import { SampleController } from "./controller/Sample";
import { MobileRoutes } from "./routes/sample.routes";

import { AuthService } from "./services/AuthService";
import { AuthController } from "./controller/AuthController";
import { AuthRoutes } from "./routes/auth.routes";

import { UserService } from "./services/UserService";
import { UserController } from "./controller/UserController";
import { UserRoutes } from "./routes/user.routes";

import { PaymentService } from "./services/PaymentService";
import { PaymentController } from "./controller/PaymentController";
import { PaymentRoutes } from "./routes/payment.routes";

import { AnalysisService } from "./services/AnalysisService";
import { AnalysisController } from "./controller/AnalysisController";
import { AnalysisRoutes } from "./routes/analysis.routes";

export function Container(app: any) {
  // Services
  const services = {
    sample: new SampleService(),
    auth: new AuthService(),
    user: new UserService(),
    payment: new PaymentService(),
    analysis: new AnalysisService(),
  };

  // Controllers
  const controllers = {
    sample: new SampleController(services.sample),
    auth: new AuthController(services.auth),
    user: new UserController(services.user),
    payment: new PaymentController(services.payment),
    analysis: new AnalysisController(services.analysis),
  };

  // Routes
  MobileRoutes({ sampleController: controllers.sample });
  AuthRoutes({ authController: controllers.auth });
  UserRoutes({ userController: controllers.user });
  PaymentRoutes({ paymentController: controllers.payment });
  AnalysisRoutes({ analysisController: controllers.analysis });

  return app;
}
