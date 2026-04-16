import { SampleService } from "../services/SampleServices";




export class SampleController {
  constructor( protected sampleService: SampleService){}

  sampleTodo(){
    return this.sampleService.doSampleTask();
  }
}