'useclient'

import{useState,useEffect,useRef}from'react'
import{useRouter,usePathname}from'next/navigation'
importLinkfrom'next/link'
import{authApi,notificationApi}from'@/lib/api'

exportdefaultfunctionDashboardLayout({children}:{children:React.ReactNode}){
constrouter=useRouter()
constpathname=usePathname()
const[sidebarOpen,setSidebarOpen]=useState(false)
const[showNotifDropdown,setShowNotifDropdown]=useState(false)
const[showProfileDropdown,setShowProfileDropdown]=useState(false)
constnotifRef=useRef<HTMLDivElement>(null)
constprofileRef=useRef<HTMLDivElement>(null)
const[userData,setUserData]=useState<any>(null)
const[notifications,setNotifications]=useState<any[]>([])

useEffect(()=>{
consth=(e:MouseEvent)=>{
if(notifRef.current&&!notifRef.current.contains(e.targetasNode))setShowNotifDropdown(false)
if(profileRef.current&&!profileRef.current.contains(e.targetasNode))setShowProfileDropdown(false)
}
document.addEventListener('mousedown',h)
return()=>document.removeEventListener('mousedown',h)
},[])

useEffect(()=>{
loadData()
},[])

constloadData=async()=>{
try{
constuser=awaitauthApi.getCurrentUser()
setUserData(user)
}catch(err:any){
if(err?.message?.includes('401')||err?.message?.includes('Unauthorized')||err?.message?.includes('expired')){
router.push('/login')
}
}
try{
constnotifs=awaitnotificationApi.getNotifications()
setNotifications(Array.isArray(notifs)?notifs:[])
}catch{setNotifications([])}
}

consthandleMarkAsRead=async(id:string)=>{
awaitnotificationApi.markAsRead(id).catch(()=>{})
setNotifications(prev=>prev.map(n=>n.id===id?{...n,isRead:true}:n))
}

consthandleLogout=()=>{
;['access_token','accessToken','user'].forEach(k=>{localStorage.removeItem(k);sessionStorage.removeItem(k)})
router.push('/login')
}

constunreadCount=notifications.filter(n=>!n.isRead).length
constinitials=userData?.name?.split('').map((n:string)=>n[0]).join('').slice(0,2).toUpperCase()||'DO'

constnavItems=[
{name:'Dashboard',path:'/dashboard',icon:<svgclassName="w-5h-5"fill="none"stroke="currentColor"viewBox="002424"><pathstrokeLinecap="round"strokeLinejoin="round"strokeWidth={2}d="M46a220012-2h2a2200122v2a22001-22H6a22001-2-2V6zM146a220012-2h2a2200122v2a22001-22h-2a22001-2-2V6zM416a220012-2h2a2200122v2a22001-22H6a22001-2-2v-2zM1416a220012-2h2a2200122v2a22001-22h-2a22001-2-2v-2z"/></svg>},
{name:'Trips',path:'/trips',icon:<svgclassName="w-5h-5"fill="none"stroke="currentColor"viewBox="002424"><pathstrokeLinecap="round"strokeLinejoin="round"strokeWidth={2}d="M95H7a22000-22v12a2200022h10a220002-2V7a22000-2-2h-2M95a2200022h2a220002-2M95a220012-2h2a2200122"/></svg>},
{name:'Vehicles',path:'/vehicles',icon:<svgclassName="w-5h-5"fill="currentColor"viewBox="002020"><pathd="M816.5a1.51.5011-301.51.500130zM1516.5a1.51.5011-301.51.500130z"/><pathd="M34a11000-11v10a1100011h1.05a2.52.50014.90H10a110001-1V5a11000-1-1H3zM147a11000-11v6.05A2.52.500115.9516H17a110001-1v-5a11000-.293-.707l-2-2A11000157h-1z"/></svg>},
{name:'Drivers',path:'/drivers',icon:<svgclassName="w-5h-5"fill="none"stroke="currentColor"viewBox="002424"><pathstrokeLinecap="round"strokeLinejoin="round"strokeWidth={2}d="M124.354a4401105.292M1521H3v-1a66001120v1zm00h6v-1a66000-9-5.197M137a44011-804400180z"/></svg>},
{name:'Maintenance',path:'/maintenance',icon:<svgclassName="w-5h-5"fill="none"stroke="currentColor"viewBox="002424"><pathstrokeLinecap="round"strokeLinejoin="round"strokeWidth={2}d="M10.3254.317c.426-1.7562.924-1.7563.350a1.7241.7240002.5731.066c1.543-.943.31.8262.372.37a1.7241.7240001.0652.572c1.756.4261.7562.92403.35a1.7241.724000-1.0662.573c.941.543-.8263.31-2.372.37a1.7241.724000-2.5721.065c-.4261.756-2.9241.756-3.350a1.7241.724000-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.7241.724000-1.065-2.572c-1.756-.426-1.756-2.9240-3.35a1.7241.7240001.066-2.573c-.94-1.543.826-3.312.37-2.37.996.6082.296.072.572-1.065z"/><pathstrokeLinecap="round"strokeLinejoin="round"strokeWidth={2}d="M1512a33011-603300160z"/></svg>},
{name:'Reports',path:'/reports',icon:<svgclassName="w-5h-5"fill="none"stroke="currentColor"viewBox="002424"><pathstrokeLinecap="round"strokeLinejoin="round"strokeWidth={2}d="M917v-2m32v-4m34v-6m210H7a22001-2-2V5a220012-2h5.586a11001.707.293l5.4145.414a11001.293.707V19a22001-22z"/></svg>},
{name:'Settings',path:'/settings',icon:<svgclassName="w-5h-5"fill="none"stroke="currentColor"viewBox="002424"><pathstrokeLinecap="round"strokeLinejoin="round"strokeWidth={2}d="M10.3254.317c.426-1.7562.924-1.7563.350a1.7241.7240002.5731.066c1.543-.943.31.8262.372.37a1.7241.7240001.0652.572c1.756.4261.7562.92403.35a1.7241.724000-1.0662.573c.941.543-.8263.31-2.372.37a1.7241.724000-2.5721.065c-.4261.756-2.9241.756-3.350a1.7241.724000-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.7241.724000-1.065-2.572c-1.756-.426-1.756-2.9240-3.35a1.7241.7240001.066-2.573c-.94-1.543.826-3.312.37-2.37.996.6082.296.072.572-1.065z"/><pathstrokeLinecap="round"strokeLinejoin="round"strokeWidth={2}d="M1512a33011-603300160z"/></svg>},
]

constpageTitle=navItems.find(n=>n.path===pathname)?.name??'Dashboard'

return(
<divclassName="min-h-screenbg-[#F8F9FA]">
{sidebarOpen&&<divclassName="fixedinset-0bg-black/50z-40lg:hidden"onClick={()=>setSidebarOpen(false)}/>}

{/*Sidebar*/}
<asideclassName={`fixedinset-y-0left-0w-64bg-whiteborder-rborder-gray-200z-50flexflex-coltransformtransition-transformduration-300${sidebarOpen?'translate-x-0':'-translate-x-full'}lg:translate-x-0`}>
<divclassName="h-16flexitems-centergap-3px-6border-bborder-gray-200flex-shrink-0">
<divclassName="w-8h-8bg-[#1B3D2F]roundedflexitems-centerjustify-center">
<svgclassName="w-5h-5text-white"fill="currentColor"viewBox="002020">
<pathd="M816.5a1.51.5011-301.51.500130zM1516.5a1.51.5011-301.51.500130z"/>
<pathd="M34a11000-11v10a1100011h1.05a2.52.50014.90H10a110001-1V5a11000-1-1H3zM147a11000-11v6.05A2.52.500115.9516H17a110001-1v-5a11000-.293-.707l-2-2A11000157h-1z"/>
</svg>
</div>
<div>
<divclassName="font-semiboldtext-gray-900text-sm">HaramayaUniversity</div>
<divclassName="text-xstext-gray-500">DEPLOYMENTOFFICE</div>
</div>
</div>

<navclassName="flex-1overflow-y-autop-4space-y-1">
{navItems.map(item=>(
<Linkkey={item.path}href={item.path}onClick={()=>setSidebarOpen(false)}
className={`flexitems-centergap-3px-4py-3rounded-lgtransition-colorstext-sm${pathname===item.path?'bg-[#1B3D2F]/10text-[#1B3D2F]font-semibold':'text-gray-700hover:bg-gray-50'}`}>
{item.icon}
<span>{item.name}</span>
</Link>
))}
</nav>

<divclassName="p-4border-tborder-gray-200flex-shrink-0">
<divclassName="flexitems-centergap-3">
<divclassName="w-9h-9bg-[#1B3D2F]rounded-fullflexitems-centerjustify-centerflex-shrink-0">
<spanclassName="text-whitetext-xsfont-bold">{initials}</span>
</div>
<divclassName="min-w-0">
<pclassName="text-smfont-mediumtext-gray-900truncate">{userData?.name||'DeploymentOfficer'}</p>
<pclassName="text-xstext-gray-500truncate">{userData?.email||''}</p>
</div>
</div>
</div>
</aside>

{/*Main*/}
<divclassName="lg:pl-64min-h-screenflexflex-col">
{/*Header*/}
<headerclassName="fixedtop-0right-0left-0lg:left-64h-16bg-whiteborder-bborder-gray-200flexitems-centerjustify-betweenpx-4sm:px-6z-40">
<divclassName="flexitems-centergap-4">
<buttononClick={()=>setSidebarOpen(true)}className="lg:hiddenp-2text-gray-600hover:bg-gray-100rounded-lg">
<svgclassName="w-6h-6"fill="none"stroke="currentColor"viewBox="002424"><pathstrokeLinecap="round"strokeLinejoin="round"strokeWidth={2}d="M46h16M412h16M418h16"/></svg>
</button>
<h1className="text-lgfont-semiboldtext-gray-900">{pageTitle}</h1>
</div>

<divclassName="flexitems-centergap-2">
{/*Notifications*/}
<divclassName="relative"ref={notifRef}>
<buttononClick={()=>setShowNotifDropdown(p=>!p)}className="relativep-2text-gray-600hover:bg-gray-100rounded-lg">
<svgclassName="w-5h-5"fill="none"stroke="currentColor"viewBox="002424"><pathstrokeLinecap="round"strokeLinejoin="round"strokeWidth={2}d="M1517h5l-1.405-1.405A2.0322.0320011814.158V11a6.0026.002000-4-5.659V5a22010-40v.341C7.676.16568.388611v3.159c0.538-.2141.055-.5951.436L417h5m60v1a33011-60v-1m60H9"/></svg>
{unreadCount>0&&<spanclassName="absolutetop-1right-1w-4h-4bg-red-500rounded-fullflexitems-centerjustify-centertext-whitetext-[10px]font-bold">{unreadCount>9?'9+':unreadCount}</span>}
</button>
{showNotifDropdown&&(
<divclassName="absoluteright-0mt-2w-80bg-whiterounded-xlshadow-2xlborderborder-gray-200z-50max-h-96overflow-y-auto">
<divclassName="px-4py-3border-bborder-gray-200flexitems-centerjustify-between">
<h3className="text-smfont-semiboldtext-gray-900">Notifications</h3>
<spanclassName={`text-xspx-2py-0.5rounded-fullfont-medium${unreadCount>0?'bg-red-100text-red-700':'bg-gray-100text-gray-500'}`}>{unreadCount}new</span>
</div>
{notifications.length===0
?<divclassName="p-8text-centertext-smtext-gray-400">Nonotifications</div>
:notifications.slice(0,15).map(n=>(
<divkey={n.id}onClick={()=>handleMarkAsRead(n.id)}
className={`p-4border-bborder-gray-100hover:bg-gray-50cursor-pointer${!n.isRead?'bg-blue-50border-l-4border-l-[#1B3D2F]':''}`}>
<pclassName="text-smfont-mediumtext-gray-900">{n.title||n.type}</p>
<pclassName="text-xstext-gray-500mt-0.5">{n.message}</p>
<pclassName="text-xstext-gray-400mt-1">{newDate(n.sentAt||n.createdAt).toLocaleString()}</p>
</div>
))}
</div>
)}
</div>

{/*Profile*/}
<divclassName="relative"ref={profileRef}>
<buttononClick={()=>setShowProfileDropdown(p=>!p)}className="flexitems-centergap-2hover:bg-gray-50rounded-lgp-1.5">
<divclassName="w-8h-8bg-[#1B3D2F]rounded-fullflexitems-centerjustify-center">
<spanclassName="text-whitetext-xsfont-bold">{initials}</span>
</div>
<divclassName="hiddensm:blocktext-left">
<pclassName="text-smfont-mediumtext-gray-900leading-tight">{userData?.name||'DeploymentOfficer'}</p>
<pclassName="text-xstext-gray-500">DeploymentOffice</p>
</div>
<svgclassName="w-4h-4text-gray-400hiddensm:block"fill="none"stroke="currentColor"viewBox="002424"><pathstrokeLinecap="round"strokeLinejoin="round"strokeWidth={2}d="M199l-77-7-7"/></svg>
</button>
{showProfileDropdown&&(
<>
<divclassName="fixedinset-0z-30"onClick={()=>setShowProfileDropdown(false)}/>
<divclassName="absoluteright-0mt-2w-52bg-whiterounded-xlshadow-2xlborderborder-gray-200z-40overflow-hidden">
<divclassName="p-4bg-[#1B3D2F]/5border-bborder-gray-200">
<divclassName="flexitems-centergap-3">
<divclassName="w-10h-10bg-[#1B3D2F]rounded-fullflexitems-centerjustify-centerflex-shrink-0">
<spanclassName="text-whitefont-boldtext-sm">{initials}</span>
</div>
<divclassName="min-w-0">
<pclassName="text-smfont-semiboldtext-gray-900truncate">{userData?.name||'DeploymentOfficer'}</p>
<pclassName="text-xstext-gray-500truncate">{userData?.email||''}</p>
</div>
</div>
</div>
<divclassName="p-2">
<Linkhref="/settings"onClick={()=>setShowProfileDropdown(false)}
className="flexitems-centergap-3px-4py-2.5text-gray-700hover:bg-gray-50rounded-lgtext-sm">
<svgclassName="w-4h-4text-gray-400"fill="none"stroke="currentColor"viewBox="002424"><pathstrokeLinecap="round"strokeLinejoin="round"strokeWidth={2}d="M10.3254.317c.426-1.7562.924-1.7563.350a1.7241.7240002.5731.066c1.543-.943.31.8262.372.37a1.7241.7240001.0652.572c1.756.4261.7562.92403.35a1.7241.724000-1.0662.573c.941.543-.8263.31-2.372.37a1.7241.724000-2.5721.065c-.4261.756-2.9241.756-3.350a1.7241.724000-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.7241.724000-1.065-2.572c-1.756-.426-1.756-2.9240-3.35a1.7241.7240001.066-2.573c-.94-1.543.826-3.312.37-2.37.996.6082.296.072.572-1.065z"/><pathstrokeLinecap="round"strokeLinejoin="round"strokeWidth={2}d="M1512a33011-603300160z"/></svg>
Settings
</Link>
</div>
<divclassName="p-2border-tborder-gray-100">
<buttononClick={handleLogout}className="w-fullflexitems-centergap-3px-4py-2.5text-red-600hover:bg-red-50rounded-lgtext-sm">
<svgclassName="w-4h-4"fill="none"stroke="currentColor"viewBox="002424"><pathstrokeLinecap="round"strokeLinejoin="round"strokeWidth={2}d="M1716l4-4m00l-4-4m44H7m64v1a33001-33H6a33001-3-3V7a330013-3h4a3300133v1"/></svg>
Signout
</button>
</div>
</div>
</>
)}
</div>
</div>
</header>

<mainclassName="flex-1p-4sm:p-6pt-20">
{children}
</main>
</div>
</div>
)
}


