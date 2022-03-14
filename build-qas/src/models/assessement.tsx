export interface IAssessment {
	id: number,
	name: string
}

export interface IAssessmentModule{
	assessmentId:number,
	assessmentName:string,
	id: number,
	name: string
}

export interface IAssessmentModuleProcess{
	assessmentId:number,
	assessmentName:string,
	moduleId: number,
	moduleName: string
	locationId:number,
	locationName:string,
	id: number,
	name: string
}

export interface IAssessmentLocation{
	assessmentId:number,
	assessmentName:string,
	id: number,
	name: string,
	type: string
}

export interface IModuleProcess{
	id: number,
	name: string,
	process:IProcess[]
}
export interface IProcess{
	id: number,
	name: string
}

export interface IJoint{
	id: number, //"AssessmentJointID": 3,
	name: string //"AssessmentJointName": "None",
}

export interface ILeak{
	id: number, //"AssessmentLeakID": 3,
	name: string //"AssessmentLeakName": "None",
}

export interface IWall{
	id: number, //"AssessmentWallID": 3,
	name: string //"AssessmentWallName": "None",
}

export interface IWindow{
	id: number, //"AssessmentWindowID": 3,
	name: string //"AssessmentWindowName": "None",
}

export interface IDirection{
	id: number, //"AssessmentWindowID": 3,
	name: string //"AssessmentWindowName": "None",
}