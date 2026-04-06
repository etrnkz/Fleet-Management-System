'useclient'

import{useState,useEffect}from'react'
import{vehicleApi}from'@/lib/api'

exportdefaultfunctionVehiclesPage(){
const[searchQuery,setSearchQuery]=useState('')
const[statusFilter,setStatusFilter]=useState('all')
const[showDetailsModal,setShowDetailsModal]=useState(false)
const[selectedVehicle,setSelectedVehicle]=useState<any>(null)
const[showToast,setShowToast]=useState(false)
const[toastMessage,setToastMessage]=useState('')
const[toastType,setToastType]=useState<'success'|'error'>('success')
const[vehiclesList,setVehiclesList]=useState<any[]>([])
const[loading,setLoading]=useState(true)
const[error,setError]=useState<string|null>(null)

useEffect(()=>{
loadVehicles()
},[])

constloadVehicles=async()=>{
try{
setError(null)
constdata=awaitvehicleApi.getAllVehicles()
setVehiclesList(Array.isArray(data)?data:[])
}catch(err:any){
setError(err?.message||'Failedtoloadvehicles')
}finally{
setLoading(false)
}
}

//Mapbackendstatustodisplaylabelandbadgecolor
constgetStatusDisplay=(status:string)=>{
switch(status){
case'Active':return{label:'Available',color:'bg-emerald-100text-emerald-700'}
case'InUse':return{label:'InUse',color:'bg-blue-100text-blue-700'}
case'Maintenance':return{label:'Maintenance',color:'bg-orange-100text-orange-700'}
default:return{label:status,color:'bg-gray-100text-gray-700'}
}
}

//Toastnotificationhandler
constshowNotification=(message:string,type:'success'|'error'='success')=>{
setToastMessage(message)
setToastType(type)
setShowToast(true)
setTimeout(()=>setShowToast(false),3000)
}

//HandleViewDetails
consthandleViewDetails=(vehicle:any)=>{
setSelectedVehicle(vehicle)
setShowDetailsModal(true)
}

constgetFilteredVehicles=()=>{
returnvehiclesList.filter(vehicle=>{
const{label}=getStatusDisplay(vehicle.status)
constmatchesSearch=searchQuery===''||
(vehicle.id||'').toLowerCase().includes(searchQuery.toLowerCase())||
(vehicle.model||vehicle.name||'').toLowerCase().includes(searchQuery.toLowerCase())||
(vehicle.plateNumber||vehicle.plate||'').toLowerCase().includes(searchQuery.toLowerCase())

constmatchesStatus=statusFilter==='all'||
label.toLowerCase()===statusFilter.toLowerCase()||
vehicle.status.toLowerCase()===statusFilter.toLowerCase()

returnmatchesSearch&&matchesStatus
})
}

constfilteredVehicles=getFilteredVehicles()

conststats={
total:vehiclesList.length,
available:vehiclesList.filter(v=>v.status==='Active').length,
inUse:vehiclesList.filter(v=>v.status==='InUse').length,
maintenance:vehiclesList.filter(v=>v.status==='Maintenance').length
}

return(
<divclassName="p-4sm:p-6lg:p-8">
{/*ToastNotification*/}
{showToast&&(
<divclassName="fixedtop-4right-4z-50animate-fade-in">
<divclassName={`px-6py-3rounded-lgshadow-lg${toastType==='success'?'bg-emerald-600':'bg-red-600'}text-white`}>
{toastMessage}
</div>
</div>
)}

{/*AddVehicleModal-removed,read-onlyview*/}

{/*VehicleDetailsModal*/}
{showDetailsModal&&selectedVehicle&&(
<divclassName="fixedinset-0bg-blackbg-opacity-50backdrop-blur-smflexitems-centerjustify-centerz-50p-4">
<divclassName="bg-whiterounded-2xlshadow-2xlmax-w-2xlw-fullp-6max-h-[90vh]overflow-y-auto">
<divclassName="flexitems-centerjustify-betweenmb-6">
<h3className="text-xlfont-boldtext-gray-800">VehicleDetails</h3>
<button
onClick={()=>setShowDetailsModal(false)}
className="p-2hover:bg-gray-100rounded-lg"
>
<svgclassName="w-5h-5"fill="none"stroke="currentColor"viewBox="002424">
<pathstrokeLinecap="round"strokeLinejoin="round"strokeWidth={1.5}d="M618L186M66l1212"/>
</svg>
</button>
</div>

<divclassName="space-y-6">
<divclassName="h-48bg-gradient-to-brfrom-emerald-100to-teal-100rounded-xlflexitems-centerjustify-center">
<svgclassName="w-24h-24text-emerald-600"fill="currentColor"viewBox="002020">
<pathd="M816.5a1.51.5011-301.51.500130zM1516.5a1.51.5011-301.51.500130z"/>
<pathd="M34a11000-11v10a1100011h1.05a2.52.50014.90H10a110001-1V5a11000-1-1H3zM147a11000-11v6.05A2.52.500115.9516H17a110001-1v-5a11000-.293-.707l-2-2A11000157h-1z"/>
</svg>
</div>

<div>
<h4className="font-semiboldtext-gray-800mb-3">BasicInformation</h4>
<divclassName="gridgrid-cols-2gap-4">
<div>
<spanclassName="text-smtext-gray-600">VehicleID</span>
<pclassName="font-mediumtext-gray-900">{selectedVehicle.id}</p>
</div>
<div>
<spanclassName="text-smtext-gray-600">Model</span>
<pclassName="font-mediumtext-gray-900">{selectedVehicle.model||selectedVehicle.name}</p>
</div>
<div>
<spanclassName="text-smtext-gray-600">PlateNumber</span>
<pclassName="font-mediumtext-gray-900">{selectedVehicle.plateNumber||selectedVehicle.plate}</p>
</div>
<div>
<spanclassName="text-smtext-gray-600">Type</span>
<pclassName="font-mediumtext-gray-900">{selectedVehicle.type}</p>
</div>
<div>
<spanclassName="text-smtext-gray-600">Status</span>
<spanclassName={`inline-blockpx-3py-1rounded-fulltext-xsfont-medium${getStatusDisplay(selectedVehicle.status).color}`}>
{getStatusDisplay(selectedVehicle.status).label}
</span>
</div>
<div>
<spanclassName="text-smtext-gray-600">Capacity</span>
<pclassName="font-mediumtext-gray-900">{selectedVehicle.capacity||'N/A'}</p>
</div>
</div>
</div>
</div>

<divclassName="flexgap-3mt-6">
<button
onClick={()=>setShowDetailsModal(false)}
className="flex-1px-4py-2borderborder-gray-300rounded-lghover:bg-gray-50transition-colors"
>
Close
</button>
</div>
</div>
</div>
)}

{/*StatsCards*/}
<divclassName="gridgrid-cols-2lg:grid-cols-4gap-3sm:gap-4lg:gap-6mb-6sm:mb-8">
<divclassName="bg-whiterounded-xlp-6borderborder-gray-200">
<divclassName="flexitems-centerjustify-betweenmb-4">
<spanclassName="text-smtext-gray-600">TotalVehicles</span>
<divclassName="w-10h-10bg-gray-100rounded-lgflexitems-centerjustify-center">
<svgclassName="w-6h-6text-gray-600"fill="currentColor"viewBox="002020">
<pathd="M816.5a1.51.5011-301.51.500130zM1516.5a1.51.5011-301.51.500130z"/>
<pathd="M34a11000-11v10a1100011h1.05a2.52.50014.90H10a110001-1V5a11000-1-1H3zM147a11000-11v6.05A2.52.500115.9516H17a110001-1v-5a11000-.293-.707l-2-2A11000157h-1z"/>
</svg>
</div>
</div>
<h3className="text-3xlfont-boldtext-gray-900">{stats.total}</h3>
</div>

<divclassName="bg-whiterounded-xlp-6borderborder-gray-200">
<divclassName="flexitems-centerjustify-betweenmb-4">
<spanclassName="text-smtext-gray-600">Available</span>
<divclassName="w-10h-10bg-emerald-100rounded-lgflexitems-centerjustify-center">
<svgclassName="w-6h-6text-emerald-600"fill="none"stroke="currentColor"viewBox="002424">
<pathstrokeLinecap="round"strokeLinejoin="round"strokeWidth={1.5}d="M513l44L197"/>
</svg>
</div>
</div>
<h3className="text-3xlfont-boldtext-emerald-600">{stats.available}</h3>
</div>

<divclassName="bg-whiterounded-xlp-6borderborder-gray-200">
<divclassName="flexitems-centerjustify-betweenmb-4">
<spanclassName="text-smtext-gray-600">InUse</span>
<divclassName="w-10h-10bg-blue-100rounded-lgflexitems-centerjustify-center">
<svgclassName="w-6h-6text-blue-600"fill="none"stroke="currentColor"viewBox="002424">
<pathstrokeLinecap="round"strokeLinejoin="round"strokeWidth={1.5}d="M1310V3L414h7v7l9-11h-7z"/>
</svg>
</div>
</div>
<h3className="text-3xlfont-boldtext-blue-600">{stats.inUse}</h3>
</div>

<divclassName="bg-whiterounded-xlp-6borderborder-gray-200">
<divclassName="flexitems-centerjustify-betweenmb-4">
<spanclassName="text-smtext-gray-600">Maintenance</span>
<divclassName="w-10h-10bg-orange-100rounded-lgflexitems-centerjustify-center">
<svgclassName="w-6h-6text-orange-600"fill="none"stroke="currentColor"viewBox="002424">
<pathstrokeLinecap="round"strokeLinejoin="round"strokeWidth={1.5}d="M10.3254.317c.426-1.7562.924-1.7563.350a1.7241.7240002.5731.066c1.543-.943.31.8262.372.37a1.7241.7240001.0652.572c1.756.4261.7562.92403.35a1.7241.724000-1.0662.573c.941.543-.8263.31-2.372.37a1.7241.724000-2.5721.065c-.4261.756-2.9241.756-3.350a1.7241.724000-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.7241.724000-1.065-2.572c-1.756-.426-1.756-2.9240-3.35a1.7241.7240001.066-2.573c-.94-1.543.826-3.312.37-2.37.996.6082.296.072.572-1.065z"/>
<pathstrokeLinecap="round"strokeLinejoin="round"strokeWidth={1.5}d="M1512a33011-603300160z"/>
</svg>
</div>
</div>
<h3className="text-3xlfont-boldtext-orange-600">{stats.maintenance}</h3>
</div>
</div>

{/*Filters*/}
<divclassName="bg-whiterounded-xlp-4sm:p-6borderborder-gray-200mb-4sm:mb-6">
<divclassName="flexflex-colsm:flex-rowitems-stretchsm:items-centergap-3sm:gap-4">
<divclassName="flex-1">
<divclassName="relative">
<input
type="text"
placeholder="SearchbyID,model,plate,orlocation..."
value={searchQuery}
onChange={(e)=>setSearchQuery(e.target.value)}
className="w-fullpl-10pr-4py-2text-smborderborder-gray-300rounded-lgfocus:ring-2focus:ring-emerald-500focus:border-transparentoutline-none"
/>
<svgclassName="w-5h-5text-gray-400absoluteleft-3top-1/2-translate-y-1/2"fill="none"stroke="currentColor"viewBox="002424">
<pathstrokeLinecap="round"strokeLinejoin="round"strokeWidth={1.5}d="M2121l-6-6m2-5a77011-14077001140z"/>
</svg>
</div>
</div>

<select
value={statusFilter}
onChange={(e)=>setStatusFilter(e.target.value)}
className="px-4py-2text-smborderborder-gray-300rounded-lgfocus:ring-2focus:ring-emerald-500focus:border-transparentoutline-none"
>
<optionvalue="all">AllStatus</option>
<optionvalue="available">Available</option>
<optionvalue="inuse">InUse</option>
<optionvalue="maintenance">Maintenance</option>
</select>

<button
onClick={loadVehicles}
className="px-4py-2bg-emerald-500text-whiterounded-lgtext-smfont-mediumhover:bg-emerald-600transition-colorsflexitems-centerjustify-centergap-2">
<svgclassName="w-5h-5"fill="none"stroke="currentColor"viewBox="002424">
<pathstrokeLinecap="round"strokeLinejoin="round"strokeWidth={1.5}d="M44v5h.582m15.3562A8.0018.0010004.5829m00H9m1111v-5h-.581m00a8.0038.003001-15.357-2m15.3572H15"/>
</svg>
<spanclassName="hiddensm:inline">Refresh</span>
</button>
</div>
</div>

{/*LoadingState*/}
{loading&&(
<divclassName="gridgrid-cols-1sm:grid-cols-2lg:grid-cols-3gap-4sm:gap-6">
{[1,2,3,4,5,6].map(i=>(
<divkey={i}className="bg-whiterounded-xlborderborder-gray-200overflow-hiddenanimate-pulse">
<divclassName="h-48bg-gray-200"></div>
<divclassName="p-6space-y-3">
<divclassName="h-4bg-gray-200roundedw-3/4"></div>
<divclassName="h-3bg-gray-200roundedw-1/2"></div>
</div>
</div>
))}
</div>
)}

{/*ErrorState*/}
{error&&!loading&&(
<divclassName="bg-whiterounded-xlp-12text-centerborderborder-red-200">
<pclassName="text-red-600mb-4">{error}</p>
<buttononClick={loadVehicles}className="px-4py-2bg-emerald-500text-whiterounded-lghover:bg-emerald-600">
Retry
</button>
</div>
)}

{/*VehiclesGrid*/}
{!loading&&!error&&(
<divclassName="gridgrid-cols-1sm:grid-cols-2lg:grid-cols-3gap-4sm:gap-6">
{filteredVehicles.map((vehicle)=>(
<divkey={vehicle.id}className="bg-whiterounded-xlborderborder-gray-200overflow-hiddenhover:shadow-lgtransition-shadow">
<divclassName="h-48bg-gradient-to-brfrom-emerald-100to-teal-100flexitems-centerjustify-center">
<svgclassName="w-24h-24text-emerald-600"fill="currentColor"viewBox="002020">
<pathd="M816.5a1.51.5011-301.51.500130zM1516.5a1.51.5011-301.51.500130z"/>
<pathd="M34a11000-11v10a1100011h1.05a2.52.50014.90H10a110001-1V5a11000-1-1H3zM147a11000-11v6.05A2.52.500115.9516H17a110001-1v-5a11000-.293-.707l-2-2A11000157h-1z"/>
</svg>
</div>

<divclassName="p-6">
<divclassName="flexitems-startjustify-betweenmb-4">
<div>
<h3className="font-boldtext-gray-900text-lg">{vehicle.model||vehicle.name}</h3>
<pclassName="text-smtext-gray-600">{vehicle.id}•{vehicle.plateNumber||vehicle.plate}</p>
</div>
<spanclassName={`px-3py-1rounded-fulltext-xsfont-medium${getStatusDisplay(vehicle.status).color}`}>
{getStatusDisplay(vehicle.status).label}
</span>
</div>

<divclassName="space-y-3">
<divclassName="flexitems-centerjustify-betweentext-sm">
<spanclassName="text-gray-600">Type:</span>
<spanclassName="font-mediumtext-gray-900">{vehicle.type||'N/A'}</span>
</div>
<divclassName="flexitems-centerjustify-betweentext-sm">
<spanclassName="text-gray-600">Capacity:</span>
<spanclassName="font-mediumtext-gray-900">{vehicle.capacity||'N/A'}</span>
</div>
</div>

<divclassName="flexgap-2mt-6">
<button
onClick={()=>handleViewDetails(vehicle)}
className="flex-1px-4py-2bg-emerald-500text-whiterounded-lgfont-mediumhover:bg-emerald-600transition-colorstext-sm">
ViewDetails
</button>
</div>
</div>
</div>
))}
</div>
)}

{/*NoResults*/}
{!loading&&!error&&filteredVehicles.length===0&&(
<divclassName="bg-whiterounded-xlp-12text-centerborderborder-gray-200">
<svgclassName="w-16h-16text-gray-300mx-automb-4"fill="none"stroke="currentColor"viewBox="002424">
<pathstrokeLinecap="round"strokeLinejoin="round"strokeWidth={1.5}d="M912h6m-64h6m25H7a22001-2-2V5a220012-2h5.586a11001.707.293l5.4145.414a11001.293.707V19a22001-22z"/>
</svg>
<h3className="text-lgfont-mediumtext-gray-900mb-2">Novehiclesfound</h3>
<pclassName="text-gray-500">Tryadjustingyoursearchorfiltercriteria</p>
</div>
)}
</div>
)
}



