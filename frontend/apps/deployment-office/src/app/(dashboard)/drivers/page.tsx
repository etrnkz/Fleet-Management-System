'useclient'
import{useState,useEffect}from'react'
import{driverApi}from'@/lib/api'

exportdefaultfunctionDriversPage(){
const[driversList,setDriversList]=useState<any[]>([])
const[loading,setLoading]=useState(true)
const[error,setError]=useState<string|null>(null)

useEffect(()=>{loadDrivers()},[])

constloadDrivers=async()=>{
try{
constdata=awaitdriverApi.getAllDrivers()
setDriversList(Array.isArray(data)?data:[])
}catch(err:any){
setError(err?.message||'Failedtoloaddrivers')
}finally{
setLoading(false)
}
}

if(loading)return<divclassName="p-8text-center"><divclassName="animate-spinrounded-fullh-12w-12border-b-2border-emerald-600mx-auto"></div></div>
if(error)return<divclassName="p-8text-centertext-red-600">{error}<buttononClick={loadDrivers}className="ml-2underline">Retry</button></div>

return(
<divclassName="p-6">
<h1className="text-2xlfont-boldtext-gray-800mb-6">Drivers</h1>
<divclassName="gridgrid-cols-1md:grid-cols-2lg:grid-cols-3gap-4">
{driversList.map(driver=>{
constname=driver.user?.name||driver.name||'Unknown'
return(
<divkey={driver.id}className="bg-whiterounded-xlborderborder-gray-200p-6">
<divclassName="flexitems-centergap-3mb-3">
<divclassName="w-12h-12bg-emerald-100rounded-fullflexitems-centerjustify-center">
<spanclassName="text-emerald-700font-boldtext-lg">{name.charAt(0).toUpperCase()}</span>
</div>
<div>
<pclassName="font-semiboldtext-gray-900">{name}</p>
<pclassName="text-xstext-gray-500">{driver.user?.phoneNumber||'N/A'}</p>
</div>
</div>
<divclassName="space-y-1text-sm">
<divclassName="flexjustify-between"><spanclassName="text-gray-500">License:</span><span>{driver.licenseNumber||'N/A'}</span></div>
<divclassName="flexjustify-between"><spanclassName="text-gray-500">Status:</span><span>{driver.status}</span></div>
<divclassName="flexjustify-between"><spanclassName="text-gray-500">Rating:</span><span>{driver.rating||'N/A'}</span></div>
</div>
</div>
)
})}
{driversList.length===0&&<pclassName="col-span-3text-centertext-gray-500py-12">Nodriversfound</p>}
</div>
</div>
)
}


