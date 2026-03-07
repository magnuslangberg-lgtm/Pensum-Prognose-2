import dynamic from 'next/dynamic'

const PensumPrognose = dynamic(
  () => import('../components/PensumPrognose'),
  { ssr: false, loading: () => <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',fontFamily:'sans-serif'}}>Laster Pensum Prognose...</div> }
)

export default function Home() {
  return <PensumPrognose />
}
