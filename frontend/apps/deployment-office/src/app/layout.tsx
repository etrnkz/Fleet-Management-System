importtype{Metadata}from'next'
import'./globals.css'

exportconstmetadata:Metadata={
title:'DeploymentOfficePortal-HUFMS',
description:'HaramayaUniversityFleetManagementSystem-DeploymentOfficePortal',
}

exportdefaultfunctionRootLayout({
children,
}:{
children:React.ReactNode
}){
return(
<htmllang="en">
<body>{children}</body>
</html>
)
}


