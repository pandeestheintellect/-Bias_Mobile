export const projectDetail=
{
    id:"BUILDQAS-008",
    name:"Project -1",
    developer:"IDP Industrial Development Sdn Bhd",
    contractor:"Allied Engineering Construction Sdn Bhd",
    dateOfAssessment:"18-Jan-2020",
    assessors:"1. Ji Su Jian2. Willie Koh",
    type:"CAT C - Private Housing",
    status:'In-Progress',
    isOffline:false,
    architecturalWeightage:98.10,
    mAndeWeightage:1.90,
    assessmentSummary:[
    {
        srNo:1.0,
        workType:'Architectural Works',
        details:[
        {
            srNo:1.1,
            isParent:true,
            assessedArea:'Internal Finishes',
            details:[
                {srNo:-1, assessedArea:'Floors',compliances: 10,checks: 10, percentage: 100.00,weightage: 20.50,score: 20.50,nonCompliances:''},
                {srNo:-1, assessedArea:'Internal Walls',compliances: 11,checks: 11, percentage: 100.00,weightage: 20.50,score: 20.50,nonCompliances:''}
            ]
        },
        {
            srNo:1.2,
            isParent:false,
            assessedArea:'External Wall',
            details:[
                {srNo:1.2, assessedArea:'External Wall',compliances: 10,checks: 10, percentage: 100.00,weightage: 20.50,score: 20.50,nonCompliances:''},
            ]
        },
        ],
        weightage:115.40,
        score:111.99
    },
    {
        srNo:2.0,
        workType:'M & E',
        details:[
        {
            srNo:2.1,
            isParent:false,
            assessedArea:'',
            details:[
                {srNo:-1, assessedArea:'M & E',compliances: 10,checks: 10, percentage: 100.00,weightage: 20.50,score: 20.50,nonCompliances:''},
            ]
        }
        ],
        weightage:90.40,
        score:111.99
    }
    
    ],
    assessmentModule:[
        {name:'Internal Finishes',code:'internal-finishes',status:'Not Applicable'},
        {name:'External Wall',code:'external-wall',status:'Applicable'},
        {name:'External Work',code:'external-work',status:'Applicable'},
        {name:'Roof Construction',code:'roof-construction',status:'Applicable'},
        {name:'External Wall',code:'External-Wall',status:'Not Applicable'}
    ]
}