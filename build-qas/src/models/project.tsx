
export interface IProject{
    id: string;
    name: string;
    developer: string;
    contractor: string;
    dateOfAssessment: string;
    assessors: string;
    assessorType: string;
    type: string;
    status:string;
}
export interface IProjectWeightage{
    id: number,
    externalWallApplicable: number,
    externalWorksApplicable: number,
    roofApplicable: number,
    fieldWindowWTTApplicable: number,
    wetAreaWTTApplicable: number,
    architectWork:number,
    meWork:number,
    minimumCompliance: number
}


export interface IAssessmentWeightage{
    typeId:number,
    moduleId: number,
    moduleName: string,
    compliances:number,
    checks:number,
    percentage:number,
    weightage:number,
    score:number,
    nonCompliance:string
}
/*
export interface IProjectScoreSummary{
    id: number,
    assessmentWeightage:IAssessmentWeightage[];
}
export interface IProjectWeightage{
    id:number,
    moduleId: number,
    moduleName: string,
    compliances: number,
    checks: number,
    percentage: number,
    weightage: number,
    score: number,
    nonCompliance:string,
    isApplicable:boolean
}


export interface IProjectSummary extends IProject{
    architecturalWeightage:number,
    mAndeWeightage:number,
    assessmentSummary:IAssessmentSummary[],
    assessmentModule:IAssessmentModule[]
}

export interface IAssessmentModule {
    name:string,
    code:string,
    status:string
}

export interface IAssessmentCriteria {
    name:string,
    criterias:string[]
}

export interface IAssessmentResult {
    name:string,
    criterias:number[]
}

export interface IAssessmentSummary{
    srNo:number
    workType:string,
    details:IAssessmentArea[]
    weightage:number,
    score:number
}

export interface IAssessmentArea {
    srNo:number
    isParent:boolean,
    assessedArea:string,
    details:IAssessment[],
    
}

export interface IAssessment {
    srNo:number
    assessedArea:string,	
    compliances:number,
    checks:number,
    percentage:number
    weightage:number,
    score:number,
    nonCompliances:string
}

export interface  IAssessmentBlock{
    srNo:number;
    inspectionDate:string;
    block:string;
    results:IAssessmentResult[];
}

export interface IAssessmentExternalWall extends IAssessmentBlock{
    location:string;
    signature:string
}

*/