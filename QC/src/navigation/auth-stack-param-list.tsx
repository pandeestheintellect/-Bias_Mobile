import { IDefectDetail, IImages, IProject, IRFWIDetail } from "../utilities/project-functions";

export type AuthStackParamList = {
    Welcome: undefined;
    Tasks: {module:string};
    ProjectListing:{ type: string };
    QCListing:{ status: string, project: string };
    QCManage:{ defect: IDefectDetail };
    ImageViewer: {caption:string, image:string};
    Sync: {module:string};
    RFWIListing:{ status: string, project: string };
    RFWIManage:{ rfwi: IRFWIDetail,project?:IProject };
    DrawingViewer: {projectId:number, drawingId:number,caption:string};
  };
  