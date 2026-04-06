'useclient'

import{useState,useEffect}from'react'
import{useRouter}from'next/navigation'
import{authApi}from'@/lib/api'

exportdefaultfunctionLoginPage(){
constrouter=useRouter()
const[email,setEmail]=useState('')
const[password,setPassword]=useState('')
const[rememberMe,setRememberMe]=useState(false)
const[showPassword,setShowPassword]=useState(false)
const[error,setError]=useState('')
const[isLoading,setIsLoading]=useState(false)

useEffect(()=>{
if(typeofwindow!=='undefined'){
constsaved=localStorage.getItem('do_rememberedEmail')
if(saved){setEmail(saved);setRememberMe(true)}
consttoken=localStorage.getItem('access_token')||sessionStorage.getItem('access_token')
if(token)router.replace('/dashboard')
}
},[])

consthandleSubmit=async(e:React.FormEvent)=>{
e.preventDefault()
setError('')
setIsLoading(true)
try{
constresponse=awaitauthApi.login(email,password)
conststorage=rememberMe?localStorage:sessionStorage
if(!rememberMe){
localStorage.removeItem('access_token')
localStorage.removeItem('accessToken')
localStorage.removeItem('user')
}
storage.setItem('access_token',response.access_token)
storage.setItem('accessToken',response.access_token)
if(response.user)storage.setItem('user',JSON.stringify(response.user))
if(rememberMe)localStorage.setItem('do_rememberedEmail',email)
elselocalStorage.removeItem('do_rememberedEmail')
router.push('/dashboard')
}catch(err:any){
setError(err.message||'Loginfailed.Pleasecheckyourcredentials.')
}finally{
setIsLoading(false)
}
}

return(
<divclassName="min-h-screenflex">
{isLoading&&(
<divclassName="fixedinset-0backdrop-blur-smbg-[#F8F9FA]/80flexitems-centerjustify-centerz-50">
<divclassName="bg-whiterounded-xlborderborder-gray-200p-8shadow-xlflexflex-colitems-center">
<divclassName="animate-spinrounded-fullh-12w-12border-2border-[#1B3D2F]border-t-transparent"/>
<pclassName="mt-4text-gray-500text-smfont-semibolduppercasetracking-wide">Authenticating…</p>
</div>
</div>
)}

{/*Formside*/}
<divclassName="w-fulllg:w-1/2flexitems-centerjustify-centerp-6lg:p-10bg-[#F8F9FA]">
<divclassName="w-fullmax-w-md">
<divclassName="mb-8">
<divclassName="flexitems-centergap-3mb-6">
<divclassName="w-11h-11bg-[#1B3D2F]rounded-lgflexitems-centerjustify-centershadow-sm">
<svgclassName="w-6h-6text-white"fill="currentColor"viewBox="002020">
<pathd="M816.5a1.51.5011-301.51.500130zM1516.5a1.51.5011-301.51.500130z"/>
<pathd="M34a11000-11v10a1100011h1.05a2.52.50014.90H10a110001-1V5a11000-1-1H3zM147a11000-11v6.05A2.52.500115.9516H17a110001-1v-5a11000-.293-.707l-2-2A11000157h-1z"/>
</svg>
</div>
<div>
<pclassName="text-[10px]font-semiboldtext-[#565F71]uppercasetracking-[0.15em]">FleetAuthority</p>
<h1className="text-xlfont-boldtext-[#1B3D2F]font-seriftracking-tight">DeploymentOffice</h1>
</div>
</div>
<h2className="text-2xlfont-boldtext-[#1B3D2F]font-seriftracking-tight">Securesignin</h2>
<pclassName="text-[#424845]text-smmt-2font-medium">Useyourdeploymentofficecredentialstoaccesstheportal.</p>
</div>

{error&&(
<divclassName="mb-4p-3bg-red-50borderborder-red-200rounded-lgtext-smtext-red-700">{error}</div>
)}

<formonSubmit={handleSubmit}className="space-y-5">
<div>
<labelhtmlFor="email"className="blocktext-xsfont-semiboldtext-[#424845]uppercasetracking-widemb-2">Emailaddress</label>
<inputtype="email"id="email"value={email}onChange={e=>setEmail(e.target.value)}
placeholder="deployment@haramaya.edu.et"
className="w-fullpx-4py-3borderborder-[#c1c8c4]rounded-lgfocus:ring-2focus:ring-[#1B3D2F]/30focus:border-[#1B3D2F]outline-nonetransition-allbg-white"
required/>
</div>

<div>
<labelhtmlFor="password"className="blocktext-xsfont-semiboldtext-[#424845]uppercasetracking-widemb-2">Password</label>
<divclassName="relative">
<inputtype={showPassword?'text':'password'}id="password"value={password}
onChange={e=>setPassword(e.target.value)}placeholder="Enterpassword"
className="w-fullpx-4py-3pr-12borderborder-[#c1c8c4]rounded-lgfocus:ring-2focus:ring-[#1B3D2F]/30focus:border-[#1B3D2F]outline-nonetransition-allbg-white"
required/>
<buttontype="button"onClick={()=>setShowPassword(!showPassword)}
className="absoluteright-3top-1/2-translate-y-1/2text-[#727975]hover:text-[#1B3D2F]">
{showPassword?(
<svgclassName="w-5h-5"fill="none"stroke="currentColor"viewBox="002424"><pathstrokeLinecap="round"strokeLinejoin="round"strokeWidth={1.5}d="M1512a33011-603300160z"/><pathstrokeLinecap="round"strokeLinejoin="round"strokeWidth={1.5}d="M2.45812C3.7327.9437.5235125c4.47808.2682.9439.5427-1.2744.057-5.0647-9.5427-4.4770-8.268-2.943-9.542-7z"/></svg>
):(
<svgclassName="w-5h-5"fill="none"stroke="currentColor"viewBox="002424"><pathstrokeLinecap="round"strokeLinejoin="round"strokeWidth={1.5}d="M13.87518.825A10.0510.050011219c-4.4780-8.268-2.943-9.543-7a9.979.970011.563-3.029m5.858.908a330114.2434.243M9.8789.878l4.2424.242M9.889.88l-3.29-3.29m7.5327.532l3.293.29M33l3.593.59m00A9.9539.953001125c4.47808.2682.9439.5437a10.02510.025001-4.1325.411m00L2121"/></svg>
)}
</button>
</div>
</div>

<divclassName="flexitems-center">
<inputtype="checkbox"id="remember"checked={rememberMe}onChange={e=>setRememberMe(e.target.checked)}
className="w-4h-4roundedborder-[#c1c8c4]text-[#1B3D2F]focus:ring-[#1B3D2F]"/>
<labelhtmlFor="remember"className="ml-2text-smtext-[#424845]">Keepmesignedin</label>
</div>

<buttontype="submit"disabled={isLoading}
className="w-fullbg-[#1B3D2F]text-whitepy-3rounded-lgfont-semiboldtext-smuppercasetracking-widehover:bg-[#152e22]transition-colorsdisabled:opacity-50disabled:cursor-not-allowed">
{isLoading?'Signingin…':'Signin'}
</button>
</form>
</div>
</div>

{/*Brandingside*/}
<divclassName="hiddenlg:flexlg:w-1/2relativebg-[#1B3D2F]flex-coljustify-centerpx-12text-whiteoverflow-hidden">
<divclassName="absoluteinset-0opacity-[0.07]bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%221%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]"/>
<divclassName="relativez-10max-w-md">
<pclassName="text-[#D1E1FF]text-xsfont-semibolduppercasetracking-[0.2em]mb-4">Officialaccess</p>
<h2className="text-3xlfont-boldfont-seriftracking-tightleading-tight">FleetManagementSystem</h2>
<pclassName="mt-4text-white/85text-smleading-relaxedfont-medium">
Allocatevehicles,assigndrivers,managetripdispatch,andoverseemaintenanceoperationsthroughthissecuredeploymentportal.
</p>
<divclassName="mt-10h-pxw-24bg-[#D1E1FF]/50"/>
<pclassName="mt-6text-xstext-white/60uppercasetracking-widestfont-semibold">Authorizedpersonnelonly</p>
</div>
</div>
</div>
)
}



