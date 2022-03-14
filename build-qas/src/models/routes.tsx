
export enum AuthRoutes {
    intro = '/intro',
    dashboard = '/dashboard',
	assessmentListing = '/assessment-listing',
    assessmentSummary = '/assessment-summary/:project-id',
    internalFinishes = '/internal-finishes/:project-id',
    externalWall = '/external-wall/:project-id',
    externalWork = '/external-work/:project-id',
    roofConstruction = '/roof-construction/:project-id',
}

export enum NonAuthRoutes {
	login = '/login'
}
  
export interface IMenuItem {
    name:string,
    link:string,
    Icon:any 
}
export interface IMenu extends IMenuItem {
    items:IMenuItem[]
}

